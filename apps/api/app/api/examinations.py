from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import SessionLocal, get_db
from app.models import Diagnosis, Examination, Finding, Repository
from app.schemas import DiagnosisOut, ExaminationOut, ExaminationProgress, HealthRecordOut
from app.services.examination import EXAMINATION_STAGES, run_examination
from app.services.scoring import estimate_technical_debt

router = APIRouter(prefix="/api", tags=["examinations"])


def _run_examination_task(examination_id: str) -> None:
    db = SessionLocal()
    try:
        run_examination(db, examination_id)
    finally:
        db.close()


@router.post("/repositories/{repository_id}/examinations", response_model=ExaminationOut, status_code=202)
def start_examination(repository_id: str, background: BackgroundTasks, db: Session = Depends(get_db)):
    repo = db.get(Repository, repository_id)
    if repo is None:
        raise HTTPException(status_code=404, detail="Repository not found.")
    exam = Examination(repository_id=repo.id, status="pending")
    db.add(exam)
    db.commit()
    background.add_task(_run_examination_task, exam.id)
    return exam


@router.get("/examinations/{examination_id}", response_model=ExaminationOut)
def get_examination(examination_id: str, db: Session = Depends(get_db)):
    exam = db.get(Examination, examination_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Examination not found.")
    return exam


@router.get("/examinations/{examination_id}/progress", response_model=ExaminationProgress)
def get_progress(examination_id: str, db: Session = Depends(get_db)):
    exam = db.get(Examination, examination_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Examination not found.")
    return ExaminationProgress(
        examination_id=exam.id,
        status=exam.status,
        current_stage=exam.current_stage,
        completed_stages=exam.completed_stages,
        all_stages=EXAMINATION_STAGES,
        error_message=exam.error_message,
    )


@router.get("/examinations/{examination_id}/diagnoses", response_model=list[DiagnosisOut])
def list_diagnoses(
    examination_id: str,
    severity: str | None = None,
    category: str | None = None,
    repairable: bool | None = None,
    status: str | None = None,
    file: str | None = None,
    min_confidence: float | None = None,
    db: Session = Depends(get_db),
):
    exam = db.get(Examination, examination_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Examination not found.")
    query = db.query(Diagnosis).filter(Diagnosis.examination_id == examination_id)
    if severity:
        query = query.filter(Diagnosis.severity == severity)
    if category:
        query = query.filter(Diagnosis.category == category)
    if repairable is not None:
        query = query.filter(Diagnosis.repairable == repairable)
    if status:
        query = query.filter(Diagnosis.status == status)
    if min_confidence is not None:
        query = query.filter(Diagnosis.confidence >= min_confidence)
    diagnoses = query.order_by(Diagnosis.priority_rank).all()
    if file:
        diagnoses = [d for d in diagnoses if any(f.file_path == file for f in d.files)]
    return diagnoses


@router.get("/examinations/{examination_id}/health-record", response_model=HealthRecordOut)
def health_record(examination_id: str, db: Session = Depends(get_db)):
    exam = db.get(Examination, examination_id)
    if exam is None:
        raise HTTPException(status_code=404, detail="Examination not found.")
    if exam.status != "completed":
        raise HTTPException(
            status_code=409,
            detail=f"The examination is not complete (status: {exam.status}).",
        )
    findings = db.query(Finding).filter(Finding.examination_id == examination_id).all()
    priority = (
        db.query(Diagnosis)
        .filter(Diagnosis.examination_id == examination_id, Diagnosis.status == "open")
        .order_by(Diagnosis.priority_rank)
        .first()
    )
    return HealthRecordOut(
        examination=ExaminationOut.model_validate(exam),
        critical_count=sum(1 for f in findings if f.severity == "critical"),
        high_count=sum(1 for f in findings if f.severity == "high"),
        warning_count=sum(1 for f in findings if f.severity in ("high", "medium")),
        improvement_count=sum(1 for f in findings if f.severity in ("low", "info")),
        repairable_count=sum(1 for f in findings if f.repairable),
        estimated_technical_debt=estimate_technical_debt(findings),
        priority_diagnosis=DiagnosisOut.model_validate(priority) if priority else None,
    )
