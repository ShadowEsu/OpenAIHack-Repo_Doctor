"""End-to-end API flow: upload -> examine -> health record -> diagnosis ->
treatment proposal -> approve -> apply -> verification -> download."""
from __future__ import annotations

import io
import time
import zipfile

import pytest
from fastapi.testclient import TestClient

from tests.conftest import MESSY_FILES


@pytest.fixture
def client():
    from app.db import init_db
    from app.main import app

    init_db()
    with TestClient(app) as c:
        yield c


def _upload_messy_repo(client) -> str:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        for name, content in MESSY_FILES.items():
            zf.writestr(f"messy-demo/{name}", content)
    response = client.post(
        "/api/repositories/upload",
        files={"file": ("messy-demo.zip", buffer.getvalue(), "application/zip")},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _run_examination(client, repo_id: str) -> str:
    response = client.post(f"/api/repositories/{repo_id}/examinations")
    assert response.status_code == 202, response.text
    exam_id = response.json()["id"]
    for _ in range(120):
        progress = client.get(f"/api/examinations/{exam_id}/progress").json()
        if progress["status"] in ("completed", "failed"):
            break
        time.sleep(0.25)
    assert progress["status"] == "completed", progress
    return exam_id


def test_healthcheck(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_full_flow(client):
    repo_id = _upload_messy_repo(client)

    repo = client.get(f"/api/repositories/{repo_id}").json()
    assert repo["primary_language"] == "TypeScript"
    assert "Next.js" in repo["frameworks"]

    exam_id = _run_examination(client, repo_id)

    latest = client.get(f"/api/repositories/{repo_id}/examinations/latest")
    assert latest.status_code == 200, latest.text
    assert latest.json()["id"] == exam_id

    record = client.get(f"/api/examinations/{exam_id}/health-record")
    assert record.status_code == 200, record.text
    record = record.json()
    assert record["examination"]["health_score"] < 100
    assert record["critical_count"] >= 1  # hardcoded API key
    assert record["repairable_count"] >= 1
    assert record["priority_diagnosis"] is not None

    diagnoses = client.get(f"/api/examinations/{exam_id}/diagnoses").json()
    assert diagnoses
    env_diag = next((d for d in diagnoses if d["repair_type"] == "create_env_example"), None)
    assert env_diag is not None, [d["title"] for d in diagnoses]

    # secrets must never appear unmasked anywhere in the diagnosis payload
    full_text = str(diagnoses)
    assert "sk-proj-Zz9Xy8Ww7Vv6Uu5Tt4Ss3Rr2Qq1Pp0Oo" not in full_text

    # treatment proposal
    proposal = client.post(f"/api/diagnoses/{env_diag['id']}/treatment-proposal")
    assert proposal.status_code == 201, proposal.text
    treatment = proposal.json()
    assert treatment["status"] == "proposed"
    assert treatment["diff_text"]
    assert "API_BASE_URL" in treatment["diff_text"]
    assert "sk-proj-" not in treatment["diff_text"]  # no secrets copied

    repository_treatments = client.get(f"/api/repositories/{repo_id}/treatments")
    assert repository_treatments.status_code == 200, repository_treatments.text
    assert [item["id"] for item in repository_treatments.json()] == [treatment["id"]]

    # applying before approval must be rejected
    denied = client.post(f"/api/treatments/{treatment['id']}/apply")
    assert denied.status_code == 409

    # approve then apply
    approved = client.post(f"/api/treatments/{treatment['id']}/approve")
    assert approved.status_code == 200
    applied = client.post(f"/api/treatments/{treatment['id']}/apply")
    assert applied.status_code == 202

    for _ in range(240):
        status = client.get(f"/api/treatments/{treatment['id']}").json()
        if status["status"] in ("succeeded", "failed"):
            break
        time.sleep(0.25)
    assert status["status"] == "succeeded", status
    assert status["health_score_after"] is not None
    assert status["health_score_after"] >= status["health_score_before"]
    assert status["rollback_available"] is True

    verification = client.get(f"/api/treatments/{treatment['id']}/verification").json()
    assert verification
    # documentation-only change: syntax honestly reported as skipped or passed, never failed
    assert verification[0]["syntax_status"] in ("passed", "skipped")

    download = client.get(f"/api/treatments/{treatment['id']}/download")
    assert download.status_code == 200
    assert download.headers["content-type"] == "application/zip"

    # rollback
    rolled = client.post(f"/api/treatments/{treatment['id']}/rollback")
    assert rolled.status_code == 200
    assert rolled.json()["status"] == "rolled_back"


def test_invalid_github_url_is_rejected(client):
    response = client.post("/api/repositories/github", json={"url": "https://gitlab.com/a/b"})
    assert response.status_code == 400
    assert "GitHub" in response.json()["detail"]


def test_vite_frontend_contract(client, messy_repo, monkeypatch):
    from app.api import repositories

    monkeypatch.setattr(
        repositories.intake,
        "clone_github_repository",
        lambda url: (messy_repo, "messy-demo", "main"),
    )
    submitted = client.post(
        "/api/repositories",
        json={"source": "github", "url": "https://github.com/example/messy-demo"},
    )
    assert submitted.status_code == 201, submitted.text
    examination_id = submitted.json()["id"]

    progress = client.get(f"/api/examinations/{examination_id}/progress").json()
    assert progress["stage"] == "Examination complete"
    assert progress["completed"] == progress["total"]
    assert progress["message"]

    report = client.get(f"/api/examinations/{examination_id}")
    assert report.status_code == 200, report.text
    body = report.json()
    assert body["repository"] == "messy-demo"
    assert body["defaultBranch"] == "main"
    assert body["fileCount"] == 8
    assert body["score"] < 100
    assert body["checks"] and body["diagnoses"]
    assert {item["severity"] for item in body["diagnoses"]} <= {"critical", "warning", "info"}


def test_vite_origin_is_allowed_by_cors(client):
    response = client.options(
        "/api/repositories",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_next_origin_is_allowed_by_cors(client):
    response = client.options(
        "/api/repositories/upload",
        headers={
            "Origin": "http://127.0.0.1:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:3000"
