from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from app.services.inventory import RepositoryContext


@dataclass
class ScanFinding:
    scanner_id: str
    category: str
    title: str
    severity: str  # critical | high | medium | low | info
    confidence: float
    evidence: str
    file_path: Optional[str] = None
    start_line: Optional[int] = None
    end_line: Optional[int] = None
    raw_metadata: dict = field(default_factory=dict)
    safe_for_ai: bool = True
    repairable: bool = False
    repair_type: Optional[str] = None


class RepositoryScanner:
    scanner_id: str = "base"
    category: str = "general"
    supported_languages: list[str] = []

    def scan(self, context: RepositoryContext) -> list[ScanFinding]:
        raise NotImplementedError
