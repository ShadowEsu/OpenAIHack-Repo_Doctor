from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _id() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(16))  # github | zip
    source_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    default_branch: Mapped[str | None] = mapped_column(String(128), nullable=True)
    primary_language: Mapped[str | None] = mapped_column(String(64), nullable=True)
    frameworks: Mapped[list] = mapped_column(JSON, default=list)
    languages: Mapped[dict] = mapped_column(JSON, default=dict)
    file_count: Mapped[int] = mapped_column(Integer, default=0)
    repository_size: Mapped[int] = mapped_column(Integer, default=0)  # bytes
    has_tests: Mapped[bool] = mapped_column(Boolean, default=False)
    package_manager: Mapped[str | None] = mapped_column(String(32), nullable=True)
    workspace_path: Mapped[str] = mapped_column(String(1024))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    examinations: Mapped[list["Examination"]] = relationship(back_populates="repository", cascade="all, delete-orphan")


class Examination(Base):
    __tablename__ = "examinations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    repository_id: Mapped[str] = mapped_column(ForeignKey("repositories.id"))
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending|running|completed|failed
    current_stage: Mapped[str | None] = mapped_column(String(64), nullable=True)
    completed_stages: Mapped[list] = mapped_column(JSON, default=list)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    health_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    health_grade: Mapped[str | None] = mapped_column(String(32), nullable=True)
    dimension_scores: Mapped[dict] = mapped_column(JSON, default=dict)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    files_examined: Mapped[int] = mapped_column(Integer, default=0)
    tests_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    frameworks_detected: Mapped[list] = mapped_column(JSON, default=list)
    ai_engine: Mapped[str | None] = mapped_column(String(64), nullable=True)  # openai | rule-based
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    repository: Mapped[Repository] = relationship(back_populates="examinations")
    findings: Mapped[list["Finding"]] = relationship(back_populates="examination", cascade="all, delete-orphan")
    diagnoses: Mapped[list["Diagnosis"]] = relationship(back_populates="examination", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    examination_id: Mapped[str] = mapped_column(ForeignKey("examinations.id"))
    scanner_id: Mapped[str] = mapped_column(String(64))
    category: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(String(255))
    severity: Mapped[str] = mapped_column(String(16))  # critical|high|medium|low|info
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    start_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    end_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    safe_for_ai: Mapped[bool] = mapped_column(Boolean, default=True)
    repairable: Mapped[bool] = mapped_column(Boolean, default=False)
    repair_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    examination: Mapped[Examination] = relationship(back_populates="findings")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    examination_id: Mapped[str] = mapped_column(ForeignKey("examinations.id"))
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(64))
    severity: Mapped[str] = mapped_column(String(16))
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    explanation: Mapped[str] = mapped_column(Text)
    why_it_matters: Mapped[str] = mapped_column(Text)
    recommended_action: Mapped[str] = mapped_column(Text)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    uncertainty: Mapped[str | None] = mapped_column(Text, nullable=True)
    finding_ids: Mapped[list] = mapped_column(JSON, default=list)
    repairable: Mapped[bool] = mapped_column(Boolean, default=False)
    repair_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    repair_risk: Mapped[str | None] = mapped_column(String(16), nullable=True)  # low|medium|high
    repair_effort: Mapped[str | None] = mapped_column(String(16), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="open")  # open|dismissed|treated
    priority_rank: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    examination: Mapped[Examination] = relationship(back_populates="diagnoses")
    files: Mapped[list["DiagnosisFile"]] = relationship(back_populates="diagnosis", cascade="all, delete-orphan")
    treatments: Mapped[list["Treatment"]] = relationship(back_populates="diagnosis", cascade="all, delete-orphan")


class DiagnosisFile(Base):
    __tablename__ = "diagnosis_files"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    diagnosis_id: Mapped[str] = mapped_column(ForeignKey("diagnoses.id"))
    file_path: Mapped[str] = mapped_column(String(1024))
    start_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    end_line: Mapped[int | None] = mapped_column(Integer, nullable=True)

    diagnosis: Mapped[Diagnosis] = relationship(back_populates="files")


class Treatment(Base):
    __tablename__ = "treatments"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    diagnosis_id: Mapped[str] = mapped_column(ForeignKey("diagnoses.id"))
    status: Mapped[str] = mapped_column(String(32), default="proposed")
    # proposed|approved|applying|verifying|succeeded|failed|rolled_back
    treatment_type: Mapped[str] = mapped_column(String(64))
    proposal_summary: Mapped[str] = mapped_column(Text)
    side_effects: Mapped[str | None] = mapped_column(Text, nullable=True)
    patch: Mapped[list] = mapped_column(JSON, default=list)  # file operations
    diff_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_plan: Mapped[list] = mapped_column(JSON, default=list)
    risk_level: Mapped[str] = mapped_column(String(16), default="low")
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    working_copy_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    files_changed: Mapped[int] = mapped_column(Integer, default=0)
    insertions: Mapped[int] = mapped_column(Integer, default=0)
    deletions: Mapped[int] = mapped_column(Integer, default=0)
    health_score_before: Mapped[float | None] = mapped_column(Float, nullable=True)
    health_score_after: Mapped[float | None] = mapped_column(Float, nullable=True)
    remaining_issues: Mapped[int | None] = mapped_column(Integer, nullable=True)
    new_issues: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rollback_available: Mapped[bool] = mapped_column(Boolean, default=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    diagnosis: Mapped[Diagnosis] = relationship(back_populates="treatments")
    verification_runs: Mapped[list["VerificationRun"]] = relationship(
        back_populates="treatment", cascade="all, delete-orphan"
    )


class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    treatment_id: Mapped[str] = mapped_column(ForeignKey("treatments.id"))
    lint_status: Mapped[str] = mapped_column(String(16), default="skipped")  # passed|failed|skipped
    typecheck_status: Mapped[str] = mapped_column(String(16), default="skipped")
    test_status: Mapped[str] = mapped_column(String(16), default="skipped")
    build_status: Mapped[str] = mapped_column(String(16), default="skipped")
    syntax_status: Mapped[str] = mapped_column(String(16), default="skipped")
    lint_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    typecheck_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    test_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    build_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    syntax_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    treatment: Mapped[Treatment] = relationship(back_populates="verification_runs")


class HealthSnapshot(Base):
    __tablename__ = "health_snapshots"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_id)
    repository_id: Mapped[str] = mapped_column(ForeignKey("repositories.id"))
    examination_id: Mapped[str | None] = mapped_column(ForeignKey("examinations.id"), nullable=True)
    treatment_id: Mapped[str | None] = mapped_column(ForeignKey("treatments.id"), nullable=True)
    health_score: Mapped[float] = mapped_column(Float)
    critical_count: Mapped[int] = mapped_column(Integer, default=0)
    warning_count: Mapped[int] = mapped_column(Integer, default=0)
    improvement_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
