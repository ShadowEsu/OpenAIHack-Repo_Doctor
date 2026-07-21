from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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


@app.exception_handler(HTTPException)
async def http_exception_with_frontend_message(request: Request, exc: HTTPException):
    """Keep FastAPI's detail field while supporting the frontend error contract."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "message": str(exc.detail)},
        headers=exc.headers,
    )


@app.get("/api/health", tags=["meta"])
def healthcheck():
    return {"status": "ok", "service": "repo-doctor-api"}
