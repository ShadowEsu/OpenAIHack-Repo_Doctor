from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from app.models import Diagnosis, Finding
from app.services.inventory import RepositoryContext


@dataclass
class FileOperation:
    path: str                      # relative path inside the repository
    operation: str                 # create | modify | delete
    new_content: Optional[str]     # None for delete

    def as_dict(self) -> dict:
        return {"path": self.path, "operation": self.operation, "new_content": self.new_content}


@dataclass
class TreatmentProposal:
    treatment_type: str
    summary: str
    operations: list[FileOperation]
    risk_level: str                # low | medium | high
    side_effects: str
    verification_plan: list[str] = field(default_factory=list)


class TreatmentGenerator:
    treatment_type: str = "base"

    def generate(
        self,
        ctx: RepositoryContext,
        diagnosis: Diagnosis,
        findings: list[Finding],
    ) -> TreatmentProposal:
        raise NotImplementedError


class TreatmentNotApplicable(Exception):
    """Raised when a treatment cannot be generated for this diagnosis."""
