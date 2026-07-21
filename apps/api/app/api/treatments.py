from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import SessionLocal, get_db
from app.models import Treatment, VerificationRun
from app.schemas import TreatmentOut, VerificationRunOut
from app.services.patching import remove_working_copy, zip_working_copy
from app.services.treatment_executor import TreatmentError, apply_treatment

router = APIRouter(prefix="/api/treatments", tags=["treatments"])


def _get_treatment(db: Session, treatment_id: str) -> Treatment:
    treatment = db.get(Treatment, treatment_id)
    if treatment is None:
        raise HTTPException(status_code=404, detail="Treatment not found.")
    return treatment


@router.get("/{treatment_id}", response_model=TreatmentOut)
def get_treatment(treatment_id: str, db: Session = Depends(get_db)):
    return _get_treatment(db, treatment_id)


@router.post("/{treatment_id}/approve", response_model=TreatmentOut)
def approve_treatment(treatment_id: str, db: Session = Depends(get_db)):
    treatment = _get_treatment(db, treatment_id)
    if treatment.status != "proposed":
        raise HTTPException(status_code=409, detail=f"Treatment is '{treatment.status}', not 'proposed'.")
    treatment.status = "approved"
    treatment.approved_at = datetime.now(timezone.utc)
    db.commit()
    return treatment


def _apply_task(treatment_id: str) -> None:
    db = SessionLocal()
    try:
        treatment = db.get(Treatment, treatment_id)
        if treatment is not None:
            apply_treatment(db, treatment)
    finally:
        db.close()


@router.post("/{treatment_id}/apply", response_model=TreatmentOut, status_code=202)
def apply(treatment_id: str, background: BackgroundTasks, db: Session = Depends(get_db)):
    treatment = _get_treatment(db, treatment_id)
    if treatment.status != "approved":
        raise HTTPException(
            status_code=409,
            detail="The treatment must be approved before it can be applied. "
                   f"Current status: '{treatment.status}'.",
        )
    background.add_task(_apply_task, treatment.id)
    return treatment


@router.post("/{treatment_id}/rollback", response_model=TreatmentOut)
def rollback(treatment_id: str, db: Session = Depends(get_db)):
    treatment = _get_treatment(db, treatment_id)
    if not treatment.rollback_available:
        raise HTTPException(status_code=409, detail="No rollback is available for this treatment.")
    if treatment.working_copy_path:
        remove_working_copy(treatment.working_copy_path)
    treatment.status = "rolled_back"
    treatment.rollback_available = False
    treatment.working_copy_path = None
    if treatment.diagnosis and treatment.diagnosis.status == "treated":
        treatment.diagnosis.status = "open"
    db.commit()
    return treatment


@router.get("/{treatment_id}/verification", response_model=list[VerificationRunOut])
def get_verification(treatment_id: str, db: Session = Depends(get_db)):
    _get_treatment(db, treatment_id)
    return (
        db.query(VerificationRun)
        .filter(VerificationRun.treatment_id == treatment_id)
        .order_by(VerificationRun.started_at)
        .all()
    )


@router.get("/{treatment_id}/download")
def download(treatment_id: str, db: Session = Depends(get_db)):
    treatment = _get_treatment(db, treatment_id)
    if treatment.status != "succeeded" or not treatment.working_copy_path:
        raise HTTPException(
            status_code=409,
            detail="Only a successfully applied treatment can be downloaded.",
        )
    working_copy = Path(treatment.working_copy_path)
    if not working_copy.exists():
        raise HTTPException(status_code=410, detail="The patched working copy no longer exists.")
    archive = zip_working_copy(working_copy)
    return FileResponse(
        archive,
        media_type="application/zip",
        filename=f"repo-doctor-patched-{treatment_id[:8]}.zip",
    )
