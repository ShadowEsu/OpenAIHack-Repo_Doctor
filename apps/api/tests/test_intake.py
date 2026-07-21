from __future__ import annotations

import io
import zipfile

import pytest

from app.services.intake import IntakeError, extract_zip_upload, parse_github_url


def _zip_bytes(entries: dict[str, str]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        for name, content in entries.items():
            zf.writestr(name, content)
    return buffer.getvalue()


def test_parse_github_url_valid():
    assert parse_github_url("https://github.com/openai/openai-python") == ("openai", "openai-python")
    assert parse_github_url("https://github.com/openai/openai-python.git") == ("openai", "openai-python")


@pytest.mark.parametrize("url", [
    "http://github.com/a/b",           # not https
    "https://gitlab.com/a/b",          # wrong host
    "https://github.com/onlyowner",    # missing repo
    "notaurl",
])
def test_parse_github_url_invalid(url):
    with pytest.raises(IntakeError):
        parse_github_url(url)


def test_extract_zip_upload_basic():
    data = _zip_bytes({"project/main.py": "print('hi')\n", "project/README.md": "# hi\n"})
    repo_dir, name = extract_zip_upload(data, "project.zip")
    assert (repo_dir / "main.py").exists()
    assert name == "project"


def test_extract_zip_rejects_path_traversal():
    data = _zip_bytes({"../evil.py": "print('evil')\n"})
    with pytest.raises(IntakeError):
        extract_zip_upload(data, "evil.zip")


def test_extract_zip_rejects_absolute_paths():
    data = _zip_bytes({"/etc/passwd": "root\n"})
    with pytest.raises(IntakeError):
        extract_zip_upload(data, "abs.zip")


def test_extract_zip_rejects_non_zip():
    with pytest.raises(IntakeError):
        extract_zip_upload(b"this is not a zip file", "fake.zip")
