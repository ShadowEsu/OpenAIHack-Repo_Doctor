from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Repository
from app.schemas import GitHubIntakeRequest, RepositoryOut
from app.services import intake
from app.services.inventory import build_inventory

router = APIRouter(prefix="/api/repositories", tags=["repositories"])


def _register_repository(db: Session, repo_dir, name: str, source_type: str,
                         source_url: str | None, default_branch: str | None) -> Repository:
    ctx = build_inventory(repo_dir)
    repo = Repository(
        name=name,
        source_type=source_type,
        source_url=source_url,
        default_branch=default_branch,
        primary_language=ctx.primary_language,
        frameworks=ctx.frameworks,
        languages=ctx.languages,
        file_count=len(ctx.files),
        repository_size=ctx.total_size,
        has_tests=ctx.has_tests,
        package_manager=ctx.package_manager,
        workspace_path=str(repo_dir),
    )
    db.add(repo)
    db.commit()
    return repo


@router.post("/github", response_model=RepositoryOut, status_code=201)
def intake_github(payload: GitHubIntakeRequest, db: Session = Depends(get_db)):
    try:
        repo_dir, name, default_branch = intake.clone_github_repository(str(payload.url))
    except intake.IntakeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _register_repository(db, repo_dir, name, "github", str(payload.url), default_branch)


@router.post("/upload", response_model=RepositoryOut, status_code=201)
async def intake_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not (file.filename or "").lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Please upload a .zip archive of the repository.")
    data = await file.read()
    try:
        repo_dir, name = intake.extract_zip_upload(data, file.filename or "upload.zip")
    except intake.IntakeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _register_repository(db, repo_dir, name, "zip", None, None)


@router.get("", response_model=list[RepositoryOut])
def list_repositories(db: Session = Depends(get_db)):
    return db.query(Repository).order_by(Repository.created_at.desc()).all()


@router.get("/{repository_id}", response_model=RepositoryOut)
def get_repository(repository_id: str, db: Session = Depends(get_db)):
    repo = db.get(Repository, repository_id)
    if repo is None:
        raise HTTPException(status_code=404, detail="Repository not found.")
    return repo


@router.delete("/{repository_id}", status_code=204)
def delete_repository(repository_id: str, db: Session = Depends(get_db)):
    repo = db.get(Repository, repository_id)
    if repo is None:
        raise HTTPException(status_code=404, detail="Repository not found.")
    intake.remove_workspace(repo.workspace_path)
    db.delete(repo)
    db.commit()
