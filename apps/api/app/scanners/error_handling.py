"""Detect weak error handling: empty catch blocks, swallowed exceptions."""
from __future__ import annotations

import ast
import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

EMPTY_CATCH_RE = re.compile(r"catch\s*(\([^)]*\))?\s*\{\s*\}")
CATCH_ONLY_COMMENT_RE = re.compile(r"catch\s*(\([^)]*\))?\s*\{\s*(//[^\n]*)?\s*\}")


class ErrorHandlingScanner(RepositoryScanner):
    scanner_id = "error_handling"
    category = "reliability"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []

        for f in ctx.source_files({"JavaScript", "TypeScript"}):
            text = ctx.read_text(f.path)
            if not text:
                continue
            for match in CATCH_ONLY_COMMENT_RE.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Empty catch block in {f.path}",
                    severity="medium",
                    confidence=0.9,
                    evidence=(
                        f"{f.path} line {line} catches an error and does nothing with it. "
                        "Failures here disappear silently."
                    ),
                    file_path=f.path,
                    start_line=line,
                    end_line=line,
                ))

        for f in ctx.source_files({"Python"}):
            text = ctx.read_text(f.path)
            if not text:
                continue
            try:
                tree = ast.parse(text)
            except SyntaxError:
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Python file fails to parse: {f.path}",
                    severity="high",
                    confidence=0.98,
                    evidence=f"'{f.path}' contains a syntax error and cannot be imported.",
                    file_path=f.path,
                ))
                continue
            for node in ast.walk(tree):
                if isinstance(node, ast.ExceptHandler):
                    body = node.body
                    only_pass = all(isinstance(stmt, ast.Pass) for stmt in body)
                    bare = node.type is None
                    broad = (
                        isinstance(node.type, ast.Name) and node.type.id in ("Exception", "BaseException")
                    )
                    if only_pass:
                        findings.append(ScanFinding(
                            scanner_id=self.scanner_id,
                            category=self.category,
                            title=f"Exception silently swallowed in {f.path}",
                            severity="medium",
                            confidence=0.92,
                            evidence=(
                                f"{f.path} line {node.lineno} catches "
                                f"{'any exception' if bare else 'an exception'} and only executes "
                                "'pass'. Errors are hidden without logging."
                            ),
                            file_path=f.path,
                            start_line=node.lineno,
                            end_line=getattr(node, "end_lineno", node.lineno),
                        ))
                    elif bare or broad:
                        findings.append(ScanFinding(
                            scanner_id=self.scanner_id,
                            category=self.category,
                            title=f"Overly broad exception handler in {f.path}",
                            severity="low",
                            confidence=0.7,
                            evidence=(
                                f"{f.path} line {node.lineno} catches "
                                f"{'all exceptions (bare except)' if bare else 'Exception'}, which can "
                                "mask unrelated bugs."
                            ),
                            file_path=f.path,
                            start_line=node.lineno,
                            end_line=node.lineno,
                        ))

        # fetch/axios calls with no visible error handling in the same file
        for f in ctx.source_files({"JavaScript", "TypeScript"}):
            text = ctx.read_text(f.path)
            if not text:
                continue
            uses_fetch = re.search(r"\b(fetch|axios)\s*(\.|\()", text)
            has_handling = re.search(r"(\.catch\(|try\s*\{|onError|error)", text)
            if uses_fetch and not has_handling:
                line = text.count("\n", 0, uses_fetch.start()) + 1
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Network request without error handling in {f.path}",
                    severity="low",
                    confidence=0.6,
                    evidence=(
                        f"{f.path} makes network requests but contains no catch/try or error state. "
                        "A failed request will surface as an unhandled rejection."
                    ),
                    file_path=f.path,
                    start_line=line,
                ))
        return findings
