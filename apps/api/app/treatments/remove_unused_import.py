"""Treatment: remove a confirmed duplicate/unused import line, preserving formatting."""
from __future__ import annotations

from app.models import Diagnosis, Finding
from app.services.inventory import RepositoryContext
from app.treatments.base import FileOperation, TreatmentGenerator, TreatmentNotApplicable, TreatmentProposal


class RemoveUnusedImportTreatment(TreatmentGenerator):
    treatment_type = "remove_unused_import"

    def generate(self, ctx: RepositoryContext, diagnosis: Diagnosis, findings: list[Finding]) -> TreatmentProposal:
        target = next(
            (f for f in findings if f.repair_type == "remove_unused_import" and f.file_path),
            None,
        )
        if target is None:
            raise TreatmentNotApplicable("No removable import was identified for this diagnosis.")

        text = ctx.read_text(target.file_path)
        if text is None:
            raise TreatmentNotApplicable(f"Could not read {target.file_path}.")

        lines = text.splitlines(keepends=True)
        duplicate_lines: list[int] = sorted(target.raw_metadata.get("lines", []))
        if len(duplicate_lines) < 2:
            raise TreatmentNotApplicable("The duplicate import locations could not be confirmed.")

        # keep the first occurrence, remove later duplicates (1-indexed line numbers)
        to_remove = [ln for ln in duplicate_lines[1:] if 0 < ln <= len(lines)]
        if not to_remove:
            raise TreatmentNotApplicable("The duplicate import lines are out of range.")

        new_lines = [line for idx, line in enumerate(lines, start=1) if idx not in to_remove]
        new_content = "".join(new_lines)
        spec = target.raw_metadata.get("spec", "the module")

        return TreatmentProposal(
            treatment_type=self.treatment_type,
            summary=(
                f"Remove {len(to_remove)} duplicate import(s) of '{spec}' from "
                f"{target.file_path} (keeping the first occurrence, line {duplicate_lines[0]})."
            ),
            operations=[FileOperation(path=target.file_path, operation="modify", new_content=new_content)],
            risk_level="low",
            side_effects=(
                "Only duplicate import statements are removed; the module remains imported once, "
                "so behavior is unchanged. If the duplicate import had side effects executed twice, "
                "those now run once."
            ),
            verification_plan=[
                "Check the file still parses",
                "Run the repository lint command if available",
                "Run the repository test command if available",
            ],
        )
