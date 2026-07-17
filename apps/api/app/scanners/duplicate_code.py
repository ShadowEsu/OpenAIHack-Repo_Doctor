"""Detect files with highly similar content using normalized text similarity."""
from __future__ import annotations

import difflib
import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

MAX_FILES = 150          # cap pairwise comparisons for large repositories
MIN_LINES = 15           # ignore trivial files
SIMILARITY_THRESHOLD = 0.85

_WS_RE = re.compile(r"\s+")
_COMMENT_RE = re.compile(r"(//[^\n]*|#[^\n]*|/\*.*?\*/)", re.DOTALL)


def _normalize(text: str) -> str:
    text = _COMMENT_RE.sub("", text)
    return _WS_RE.sub(" ", text).strip().lower()


class DuplicateCodeScanner(RepositoryScanner):
    scanner_id = "duplicate_code"
    category = "maintainability"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        candidates = [
            f for f in ctx.source_files()
            if f.line_count >= MIN_LINES and not f.is_test
        ][:MAX_FILES]

        normalized: dict[str, str] = {}
        for f in candidates:
            text = ctx.read_text(f.path)
            if text:
                normalized[f.path] = _normalize(text)

        paths = list(normalized)
        reported: set[frozenset] = set()
        for i in range(len(paths)):
            for j in range(i + 1, len(paths)):
                a, b = paths[i], paths[j]
                na, nb = normalized[a], normalized[b]
                # cheap length pre-filter before the expensive ratio
                if not na or not nb or min(len(na), len(nb)) / max(len(na), len(nb)) < 0.6:
                    continue
                ratio = difflib.SequenceMatcher(None, na, nb).ratio()
                if ratio >= SIMILARITY_THRESHOLD and frozenset((a, b)) not in reported:
                    reported.add(frozenset((a, b)))
                    findings.append(ScanFinding(
                        scanner_id=self.scanner_id,
                        category=self.category,
                        title=f"Highly similar files: {a} and {b}",
                        severity="medium",
                        confidence=round(min(0.95, ratio), 2),
                        evidence=(
                            f"'{a}' and '{b}' are {ratio:.0%} similar after normalizing whitespace "
                            "and comments. They likely duplicate the same component or logic."
                        ),
                        file_path=a,
                        raw_metadata={"other_file": b, "similarity": round(ratio, 3)},
                    ))
        return findings
