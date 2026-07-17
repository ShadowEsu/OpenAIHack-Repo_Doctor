"""Treatment lifecycle: propose, apply in an isolated working copy, verify,
and compare repository health before and after."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Diagnosis, Examination, Finding, HealthSnapshot, Repository, Treatment, VerificationRun
from app.scanners import ALL_SCANNERS
from app.services.inventory import build_inventory
from app.services.patching import apply_operations, compute_diff, create_working_copy
from app.services.scoring import compute_health
from app.treatments import TREATMENT_GENERATORS, TreatmentNotApplicable
from app.treatments.base import FileOperation
from app.verification.runner import run_verification

logger = logging.getLogger(__name__)


class TreatmentError(Exception):
    """User-facing treatment failure."""


def propose_treatment(db: Session, diagnosis: Diagnosis) -> Treatment:
    if not diagnosis.repairable or not diagnosis.repair_type:
        raise TreatmentError("This diagnosis has no safe automatic treatment. "
                             "It must be repaired manually.")
    generator = TREATMENT_GENERATORS.get(diagnosis.repair_type)
    if generator is None:
        raise TreatmentError(f"No treatment generator implements '{diagnosis.repair_type}'.")

    exam = db.get(Examination, diagnosis.examination_id)
    repo = db.get(Repository, exam.repository_id)
    root = Path(repo.workspace_path)
    if not root.exists():
        raise TreatmentError("The repository workspace no longer exists. Please re-submit the repository.")

    ctx = build_inventory(root)
    findings = [db.get(Finding, fid) for fid in diagnosis.finding_ids]
    findings = [f for f in findings if f is not None]
    if not findings:
        findings = list(db.query(Finding).filter(
            Finding.examination_id == exam.id,
            Finding.repair_type == diagnosis.repair_type,
        ))

    try:
        proposal = generator.generate(ctx, diagnosis, findings)
    except TreatmentNotApplicable as exc:
        raise TreatmentError(str(exc)) from exc

    diff_text, insertions, deletions = compute_diff(root, proposal.operations)
    treatment = Treatment(
        diagnosis_id=diagnosis.id,
        status="proposed",
        treatment_type=proposal.treatment_type,
        proposal_summary=proposal.summary,
        side_effects=proposal.side_effects,
        patch=[op.as_dict() for op in proposal.operations],
        diff_text=diff_text,
        verification_plan=proposal.verification_plan,
        risk_level=proposal.risk_level,
        files_changed=len(proposal.operations),
        insertions=insertions,
        deletions=deletions,
        health_score_before=exam.health_score,
    )
    db.add(treatment)
    db.commit()
    return treatment


def apply_treatment(db: Session, treatment: Treatment) -> Treatment:
    if treatment.status != "approved":
        raise TreatmentError("The treatment must be approved before it can be applied.")

    diagnosis = db.get(Diagnosis, treatment.diagnosis_id)
    exam = db.get(Examination, diagnosis.examination_id)
    repo = db.get(Repository, exam.repository_id)
    root = Path(repo.workspace_path)
    if not root.exists():
        raise TreatmentError("The repository workspace no longer exists.")

    treatment.status = "applying"
    treatment.started_at = datetime.now(timezone.utc)
    db.commit()

    try:
        operations = [FileOperation(**op) for op in treatment.patch]
        working_copy = create_working_copy(root)
        treatment.working_copy_path = str(working_copy)
        apply_operations(working_copy, operations)

        treatment.status = "verifying"
        db.commit()

        run = VerificationRun(treatment_id=treatment.id, started_at=datetime.now(timezone.utc))
        changed = [op.path for op in operations]
        result = run_verification(working_copy, changed)
        run.syntax_status, run.syntax_output = result.syntax.status, result.syntax.output
        run.lint_status, run.lint_output = result.lint.status, result.lint.output
        run.typecheck_status, run.typecheck_output = result.typecheck.status, result.typecheck.output
        run.test_status, run.test_output = result.tests.status, result.tests.output
        run.build_status, run.build_output = result.build.status, result.build.output
        run.notes = "\n".join(result.notes) or None
        run.completed_at = datetime.now(timezone.utc)
        db.add(run)

        failed = any(
            status == "failed"
            for status in (result.syntax.status, result.lint.status, result.typecheck.status,
                           result.tests.status, result.build.status)
        )

        # Re-examine the working copy to compute the after-score honestly
        after_ctx = build_inventory(working_copy)
        after_findings = []
        for scanner_cls in ALL_SCANNERS:
            try:
                after_findings.extend(scanner_cls().scan(after_ctx))
            except Exception:  # noqa: BLE001
                logger.exception("Re-scan scanner %s failed", scanner_cls.scanner_id)
        after_health = compute_health(after_findings)

        before_findings = db.query(Finding).filter(Finding.examination_id == exam.id).all()
        before_titles = {(f.scanner_id, f.title) for f in before_findings}
        after_keys = {(f.scanner_id, f.title) for f in after_findings}
        treatment.remaining_issues = len(after_findings)
        treatment.new_issues = len(after_keys - before_titles)
        treatment.health_score_after = after_health.score

        treatment.status = "failed" if failed else "succeeded"
        treatment.rollback_available = True
        treatment.completed_at = datetime.now(timezone.utc)
        if failed:
            treatment.error_message = ("Verification reported a failure. The original repository "
                                       "is untouched; review the check output below.")
        else:
            diagnosis.status = "treated"
            db.add(HealthSnapshot(
                repository_id=repo.id,
                examination_id=exam.id,
                treatment_id=treatment.id,
                health_score=after_health.score,
                critical_count=sum(1 for f in after_findings if f.severity == "critical"),
                warning_count=sum(1 for f in after_findings if f.severity in ("high", "medium")),
                improvement_count=sum(1 for f in after_findings if f.severity in ("low", "info")),
            ))
        db.commit()
        return treatment
    except Exception as exc:  # noqa: BLE001 - record the failure, never half-apply
        logger.exception("Treatment %s failed", treatment.id)
        db.rollback()
        treatment = db.get(Treatment, treatment.id)
        treatment.status = "failed"
        treatment.error_message = str(exc)
        treatment.completed_at = datetime.now(timezone.utc)
        db.commit()
        return treatment
