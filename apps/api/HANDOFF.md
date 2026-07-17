# Repo Doctor — Backend Handoff

> Status as of July 17, 2026, branch `backend-gitanalysis`. The backend is **complete and verified working**: 28 tests pass, and the full upload → examine → diagnose → treat → verify flow has been exercised against a live server.

## What the backend is

A FastAPI (Python 3.10) service in `apps/api/` that implements the Repo Doctor spec: it ingests a repository, runs 10 deterministic scanners, produces an AI-assisted diagnosis list and a deterministic health score, and can apply **one safe repair at a time** to an isolated working copy with real verification. The original repository is never modified.

## How to run it

```bash
cd apps/api
python3 -m venv .venv               # already exists locally; needed on fresh clones
.venv/bin/pip install -r requirements.txt
cp .env.example .env                # optional: add OPENAI_API_KEY for AI diagnoses
.venv/bin/uvicorn app.main:app --reload --port 8000
```

- Interactive API docs: http://localhost:8000/docs
- Health check: `GET /api/health`
- Tests: `.venv/bin/python -m pytest -q` (28 passing)
- Demo fixture: `python scripts/make_sample_repo.py` writes `sample-repositories/messy-demo.zip`
- Docker: `docker build -t repo-doctor-api .` from `apps/api/`

No OpenAI key? Everything still works — diagnoses fall back to rule-based grouping and the examination records `ai_engine: "rule-based"` so the UI can label it honestly.

## API surface (what the frontend calls)

Base URL `http://localhost:8000`. CORS is open for `http://localhost:3000`.

### 1. Intake
- `POST /api/repositories/github` — body `{"url": "https://github.com/owner/repo"}` (public repos only)
- `POST /api/repositories/upload` — multipart form, field `file`, a `.zip`
- Both return a `Repository` with `id`, detected `languages`, `frameworks`, `file_count`, `has_tests`, `package_manager` — everything the intake screen needs.
- `GET /api/repositories`, `GET/DELETE /api/repositories/{id}`

### 2. Examination
- `POST /api/repositories/{id}/examinations` → `202` with examination `id`; runs in the background
- `GET /api/examinations/{id}/progress` → poll this; returns `status`, `current_stage`, `completed_stages`, and `all_stages` (the 11 spec stages) for a real progress UI
- `GET /api/examinations/{id}` → full record incl. `health_score`, `health_grade`, `dimension_scores` (security/reliability/maintainability/testing/documentation/dependencies)
- `GET /api/examinations/{id}/health-record` → dashboard payload: counts by severity, `repairable_count`, `estimated_technical_debt`, `priority_diagnosis`
- `GET /api/examinations/{id}/diagnoses` — ordered by priority
- `GET /api/examinations/{id}/findings` — raw scanner findings

### 3. Diagnosis & treatment (one repair at a time, approval required)
- `GET /api/diagnoses/{id}`; `PATCH /api/diagnoses/{id}/status` body `{"status": "open|dismissed|treated"}`
- `POST /api/diagnoses/{id}/treatment-proposal` → creates a `Treatment` containing `proposal_summary`, `side_effects`, `risk_level`, `verification_plan`, the patch operations, and a ready-to-render unified `diff_text`. Returns `422` with a plain-English reason if no safe treatment applies.
- `POST /api/treatments/{id}/approve` → must be called before apply (spec: never modify without approval)
- `POST /api/treatments/{id}/apply` → `202`; applies the patch **to an isolated working copy only**, runs verification, re-scans, computes before/after score. Poll `GET /api/treatments/{id}` until `status` is `succeeded` or `failed`; the record has `health_score_before/after`, `files_changed`, `insertions`, `deletions`, `remaining_issues`, `new_issues`.
- `GET /api/treatments/{id}/verification` → lint/typecheck/test/build/syntax statuses (`passed|failed|skipped`) with captured output and honest notes for skipped checks
- `POST /api/treatments/{id}/rollback`; `GET /api/treatments/{id}/download` → patched repo as ZIP

## What's implemented inside

- **Scanners (10)** in `app/scanners/`: broken imports, hardcoded secrets (masked, entropy-checked, never sent to AI), env-variable problems, giant files, duplicate code, dead files, unused dependencies, weak tests, documentation gaps, weak error handling. Each finding has severity, confidence, file/line, evidence.
- **Import graph** (`app/services/import_graph.py`): JS/TS regex + Python AST parsing, relative/alias resolution, entry-point detection — powers dead-file and broken-import detection.
- **Scoring** (`app/services/scoring.py`): deterministic weighted dimensions (security 25%, reliability 20%, maintainability 20%, testing 15%, docs 10%, deps 10%), capped deductions, grades from "Excellent" to "Critical". The AI never invents scores.
- **AI layer** (`app/ai/diagnosis.py`): OpenAI (`gpt-4o-mini` default) with strict JSON validation — unknown file paths and finding IDs are rejected; rule-based fallback otherwise.
- **Treatments** (`app/treatments/`): `create_env_example` (never copies secret values), `remove_unused_import`, `improve_readme` (only verified commands from real manifests), `remove_dead_file` (high-confidence only).
- **Safety**: zip-slip/path-traversal/symlink protection on upload, size/file-count limits, shallow clones with timeouts, command allowlist (`npm|pnpm|yarn|bun|npx|node|python|pytest` only), all patches path-validated inside the working copy, structured JSON logging.
- **Storage**: SQLite via SQLAlchemy 2.0 (`data/repo_doctor.db`), Postgres-swappable via `DATABASE_URL`. Models: Repository, Examination, Finding, Diagnosis, DiagnosisFile, Treatment, VerificationRun, HealthSnapshot.

## Verified demo flow (ran successfully today)

1. Upload `sample-repositories/messy-demo.zip` → repo registered
2. Start examination → completes in ~1s for the demo repo; all 11 stages reported
3. Health record: score **69.7 ("Needs attention")**, security dimension 30 (planted fake API key found)
4. Propose `create_env_example` treatment → approve → apply
5. Result: `succeeded`, score **69.7 → 71.1**, 1 file changed (+11), rollback available

## Known limitations / notes for the frontend

- Verification runs lint/test/build only when the repo's tooling is available; otherwise those checks report `skipped` with a reason in `notes` — surface that honestly in the UI, don't render skipped as passed.
- `ALLOW_DEPENDENCY_INSTALL=false` by default, so npm-based verification on uploaded repos is usually syntax-check only.
- Private GitHub repos are rejected with a clear error message (public only for MVP).
- Progress is polling-based (no SSE/WebSocket yet) — poll `/progress` every ~500ms during an exam.
- The background examination runs in-process (FastAPI BackgroundTasks); fine for the hackathon, swap for a worker queue later.
