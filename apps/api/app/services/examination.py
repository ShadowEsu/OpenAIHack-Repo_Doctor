"""Examination pipeline: runs all stages against a repository workspace and
persists findings, diagnoses, and the health record."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.ai.diagnosis import generate_diagnoses
from app.models import Diagnosis, DiagnosisFile, Examination, Finding, HealthSnapshot, Repository
from app.scanners import ALL_SCANNERS
from app.services.inventory import build_inventory
from app.services.scoring import compute_health, estimate_technical_debt

logger = logging.getLogger(__name__)

EXAMINATION_STAGES = [
    "Receiving repository",
    "Extracting files",
    "Mapping project structure",
    "Detecting languages and frameworks",
    "Running deterministic checks",
    "Evaluating dependencies",
    "Reviewing configuration",
    "Examining tests",
    "Generating AI-assisted diagnoses",
    "Prioritizing findings",
    "Creating the repository health record",
]

_SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}

# stages announced while each scanner group runs, for meaningful progress
_SCANNER_STAGE = {
    "broken_imports": "Running deterministic checks",
    "hardcoded_secret": "Running deterministic checks",
    "giant_files": "Running deterministic checks",
    "duplicate_code": "Running deterministic checks",
    "dead_files": "Running deterministic checks",
    "unused_dependencies": "Evaluating dependencies",
    "env_variables": "Reviewing configuration",
    "documentation": "Reviewing configuration",
    "weak_tests": "Examining tests",
    "error_handling": "Running deterministic checks",
}


def _advance(db: Session, exam: Examination, stage: str) -> None:
    if exam.current_stage and exam.current_stage not in exam.completed_stages:
        exam.completed_stages = exam.completed_stages + [exam.current_stage]
    exam.current_stage = stage
    db.commit()


def run_examination(db: Session, examination_id: str) -> None:
    exam = db.get(Examination, examination_id)
    if exam is None:
        logger.error("Examination %s not found", examination_id)
        return
    repo = db.get(Repository, exam.repository_id)
    try:
        exam.status = "running"
        exam.started_at = datetime.now(timezone.utc)
        _advance(db, exam, EXAMINATION_STAGES[0])

        root = Path(repo.workspace_path)
        if not root.exists():
            raise RuntimeError("The repository workspace no longer exists. Please re-submit the repository.")

        _advance(db, exam, "Mapping project structure")
        ctx = build_inventory(root)

        _advance(db, exam, "Detecting languages and frameworks")
        repo.primary_language = ctx.primary_language
        repo.frameworks = ctx.frameworks
        repo.languages = ctx.languages
        repo.file_count = len(ctx.files)
        repo.repository_size = ctx.total_size
        repo.has_tests = ctx.has_tests
        repo.package_manager = ctx.package_manager
        db.commit()

        all_findings: list[Finding] = []
        current_stage = None
        for scanner_cls in ALL_SCANNERS:
            scanner = scanner_cls()
            stage = _SCANNER_STAGE.get(scanner.scanner_id, "Running deterministic checks")
            if stage != current_stage:
                _advance(db, exam, stage)
                current_stage = stage
            try:
                results = scanner.scan(ctx)
            except Exception:  # noqa: BLE001 - one broken scanner must not kill the exam
                logger.exception("Scanner %s failed", scanner.scanner_id)
                continue
            for r in results:
                finding = Finding(
                    examination_id=exam.id,
                    scanner_id=r.scanner_id,
                    category=r.category,
                    title=r.title,
                    severity=r.severity,
                    confidence=r.confidence,
                    file_path=r.file_path,
                    start_line=r.start_line,
                    end_line=r.end_line,
                    evidence=r.evidence,
                    raw_metadata=r.raw_metadata,
                    safe_for_ai=r.safe_for_ai,
                    repairable=r.repairable,
                    repair_type=r.repair_type,
                )
                db.add(finding)
                all_findings.append(finding)
        db.commit()

        _advance(db, exam, "Generating AI-assisted diagnoses")
        repo_metadata = {
            "name": repo.name,
            "primary_language": repo.primary_language,
            "frameworks": repo.frameworks,
            "file_count": repo.file_count,
            "has_tests": repo.has_tests,
        }
        ai_diagnoses, engine = generate_diagnoses(all_findings, repo_metadata)
        exam.ai_engine = engine

        _advance(db, exam, "Prioritizing findings")
        for rank, diag in enumerate(ai_diagnoses):
            row = Diagnosis(
                examination_id=exam.id,
                title=diag.title,
                category=diag.category,
                severity=diag.severity,
                confidence=diag.confidence,
                explanation=diag.explanation,
                why_it_matters=diag.why_it_matters,
                recommended_action=diag.recommended_action,
                uncertainty=diag.uncertainty,
                finding_ids=diag.finding_ids,
                repairable=diag.repairable,
                repair_type=diag.repair_type,
                repair_risk=diag.repair_risk,
                repair_effort=diag.repair_effort,
                priority_rank=rank,
            )
            db.add(row)
            db.flush()
            for af in diag.affected_files:
                db.add(DiagnosisFile(
                    diagnosis_id=row.id,
                    file_path=af.path,
                    start_line=af.start_line,
                    end_line=af.end_line,
                ))
        db.commit()

        _advance(db, exam, "Creating the repository health record")
        health = compute_health(all_findings)
        exam.health_score = health.score
        exam.health_grade = health.grade
        exam.dimension_scores = health.dimensions
        exam.files_examined = len(ctx.files)
        exam.tests_detected = ctx.has_tests
        exam.frameworks_detected = ctx.frameworks
        exam.summary = _build_summary(repo, all_findings, health.score, health.grade)

        critical = sum(1 for f in all_findings if f.severity == "critical")
        warnings = sum(1 for f in all_findings if f.severity in ("high", "medium"))
        improvements = sum(1 for f in all_findings if f.severity in ("low", "info"))
        db.add(HealthSnapshot(
            repository_id=repo.id,
            examination_id=exam.id,
            health_score=health.score,
            critical_count=critical,
            warning_count=warnings,
            improvement_count=improvements,
        ))

        exam.completed_stages = EXAMINATION_STAGES
        exam.current_stage = None
        exam.status = "completed"
        exam.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as exc:  # noqa: BLE001 - persist the failure honestly
        logger.exception("Examination %s failed", examination_id)
        db.rollback()
        exam = db.get(Examination, examination_id)
        if exam is not None:
            exam.status = "failed"
            exam.error_message = str(exc)
            exam.completed_at = datetime.now(timezone.utc)
            db.commit()


def _build_summary(repo: Repository, findings: list[Finding], score: float, grade: str) -> str:
    critical = sum(1 for f in findings if f.severity == "critical")
    high = sum(1 for f in findings if f.severity == "high")
    repairable = sum(1 for f in findings if f.repairable)
    parts = [
        f"{repo.name} scored {score} ({grade}).",
        f"{len(findings)} finding(s): {critical} critical, {high} high severity.",
    ]
    if repairable:
        parts.append(f"{repairable} issue(s) have a safe automatic treatment available.")
    parts.append(f"Estimated technical debt: {estimate_technical_debt(findings)}.")
    return " ".join(parts)
