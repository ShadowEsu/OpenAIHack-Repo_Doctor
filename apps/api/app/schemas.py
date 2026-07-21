from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class GitHubIntakeRequest(BaseModel):
    url: HttpUrl = Field(description="Public GitHub repository URL")


class FrontendRepositorySubmission(BaseModel):
    """Compatibility payload used by the existing Vite frontend."""

    source: str = Field(pattern="^github$")
    url: HttpUrl = Field(description="Public GitHub repository URL")


class RepositoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    source_type: str
    source_url: Optional[str] = None
    default_branch: Optional[str] = None
    primary_language: Optional[str] = None
    frameworks: list[str] = []
    languages: dict[str, int] = {}
    file_count: int
    repository_size: int
    has_tests: bool
    package_manager: Optional[str] = None
    created_at: datetime


class ExaminationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    repository_id: str
    status: str
    current_stage: Optional[str] = None
    completed_stages: list[str] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    health_score: Optional[float] = None
    health_grade: Optional[str] = None
    dimension_scores: dict[str, float] = {}
    summary: Optional[str] = None
    files_examined: int = 0
    tests_detected: bool = False
    frameworks_detected: list[str] = []
    ai_engine: Optional[str] = None
    error_message: Optional[str] = None


class ExaminationProgress(BaseModel):
    examination_id: str
    status: str
    current_stage: Optional[str] = None
    completed_stages: list[str] = []
    all_stages: list[str] = []
    error_message: Optional[str] = None
    stage: Optional[str] = None
    completed: int = 0
    total: int = 0
    message: Optional[str] = None


class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scanner_id: str
    category: str
    title: str
    severity: str
    confidence: float
    file_path: Optional[str] = None
    start_line: Optional[int] = None
    end_line: Optional[int] = None
    evidence: Optional[str] = None
    repairable: bool = False
    repair_type: Optional[str] = None


class DiagnosisFileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    file_path: str
    start_line: Optional[int] = None
    end_line: Optional[int] = None


class DiagnosisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    examination_id: str
    title: str
    category: str
    severity: str
    confidence: float
    explanation: str
    why_it_matters: str
    recommended_action: str
    evidence: Optional[str] = None
    uncertainty: Optional[str] = None
    finding_ids: list[str] = []
    repairable: bool
    repair_type: Optional[str] = None
    repair_risk: Optional[str] = None
    repair_effort: Optional[str] = None
    status: str
    priority_rank: int
    files: list[DiagnosisFileOut] = []


class DiagnosisStatusUpdate(BaseModel):
    status: str = Field(pattern="^(open|dismissed|treated)$")


class HealthRecordOut(BaseModel):
    examination: ExaminationOut
    critical_count: int
    high_count: int
    warning_count: int
    improvement_count: int
    repairable_count: int
    estimated_technical_debt: str
    priority_diagnosis: Optional[DiagnosisOut] = None


class VerificationRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lint_status: str
    typecheck_status: str
    test_status: str
    build_status: str
    syntax_status: str
    lint_output: Optional[str] = None
    typecheck_output: Optional[str] = None
    test_output: Optional[str] = None
    build_output: Optional[str] = None
    syntax_output: Optional[str] = None
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TreatmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    diagnosis_id: str
    status: str
    treatment_type: str
    proposal_summary: str
    side_effects: Optional[str] = None
    patch: list[dict[str, Any]] = []
    diff_text: Optional[str] = None
    verification_plan: list[str] = []
    risk_level: str
    files_changed: int = 0
    insertions: int = 0
    deletions: int = 0
    health_score_before: Optional[float] = None
    health_score_after: Optional[float] = None
    remaining_issues: Optional[int] = None
    new_issues: Optional[int] = None
    rollback_available: bool = False
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class ApiError(BaseModel):
    detail: str
