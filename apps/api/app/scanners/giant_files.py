"""Detect excessively long or complex source files. Thresholds adapt to file type."""
from __future__ import annotations

import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

THRESHOLDS = {
    # language: (warning_lines, high_lines)
    "JavaScript": (400, 800),
    "TypeScript": (400, 800),
    "Python": (500, 1000),
    "Vue": (400, 800),
    "Svelte": (400, 800),
}

NESTED_IF_RE = re.compile(r"^(\s{12,})(if |if\()", re.MULTILINE)


class GiantFilesScanner(RepositoryScanner):
    scanner_id = "giant_files"
    category = "maintainability"
    supported_languages = list(THRESHOLDS)

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        for f in ctx.source_files(set(THRESHOLDS)):
            if f.is_test:
                continue
            warn, high = THRESHOLDS[f.language]
            if f.line_count >= warn:
                severity = "high" if f.line_count >= high else "medium"
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Very large file: {f.path} ({f.line_count} lines)",
                    severity=severity,
                    confidence=0.95,
                    evidence=(
                        f"'{f.path}' contains {f.line_count} lines. Files this large usually mix "
                        "multiple responsibilities and are hard to review and test."
                    ),
                    file_path=f.path,
                    start_line=1,
                    end_line=f.line_count,
                    raw_metadata={"line_count": f.line_count},
                    repairable=False,
                    repair_type="split_giant_file",
                ))
            else:
                text = ctx.read_text(f.path)
                if text and len(NESTED_IF_RE.findall(text)) >= 5:
                    findings.append(ScanFinding(
                        scanner_id=self.scanner_id,
                        category=self.category,
                        title=f"Deeply nested conditional logic in {f.path}",
                        severity="low",
                        confidence=0.7,
                        evidence=(
                            f"'{f.path}' contains repeated deeply nested if-statements, which makes "
                            "control flow difficult to follow."
                        ),
                        file_path=f.path,
                    ))
        return findings
