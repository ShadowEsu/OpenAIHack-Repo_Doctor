"""Repository intake: public GitHub clone and safe ZIP extraction.

All repositories are placed in an isolated workspace directory. ZIP archives
are validated against zip-slip, symlinks, oversized payloads, and excessive
file counts before extraction.
"""
from __future__ import annotations

import logging
import re
import shutil
import subprocess
import uuid
import zipfile
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)

GITHUB_URL_RE = re.compile(
    r"^https://github\.com/(?P<owner>[A-Za-z0-9_.-]+)/(?P<repo>[A-Za-z0-9_.-]+?)(\.git)?/?$"
)


class IntakeError(Exception):
    """User-facing intake failure with an explanation."""


def _new_workspace() -> Path:
    settings = get_settings()
    ws = settings.workspace_path / uuid.uuid4().hex
    ws.mkdir(parents=True, exist_ok=False)
    return ws


def parse_github_url(url: str) -> tuple[str, str]:
    match = GITHUB_URL_RE.match(url.strip())
    if not match:
        raise IntakeError(
            "That does not look like a public GitHub repository URL. "
            "Expected a URL like https://github.com/owner/repository"
        )
    return match.group("owner"), match.group("repo")


def clone_github_repository(url: str) -> tuple[Path, str, str | None]:
    """Shallow-clone a public GitHub repository into an isolated workspace.

    Returns (workspace_path, repo_name, default_branch).
    """
    settings = get_settings()
    owner, repo = parse_github_url(url)
    workspace = _new_workspace()
    clone_url = f"https://github.com/{owner}/{repo}.git"
    try:
        subprocess.run(
            [
                "git", "clone",
                "--depth", "1",
                "--single-branch",
                "--no-tags",
                "--config", "core.hooksPath=/dev/null",
                clone_url,
                str(workspace / "repo"),
            ],
            check=True,
            capture_output=True,
            timeout=settings.clone_timeout_seconds,
            env={"GIT_TERMINAL_PROMPT": "0", "PATH": "/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin"},
        )
    except subprocess.TimeoutExpired as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise IntakeError("Cloning the repository timed out. It may be too large for examination.") from exc
    except subprocess.CalledProcessError as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        stderr = (exc.stderr or b"").decode(errors="replace")
        if "not found" in stderr.lower() or "could not read" in stderr.lower():
            raise IntakeError(
                "The repository could not be accessed. It may be private or the URL may be wrong. "
                "Repo Doctor currently supports public GitHub repositories only."
            ) from exc
        raise IntakeError("Cloning the repository failed. Please verify the URL and try again.") from exc

    repo_dir = workspace / "repo"
    default_branch = None
    try:
        result = subprocess.run(
            ["git", "-C", str(repo_dir), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, timeout=10, check=True,
        )
        default_branch = result.stdout.decode().strip() or None
    except Exception:  # noqa: BLE001 - branch detection is best-effort
        pass

    _enforce_size_limits(repo_dir)
    return repo_dir, repo, default_branch


def extract_zip_upload(zip_bytes: bytes, filename: str) -> tuple[Path, str]:
    """Safely extract an uploaded ZIP archive into an isolated workspace."""
    settings = get_settings()
    max_upload = settings.max_upload_size_mb * 1024 * 1024
    if len(zip_bytes) > max_upload:
        raise IntakeError(f"The upload exceeds the {settings.max_upload_size_mb} MB size limit.")

    workspace = _new_workspace()
    zip_path = workspace / "upload.zip"
    zip_path.write_bytes(zip_bytes)
    repo_dir = workspace / "repo"
    repo_dir.mkdir()

    max_extracted = settings.max_extracted_size_mb * 1024 * 1024
    total_size = 0
    file_count = 0
    try:
        with zipfile.ZipFile(zip_path) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                file_count += 1
                if file_count > settings.max_file_count:
                    raise IntakeError(f"The archive contains more than {settings.max_file_count} files.")
                total_size += info.file_size
                if total_size > max_extracted:
                    raise IntakeError(
                        f"The extracted archive exceeds the {settings.max_extracted_size_mb} MB limit."
                    )
                # zip-slip / absolute path protection
                name = info.filename
                if name.startswith("/") or name.startswith("\\") or ".." in Path(name).parts:
                    raise IntakeError("The archive contains unsafe file paths and was rejected.")
                # skip symlinks (mode stored in external_attr high bits)
                mode = (info.external_attr >> 16) & 0o170000
                if mode == 0o120000:
                    continue
                target = (repo_dir / name).resolve()
                if not str(target).startswith(str(repo_dir.resolve())):
                    raise IntakeError("The archive contains unsafe file paths and was rejected.")
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info) as src, open(target, "wb") as dst:
                    shutil.copyfileobj(src, dst, length=1024 * 1024)
    except zipfile.BadZipFile as exc:
        shutil.rmtree(workspace, ignore_errors=True)
        raise IntakeError("The uploaded file is not a valid ZIP archive.") from exc
    except IntakeError:
        shutil.rmtree(workspace, ignore_errors=True)
        raise
    finally:
        zip_path.unlink(missing_ok=True)

    # If the zip wraps everything in a single top-level folder, use that folder.
    entries = [p for p in repo_dir.iterdir() if not p.name.startswith("__MACOSX")]
    if len(entries) == 1 and entries[0].is_dir():
        repo_dir = entries[0]

    name = Path(filename).stem or "uploaded-repository"
    return repo_dir, name


def _enforce_size_limits(repo_dir: Path) -> None:
    settings = get_settings()
    max_bytes = settings.max_extracted_size_mb * 1024 * 1024
    total = 0
    count = 0
    for p in repo_dir.rglob("*"):
        if ".git" in p.parts:
            continue
        if p.is_file():
            count += 1
            total += p.stat().st_size
            if total > max_bytes or count > settings.max_file_count:
                shutil.rmtree(repo_dir.parent, ignore_errors=True)
                raise IntakeError(
                    "The repository is too large for examination "
                    f"(limits: {settings.max_extracted_size_mb} MB, {settings.max_file_count} files)."
                )


def remove_workspace(repo_dir: str) -> None:
    """Remove a repository workspace (the parent of the repo directory)."""
    settings = get_settings()
    path = Path(repo_dir).resolve()
    root = settings.workspace_path
    if str(path).startswith(str(root)) and path != root:
        # workspace layout: <root>/<uuid>/repo[/subdir]
        relative = path.relative_to(root)
        workspace = root / relative.parts[0]
        shutil.rmtree(workspace, ignore_errors=True)
