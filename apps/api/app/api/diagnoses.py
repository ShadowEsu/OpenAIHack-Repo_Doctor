from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Diagnosis
from app.schemas import DiagnosisOut, DiagnosisStatusUpdate, TreatmentOut
from app.services.treatment_executor import TreatmentError, propose_treatment

router = APIRouter(prefix="/api/diagnoses", tags=["diagnoses"])


@router.get("/{diagnosis_id}", response_model=DiagnosisOut)
def get_diagnosis(diagnosis_id: str, db: Session = Depends(get_db)):
    diag = db.get(Diagnosis, diagnosis_id)
    if diag is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found.")
    return diag


@router.patch("/{diagnosis_id}/status", response_model=DiagnosisOut)
def update_status(diagnosis_id: str, payload: DiagnosisStatusUpdate, db: Session = Depends(get_db)):
    diag = db.get(Diagnosis, diagnosis_id)
    if diag is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found.")
    diag.status = payload.status
    db.commit()
    return diag


@router.post("/{diagnosis_id}/treatment-proposal", response_model=TreatmentOut, status_code=201)
def create_treatment_proposal(diagnosis_id: str, db: Session = Depends(get_db)):
    diag = db.get(Diagnosis, diagnosis_id)
    if diag is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found.")
    try:
        return propose_treatment(db, diag)
    except TreatmentError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
