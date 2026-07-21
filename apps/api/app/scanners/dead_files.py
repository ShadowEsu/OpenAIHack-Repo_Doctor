"""Detect files that appear dead: never imported, or named like abandoned copies.

Dynamic imports, framework routing, and config-driven loading cause false
positives, so confidence is deliberately conservative.
"""
from __future__ import annotations

import re

from app.scanners.base import RepositoryScanner, ScanFinding
from app.services.inventory import RepositoryContext

SUSPICIOUS_NAME_RE = re.compile(
    r"(copy|backup|_old|-old|\bold\b|final2|final_final|_temp|-temp|\btmp\b|\.bak$|_v[0-9]+\.)",
    re.IGNORECASE,
)


class DeadFilesScanner(RepositoryScanner):
    scanner_id = "dead_files"
    category = "maintainability"
    supported_languages = ["JavaScript", "TypeScript", "Python"]

    def scan(self, ctx: RepositoryContext) -> list[ScanFinding]:
        findings: list[ScanFinding] = []
        imported = ctx.import_graph.get("imported_files", set())
        entry_points = ctx.import_graph.get("entry_points", set())

        for f in ctx.source_files():
            if f.is_test or f.is_config:
                continue
            suspicious_name = bool(SUSPICIOUS_NAME_RE.search(f.path))
            unreferenced = f.path not in imported and f.path not in entry_points

            if suspicious_name and unreferenced:
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"Likely abandoned file: {f.path}",
                    severity="medium",
                    confidence=0.85,
                    evidence=(
                        f"'{f.path}' has a backup/copy-style name and is never imported by any "
                        "other file or entry point."
                    ),
                    file_path=f.path,
                    repairable=True,
                    repair_type="remove_dead_file",
                    raw_metadata={"reason": "suspicious_name_and_unreferenced"},
                ))
            elif suspicious_name:
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"File name suggests an abandoned copy: {f.path}",
                    severity="low",
                    confidence=0.6,
                    evidence=f"'{f.path}' is named like a backup or old version but is still referenced.",
                    file_path=f.path,
                    raw_metadata={"reason": "suspicious_name"},
                ))
            elif unreferenced and f.language in ("JavaScript", "TypeScript"):
                findings.append(ScanFinding(
                    scanner_id=self.scanner_id,
                    category=self.category,
                    title=f"File appears unreferenced: {f.path}",
                    severity="low",
                    confidence=0.5,
                    evidence=(
                        f"No static import of '{f.path}' was found and it is not a recognized entry "
                        "point. Dynamic imports or framework conventions could still load it, so "
                        "confidence is limited."
                    ),
                    file_path=f.path,
                    raw_metadata={"reason": "unreferenced"},
                ))
        return findings
