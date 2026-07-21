"""Detect environment-variable documentation problems."""
from __future__ import annotations

import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

ENV_USAGE_PATTERNS = [
    re.compile(r"process\.env\.([A-Z][A-Z0-9_]+)"),
    re.compile(r"process\.env\[['\"]([A-Z][A-Z0-9_]+)['\"]\]"),
    re.compile(r"os\.environ\[['\"]([A-Z][A-Z0-9_]+)['\"]\]"),
    re.compile(r"os\.environ\.get\(\s*['\"]([A-Z][A-Z0-9_]+)['\"]"),
    re.compile(r"os\.getenv\(\s*['\"]([A-Z][A-Z0-9_]+)['\"]"),
    re.compile(r"import\.meta\.env\.([A-Z][A-Z0-9_]+)"),
]

ENV_FILE_VAR_RE = re.compile(r"^\s*([A-Z][A-Z0-9_]+)\s*=", re.MULTILINE)

WELL_KNOWN = {"NODE_ENV", "PORT", "CI", "HOME", "PATH", "PWD", "TZ", "VERCEL", "PYTHONPATH"}


def find_referenced_env_vars(ctx: RepositoryContext) -> dict[str, tuple[str, int]]:
    """Return {var_name: (file, line)} for env vars referenced in source code."""
    refs: dict[str, tuple[str, int]] = {}
    for f in ctx.source_files():
        text = ctx.read_text(f.path)
        if not text:
            continue
        for pattern in ENV_USAGE_PATTERNS:
            for match in pattern.finditer(text):
                var = match.group(1)
                if var not in WELL_KNOWN and var not in refs:
                    line = text.count("\n", 0, match.start()) + 1
                    refs[var] = (f.path, line)
    return refs


def documented_env_vars(ctx: RepositoryContext) -> set[str]:
    documented: set[str] = set()
    for name in (".env.example", ".env.sample", ".env.template"):
        text = ctx.read_text(name)
        if text:
            documented.update(ENV_FILE_VAR_RE.findall(text))
    readme = ctx.read_text("README.md")
    if readme:
        documented.update(v for v in re.findall(r"\b([A-Z][A-Z0-9_]{3,})\b", readme))
    return documented


class EnvVariablesScanner(RepositoryScanner):
    scanner_id = "env_variables"
    category = "configuration"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        referenced = find_referenced_env_vars(ctx)
        documented = documented_env_vars(ctx)
        has_example = any(
            (ctx.root / n).exists() for n in (".env.example", ".env.sample", ".env.template")
        )

        undocumented = {v: loc for v, loc in referenced.items() if v not in documented}
        if undocumented:
            example_vars = ", ".join(sorted(undocumented)[:8])
            first_file, first_line = next(iter(undocumented.values()))
            findings.append(ScanFinding(
                scanner_id=self.scanner_id,
                category=self.category,
                title=f"{len(undocumented)} environment variable(s) referenced in code but undocumented",
                severity="medium" if has_example else "high",
                confidence=0.92,
                evidence=(
                    f"The code reads {example_vars} but "
                    + (".env.example does not list them." if has_example
                       else "the repository has no .env.example documenting them.")
                ),
                file_path=first_file,
                start_line=first_line,
                raw_metadata={
                    "undocumented": {v: {"file": f, "line": l} for v, (f, l) in undocumented.items()},
                    "has_env_example": has_example,
                },
                repairable=True,
                repair_type="create_env_example",
            ))

        # Variables in .env but missing from .env.example
        env_text = ctx.read_text(".env")
        if env_text and has_example:
            env_vars = set(ENV_FILE_VAR_RE.findall(env_text))
            example_text = ctx.read_text(".env.example") or ""
            example_vars = set(ENV_FILE_VAR_RE.findall(example_text))
            missing = env_vars - example_vars
            if missing:
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"{len(missing)} variable(s) in .env are missing from .env.example",
                    severity="medium",
                    confidence=0.9,
                    evidence=f"Variables present in .env but not documented: {', '.join(sorted(missing)[:8])}",
                    file_path=".env.example",
                    raw_metadata={"missing": sorted(missing)},
                    repairable=True,
                    repair_type="create_env_example",
                ))

        # Referenced variables with no fallback (Python os.environ[...] direct indexing)
        for f in ctx.source_files({"Python"}):
            text = ctx.read_text(f.path)
            if not text:
                continue
            for match in re.finditer(r"os\.environ\[['\"]([A-Z][A-Z0-9_]+)['\"]\]", text):
                line = text.count("\n", 0, match.start()) + 1
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category="reliability",
                    title=f"Environment variable '{match.group(1)}' read without a fallback",
                    severity="low",
                    confidence=0.8,
                    evidence=(
                        f"{f.path} line {line} indexes os.environ directly, which raises KeyError "
                        "when the variable is missing. os.environ.get() with validation is safer."
                    ),
                    file_path=f.path,
                    start_line=line,
                    end_line=line,
                ))
        return findings
