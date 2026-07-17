from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import diagnoses, examinations, repositories, treatments
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    init_db()
    yield


app = FastAPI(
    title="Repo Doctor API",
    description="An AI health clinic for messy codebases.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repositories.router)
app.include_router(examinations.router)
app.include_router(diagnoses.router)
app.include_router(treatments.router)


@app.get("/api/health", tags=["meta"])
def healthcheck():
    return {"status": "ok", "service": "repo-doctor-api"}
