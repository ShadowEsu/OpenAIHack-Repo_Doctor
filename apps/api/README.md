# Repo Doctor — Backend API

FastAPI backend for **Repo Doctor**, an AI health clinic for messy codebases.
It examines a repository, diagnoses maintainability and reliability problems
with evidence and confidence, and applies safe, verified repairs one at a time
— always in an isolated working copy, never touching the original repository.

## Architecture

```
Intake (GitHub clone / ZIP upload, path-safety validated)
  → Isolated workspace
  → File inventory + language/framework detection
  → Import graph (JS/TS regex + Python AST)
  → 10 deterministic scanners (structured findings)
  → AI diagnosis layer (OpenAI, strict-JSON validated; rule-based fallback)
  → Deterministic health score (weighted dimensions, capped deductions)
  → Treatment proposal (patch + diff, requires explicit approval)
  → Apply in working copy → verification (syntax / lint / tests / build)
  → Before-and-after health comparison, rollback, ZIP download
```

### Scanners

broken imports · hardcoded secrets (masked, never sent to AI) · env-variable
documentation · giant files · duplicate code · dead files · unused
dependencies · weak tests · documentation quality · weak error handling

### Treatments

| Treatment | Risk | Notes |
|---|---|---|
| Create/update `.env.example` | low | never copies secret values |
| Remove duplicate/unused import | low | keeps first occurrence |
| Improve README setup section | low | only verified commands from manifests |
| Remove confirmed dead file | medium | high-confidence findings only |

## Local development

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env          # optionally add OPENAI_API_KEY
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Interactive docs: http://localhost:8000/docs — health check: `GET /api/health`.

Without an `OPENAI_API_KEY`, diagnosis falls back to deterministic rule-based
grouping; the examination records which engine produced it (`ai_engine`).

## Tests

```bash
.venv/bin/python -m pytest tests/ -q
```

Includes unit tests for every scanner, scoring, intake safety (zip-slip,
traversal), and a full end-to-end API flow test.

## Demo repository

```bash
.venv/bin/python scripts/make_sample_repo.py
```

Writes `sample-repositories/messy-demo/` (and a `.zip`) containing a broken
import, duplicate components, a **fake** API key, undocumented env vars, an
unused dependency, a trivial test, an incomplete README, an empty catch block,
and an abandoned backup file.

## API overview

```
POST   /api/repositories/github            {"url": "https://github.com/owner/repo"}
POST   /api/repositories/upload            multipart ZIP
GET    /api/repositories[/{id}]            list / detail
DELETE /api/repositories/{id}

POST   /api/repositories/{id}/examinations start examination (async, 202)
GET    /api/examinations/{id}/progress     poll examination stages
GET    /api/examinations/{id}/diagnoses    filters: severity, category, repairable, status, file, min_confidence
GET    /api/examinations/{id}/health-record

GET    /api/diagnoses/{id}
PATCH  /api/diagnoses/{id}/status          open | dismissed | treated
POST   /api/diagnoses/{id}/treatment-proposal

POST   /api/treatments/{id}/approve        required before apply
POST   /api/treatments/{id}/apply          async; poll GET /api/treatments/{id}
GET    /api/treatments/{id}/verification
POST   /api/treatments/{id}/rollback
GET    /api/treatments/{id}/download       patched repository as ZIP
```

## Configuration

See [.env.example](.env.example). SQLite by default; set `DATABASE_URL` to a
PostgreSQL URL for production. `ALLOW_DEPENDENCY_INSTALL=true` lets
verification run `npm install` inside working copies (off by default).

## Docker

```bash
docker build -t repo-doctor-api apps/api
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... repo-doctor-api
```

## Security measures & limitations

- Shallow clones with git hooks disabled and timeouts; public repos only.
- ZIP extraction rejects path traversal, absolute paths, symlinks, oversized
  archives, and excessive file counts.
- Detected secrets are masked everywhere and their evidence is withheld from
  the AI (`safe_for_ai=false`); `.env` values are never sent to the AI.
- Verification only runs allowlisted executables (npm/pnpm/yarn/node/pytest…)
  inside the working copy with timeouts and truncated output. AI-generated
  shell commands are never executed.
- Patches are validated to stay inside the working copy; the original
  workspace is never modified.
- Honest failure states: checks that cannot run are reported as `skipped`
  with a reason, never as passed.
- Limitations: no sandboxing beyond process isolation (repository code is
  only executed if verification scripts run it); dead-file and unused-
  dependency detection is static and can produce false positives (reflected
  in confidence scores).
