"""File inventory, language detection, and framework detection."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

IGNORED_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "out", "coverage",
    "vendor", ".cache", "__pycache__", ".venv", "venv", "env", ".mypy_cache",
    ".pytest_cache", ".turbo", ".idea", ".vscode", "target", ".svelte-kit",
}

LOCKFILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock",
    "Pipfile.lock", "Cargo.lock", "composer.lock", "bun.lockb", "uv.lock",
}

LANGUAGE_BY_EXT = {
    ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".ts": "TypeScript", ".tsx": "TypeScript",
    ".py": "Python", ".rb": "Ruby", ".go": "Go", ".rs": "Rust", ".java": "Java",
    ".kt": "Kotlin", ".swift": "Swift", ".php": "PHP", ".cs": "C#",
    ".c": "C", ".h": "C", ".cpp": "C++", ".hpp": "C++",
    ".vue": "Vue", ".svelte": "Svelte",
    ".css": "CSS", ".scss": "CSS", ".html": "HTML",
    ".json": "JSON", ".yml": "YAML", ".yaml": "YAML", ".toml": "TOML",
    ".md": "Markdown", ".sh": "Shell", ".sql": "SQL",
}

SOURCE_LANGUAGES = {"JavaScript", "TypeScript", "Python", "Ruby", "Go", "Rust", "Java",
                    "Kotlin", "Swift", "PHP", "C#", "C", "C++", "Vue", "Svelte"}

TEST_MARKERS = (".test.", ".spec.", "_test.", "test_")
CONFIG_NAMES = {
    "package.json", "tsconfig.json", "next.config.js", "next.config.mjs", "next.config.ts",
    "vite.config.ts", "vite.config.js", "pyproject.toml", "setup.py", "setup.cfg",
    "requirements.txt", "Pipfile", "docker-compose.yml", "Dockerfile", ".eslintrc",
    ".eslintrc.json", ".eslintrc.js", "eslint.config.js", "eslint.config.mjs",
    "tailwind.config.js", "tailwind.config.ts", "postcss.config.js", "postcss.config.mjs",
    "babel.config.js", "jest.config.js", "vitest.config.ts", "pytest.ini", "tox.ini",
    "Makefile", ".env", ".env.example", ".env.local", ".gitignore",
}


@dataclass
class FileRecord:
    path: str  # relative, posix-style
    extension: str
    size: int
    line_count: int
    language: str | None
    is_binary: bool
    is_generated: bool
    is_test: bool
    is_config: bool
    is_documentation: bool


@dataclass
class RepositoryContext:
    """Everything scanners need about an extracted repository."""

    root: Path
    files: list[FileRecord] = field(default_factory=list)
    languages: dict[str, int] = field(default_factory=dict)
    frameworks: list[str] = field(default_factory=list)
    primary_language: str | None = None
    package_manager: str | None = None
    package_json: dict | None = None
    python_requirements: list[str] = field(default_factory=list)
    has_tests: bool = False
    total_size: int = 0
    # populated by the import graph builder
    import_graph: dict = field(default_factory=dict)

    _content_cache: dict = field(default_factory=dict, repr=False)

    def read_text(self, rel_path: str) -> str | None:
        """Read a file's text content with caching. Returns None for binary/unreadable."""
        if rel_path in self._content_cache:
            return self._content_cache[rel_path]
        full = self.root / rel_path
        try:
            text = full.read_text(encoding="utf-8", errors="replace")
        except (OSError, ValueError):
            text = None
        if text is not None and len(text) > 2_000_000:
            text = None  # do not scan very large files line by line
        self._content_cache[rel_path] = text
        return text

    def source_files(self, languages: set[str] | None = None) -> list[FileRecord]:
        out = []
        for f in self.files:
            if f.is_binary or f.is_generated:
                continue
            if f.language not in SOURCE_LANGUAGES:
                continue
            if languages and f.language not in languages:
                continue
            out.append(f)
        return out


def _looks_binary(path: Path) -> bool:
    try:
        chunk = path.open("rb").read(8000)
    except OSError:
        return True
    return b"\x00" in chunk


def _looks_generated(rel_path: str, name: str) -> bool:
    if name in LOCKFILES:
        return True
    if ".min." in name or name.endswith(".map"):
        return True
    generated_markers = ("generated", "__generated__", ".generated.")
    return any(m in rel_path.lower() for m in generated_markers)


def build_inventory(root: Path) -> RepositoryContext:
    ctx = RepositoryContext(root=root)
    lang_bytes: dict[str, int] = {}

    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.is_symlink():
            continue
        rel_parts = path.relative_to(root).parts
        if any(part in IGNORED_DIRS for part in rel_parts):
            continue
        rel = "/".join(rel_parts)
        name = path.name
        ext = path.suffix.lower()
        size = path.stat().st_size
        is_binary = _looks_binary(path) if size > 0 else False
        language = LANGUAGE_BY_EXT.get(ext)
        line_count = 0
        if not is_binary and size < 2_000_000:
            try:
                line_count = path.read_text(encoding="utf-8", errors="replace").count("\n") + 1
            except OSError:
                line_count = 0

        lower = name.lower()
        is_test = (
            any(m in lower for m in TEST_MARKERS)
            or "tests" in rel_parts
            or "test" in rel_parts
            or "__tests__" in rel_parts
        ) and language in SOURCE_LANGUAGES
        record = FileRecord(
            path=rel,
            extension=ext,
            size=size,
            line_count=line_count,
            language=language,
            is_binary=is_binary,
            is_generated=_looks_generated(rel, name),
            is_test=is_test,
            is_config=name in CONFIG_NAMES or ext in {".toml", ".ini", ".cfg"},
            is_documentation=ext in {".md", ".rst", ".txt"} or "docs" in rel_parts,
        )
        ctx.files.append(record)
        ctx.total_size += size
        if language in SOURCE_LANGUAGES and not record.is_generated:
            lang_bytes[language] = lang_bytes.get(language, 0) + size
        if record.is_test:
            ctx.has_tests = True

    ctx.languages = dict(sorted(lang_bytes.items(), key=lambda kv: -kv[1]))
    ctx.primary_language = next(iter(ctx.languages), None)
    _detect_manifests(ctx)
    _detect_frameworks(ctx)
    return ctx


def _detect_manifests(ctx: RepositoryContext) -> None:
    pkg = ctx.root / "package.json"
    if pkg.exists():
        try:
            ctx.package_json = json.loads(pkg.read_text(encoding="utf-8", errors="replace"))
        except (json.JSONDecodeError, OSError):
            ctx.package_json = None
        if (ctx.root / "pnpm-lock.yaml").exists():
            ctx.package_manager = "pnpm"
        elif (ctx.root / "yarn.lock").exists():
            ctx.package_manager = "yarn"
        elif (ctx.root / "bun.lockb").exists():
            ctx.package_manager = "bun"
        else:
            ctx.package_manager = "npm"

    req = ctx.root / "requirements.txt"
    if req.exists():
        ctx.package_manager = ctx.package_manager or "pip"
        for line in req.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if line and not line.startswith(("#", "-")):
                pkg_name = (
                    line.split("==")[0].split(">=")[0].split("<=")[0]
                    .split("~=")[0].split("[")[0].strip()
                )
                if pkg_name:
                    ctx.python_requirements.append(pkg_name)
    if (ctx.root / "pyproject.toml").exists():
        ctx.package_manager = ctx.package_manager or "pip"


def _detect_frameworks(ctx: RepositoryContext) -> None:
    frameworks: list[str] = []
    deps: dict[str, str] = {}
    if ctx.package_json:
        deps = {**ctx.package_json.get("dependencies", {}), **ctx.package_json.get("devDependencies", {})}

    js_checks = [
        ("next", "Next.js"), ("react", "React"), ("vue", "Vue"), ("svelte", "Svelte"),
        ("express", "Express"), ("fastify", "Fastify"), ("@nestjs/core", "NestJS"),
        ("tailwindcss", "Tailwind CSS"), ("vite", "Vite"),
    ]
    for dep, label in js_checks:
        if dep in deps:
            frameworks.append(label)

    py_files_text = ""
    reqs = " ".join(ctx.python_requirements).lower()
    pyproject = ctx.root / "pyproject.toml"
    if pyproject.exists():
        py_files_text = pyproject.read_text(encoding="utf-8", errors="replace").lower()
    py_checks = [("fastapi", "FastAPI"), ("django", "Django"), ("flask", "Flask")]
    for dep, label in py_checks:
        if dep in reqs or dep in py_files_text:
            frameworks.append(label)

    ctx.frameworks = frameworks
