"""Treatment: delete a confirmed dead file. Only offered for high-confidence findings."""
from __future__ import annotations

from app.models import Diagnosis, Finding
from app.services.inventory import RepositoryContext
from app.treatments.base import FileOperation, TreatmentGenerator, TreatmentNotApplicable, TreatmentProposal


class RemoveDeadFileTreatment(TreatmentGenerator):
    treatment_type = "remove_dead_file"

    def generate(self, ctx: RepositoryContext, diagnosis: Diagnosis, findings: list[Finding]) -> TreatmentProposal:
        target = next(
            (f for f in findings
             if f.repair_type == "remove_dead_file" and f.file_path and f.confidence >= 0.8),
            None,
        )
        if target is None:
            raise TreatmentNotApplicable(
                "No dead file met the confidence bar for safe removal. Files with limited "
                "confidence must be deleted manually after review."
            )
        if not (ctx.root / target.file_path).exists():
            raise TreatmentNotApplicable(f"{target.file_path} no longer exists.")

        return TreatmentProposal(
            treatment_type=self.treatment_type,
            summary=(
                f"Delete '{target.file_path}'. It has a backup/copy-style name, is never imported "
                "by any file, and is not a framework entry point."
            ),
            operations=[FileOperation(path=target.file_path, operation="delete", new_content=None)],
            risk_level="medium",
            side_effects=(
                "If the file is loaded dynamically (a pattern static analysis cannot always see), "
                "removing it would break that code path. Verification runs the test suite to check."
            ),
            verification_plan=[
                "Confirm no remaining file imports the deleted path",
                "Run the repository test command if available",
                "Run the repository build command if available",
            ],
        )
