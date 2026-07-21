"""Safe working copies and patch application.

The original repository workspace is never modified. Treatments are applied
to an isolated working copy; every target path is validated to stay inside
the copy.
"""
from __future__ import annotations

import difflib
import shutil
import uuid
from pathlib import Path

from app.core.config import get_settings
from app.services.inventory import IGNORED_DIRS
from app.treatments.base import FileOperation


class PatchError(Exception):
    pass


def create_working_copy(repo_dir: Path) -> Path:
    settings = get_settings()
    target = settings.workspace_path / "working_copies" / uuid.uuid4().hex
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(
        repo_dir,
        target,
        ignore=shutil.ignore_patterns(*IGNORED_DIRS),
        symlinks=False,
    )
    return target


def _safe_target(working_copy: Path, rel_path: str) -> Path:
    if rel_path.startswith(("/", "\\")) or ".." in Path(rel_path).parts:
        raise PatchError(f"Unsafe patch path rejected: {rel_path}")
    target = (working_copy / rel_path).resolve()
    if not str(target).startswith(str(working_copy.resolve())):
        raise PatchError(f"Patch path escapes the working copy: {rel_path}")
    return target


def compute_diff(repo_dir: Path, operations: list[FileOperation]) -> tuple[str, int, int]:
    """Build a unified diff for the proposal without touching any files."""
    diff_chunks: list[str] = []
    insertions = 0
    deletions = 0
    for op in operations:
        original_path = repo_dir / op.path
        old_lines: list[str] = []
        if original_path.exists():
            old_lines = original_path.read_text(encoding="utf-8", errors="replace").splitlines(keepends=True)
        new_lines: list[str] = []
        if op.operation != "delete" and op.new_content is not None:
            new_lines = op.new_content.splitlines(keepends=True)
        diff = list(difflib.unified_diff(
            old_lines, new_lines,
            fromfile=f"a/{op.path}" if old_lines else "/dev/null",
            tofile=f"b/{op.path}" if op.operation != "delete" else "/dev/null",
        ))
        for line in diff:
            if line.startswith("+") and not line.startswith("+++"):
                insertions += 1
            elif line.startswith("-") and not line.startswith("---"):
                deletions += 1
        diff_chunks.append("".join(diff))
    return "\n".join(diff_chunks), insertions, deletions


def apply_operations(working_copy: Path, operations: list[FileOperation]) -> None:
    for op in operations:
        target = _safe_target(working_copy, op.path)
        if op.operation == "delete":
            if target.exists():
                target.unlink()
        elif op.operation in ("create", "modify"):
            if op.new_content is None:
                raise PatchError(f"Operation {op.operation} on {op.path} has no content.")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(op.new_content, encoding="utf-8")
        else:
            raise PatchError(f"Unknown patch operation: {op.operation}")


def remove_working_copy(path: str | Path) -> None:
    settings = get_settings()
    resolved = Path(path).resolve()
    root = (settings.workspace_path / "working_copies").resolve()
    if str(resolved).startswith(str(root)) and resolved != root:
        shutil.rmtree(resolved, ignore_errors=True)


def zip_working_copy(working_copy: Path) -> Path:
    """Zip a working copy for download; returns the archive path."""
    settings = get_settings()
    archive_dir = settings.workspace_path / "downloads"
    archive_dir.mkdir(parents=True, exist_ok=True)
    base_name = archive_dir / working_copy.name
    archive = shutil.make_archive(str(base_name), "zip", root_dir=working_copy)
    return Path(archive)
