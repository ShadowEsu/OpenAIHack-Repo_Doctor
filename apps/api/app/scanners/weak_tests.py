"""Detect missing or meaningless tests."""
from __future__ import annotations

import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

ASSERTION_RE = re.compile(r"\b(expect\(|assert\b|assertEqual|assertTrue|should\.|\.toBe|\.toEqual)")
TRIVIAL_ASSERT_RE = re.compile(r"(expect\(true\)\.toBe\(true\)|assert\s+True\b|assert\s+1\s*==\s*1)")
SKIP_RE = re.compile(r"(\.skip\(|\bxit\(|\bxdescribe\(|@pytest\.mark\.skip|@unittest\.skip|\bit\.todo\()")


class WeakTestsScanner(RepositoryScanner):
    scanner_id = "weak_tests"
    category = "testing"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        test_files = [f for f in ctx.files if f.is_test and not f.is_binary]

        if not test_files:
            if ctx.source_files():
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title="No test files were detected",
                    severity="high",
                    confidence=0.9,
                    evidence=(
                        "No files matching common test conventions (*.test.*, *.spec.*, test_*, "
                        "tests/ directories) were found. Changes to this repository cannot be "
                        "verified automatically."
                    ),
                ))
            return findings

        for f in test_files:
            text = ctx.read_text(f.path)
            if not text:
                continue

            if not ASSERTION_RE.search(text):
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Test file has no assertions: {f.path}",
                    severity="medium",
                    confidence=0.85,
                    evidence=f"'{f.path}' contains no recognizable assertion. It cannot fail meaningfully.",
                    file_path=f.path,
                ))

            for match in TRIVIAL_ASSERT_RE.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Trivial assertion in {f.path}",
                    severity="medium",
                    confidence=0.95,
                    evidence=f"{f.path} line {line} asserts a constant ({match.group(0).strip()}). "
                             "This test always passes and verifies nothing.",
                    file_path=f.path,
                    start_line=line,
                    end_line=line,
                ))

            for match in SKIP_RE.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Skipped test in {f.path}",
                    severity="low",
                    confidence=0.9,
                    evidence=f"{f.path} line {line} skips a test ({match.group(0).strip()}).",
                    file_path=f.path,
                    start_line=line,
                    end_line=line,
                ))
        return findings
