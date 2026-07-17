"""Detect likely hardcoded secrets via pattern matching and entropy checks.

Detected values are always masked. Findings are marked safe_for_ai=False so
raw secret values never reach the AI layer.
"""
from __future__ import annotations

import math
import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

PATTERNS: list[tuple[str, re.Pattern, str]] = [
    ("OpenAI API key", re.compile(r"sk-[A-Za-z0-9_-]{20,}"), "critical"),
    ("AWS access key", re.compile(r"AKIA[0-9A-Z]{16}"), "critical"),
    ("GitHub token", re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}"), "critical"),
    ("Slack token", re.compile(r"xox[baprs]-[A-Za-z0-9-]{10,}"), "critical"),
    ("Stripe key", re.compile(r"(sk|pk)_(live|test)_[A-Za-z0-9]{20,}"), "critical"),
    ("Google API key", re.compile(r"AIza[0-9A-Za-z_-]{35}"), "high"),
    ("Private key block", re.compile(r"-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----"), "critical"),
    ("Connection string with credentials",
     re.compile(r"(postgres|postgresql|mysql|mongodb(\+srv)?|redis|amqp)://[^\s'\"/@]+:[^\s'\"@]+@[^\s'\"]+"),
     "critical"),
    ("JWT token", re.compile(r"eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"), "high"),
]

ASSIGNMENT_RE = re.compile(
    r"""(?P<name>[A-Za-z_][A-Za-z0-9_]*(?:key|token|secret|password|passwd|credential)[A-Za-z0-9_]*)
        \s*[:=]\s*['"](?P<value>[^'"]{12,})['"]""",
    re.IGNORECASE | re.VERBOSE,
)

PLACEHOLDER_HINTS = (
    "example", "placeholder", "your-", "your_", "xxxx", "changeme", "<", ">",
    "dummy", "sample", "test-key", "insert", "todo", "fixme", "abc123", "123456",
)

SKIP_FILES = {".env.example", ".env.sample", ".env.template"}


def _entropy(value: str) -> float:
    if not value:
        return 0.0
    freq: dict[str, int] = {}
    for ch in value:
        freq[ch] = freq.get(ch, 0) + 1
    return -sum((n / len(value)) * math.log2(n / len(value)) for n in freq.values())


def mask_secret(value: str) -> str:
    if len(value) <= 8:
        return "****"
    return f"{value[:4]}****{value[-4:]}"


class SecretsScanner(RepositoryScanner):
    scanner_id = "hardcoded_secret"
    category = "security"
    supported_languages = []  # applies to all text files

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        seen: set[tuple] = set()

        for f in ctx.files:
            if f.is_binary or f.is_generated:
                continue
            name = f.path.rsplit("/", 1)[-1]
            if name in SKIP_FILES:
                continue
            if f.language in (None, "Markdown") and name != ".env" and not f.is_config:
                continue
            text = ctx.read_text(f.path)
            if text is None:
                continue
            lines = text.splitlines()

            for label, pattern, severity in PATTERNS:
                for match in pattern.finditer(text):
                    value = match.group(0)
                    if any(h in value.lower() for h in PLACEHOLDER_HINTS):
                        continue
                    line_no = text.count("\n", 0, match.start()) + 1
                    key = (f.path, line_no, label)
                    if key in seen:
                        continue
                    seen.add(key)
                    findings.append(self._finding(label, severity, f.path, line_no, value, name))

            for match in ASSIGNMENT_RE.finditer(text):
                value = match.group("value")
                if any(h in value.lower() for h in PLACEHOLDER_HINTS):
                    continue
                if _entropy(value) < 3.5:
                    continue
                line_no = text.count("\n", 0, match.start()) + 1
                key = (f.path, line_no, "assignment")
                if key in seen:
                    continue
                seen.add(key)
                findings.append(self._finding(
                    f"High-entropy value assigned to '{match.group('name')}'",
                    "critical" if name != ".env" else "high",
                    f.path, line_no, value, name,
                ))

            if name == ".env" and lines:
                findings.append(ScanFinding(
                    scanner_id="env_committed",
                    category="security",
                    title="A .env file is committed to the repository",
                    severity="high",
                    confidence=0.9,
                    evidence=(
                        f"'{f.path}' exists in the repository. Environment files usually contain "
                        "secrets and should be listed in .gitignore instead."
                    ),
                    file_path=f.path,
                    safe_for_ai=True,
                ))
        return findings

    def _finding(self, label: str, severity: str, path: str, line: int, value: str, filename: str) -> ScanFinding:
        masked = mask_secret(value)
        return ScanFinding(
            scanner_id=self.scanner_id,
            category=self.category,
            title=f"Possible hardcoded secret: {label}",
            severity=severity,
            confidence=0.9,
            evidence=f"A credential-like value ({masked}) appears in {path} line {line}.",
            file_path=path,
            start_line=line,
            end_line=line,
            raw_metadata={"masked_value": masked, "pattern": label},
            safe_for_ai=False,  # never ship even masked context lines to AI
            repairable=True,
            repair_type="move_to_environment_variable",
        )
