# Repo Doctor

Repo Doctor is an evidence-first interface for examining repository health,
reviewing diagnoses, and approving only safe, verifiable treatments.

## Local setup

```bash
npm install
npm run dev:all
```

Open the local URL printed by Vite. This starts the Vite frontend and the
included API at `http://localhost:8787/api`; the intake form validates public
GitHub URLs and displays server-supplied examination progress. To run them
separately, use `npm run server` and `npm run dev` in two terminals.

Build the production bundle with:

```bash
npm run build
```

## Backend integration

The project now includes a local, dependency-free backend for repository
intake. It validates public GitHub repositories through GitHub's API and
exposes `POST /api/repositories`, `GET /api/examinations/:id/progress`, and
`GET /api/examinations/:id`, plus `GET /api/health`. The completed health
record includes file-tree, language, CI, test, documentation, and lockfile
signals, each described as a structural observation rather than an invented
code-level diagnosis. Examinations are read-only and live in memory for the
server process.

To connect a compatible service, copy `.env.example` to `.env` and set
`VITE_API_BASE_URL`. The current service boundary expects `POST /repositories`
with `{ "source": "github", "url": "https://github.com/owner/repository" }`
and an examination response with `id` and `status` fields. See
`FRONTEND_AUDIT_AND_PLAN.md` for the complete required API surface and
deployment risks.

## Deploy on Vercel

The project is configured for a static Vite deployment via `vercel.json`. In
the Vercel project settings, add `VITE_API_BASE_URL` for Production, Preview,
and Development. Then deploy with:

```bash
npx vercel link
npx vercel --prod
```

No Vercel project has been linked or deployed from this checkout yet, because
that action requires the team's Vercel account and target project selection.

## macOS DMG

The web interface has a secure Electron wrapper configured for macOS. When the
team is ready to create a DMG, install dependencies and run:

```bash
npm run desktop:package
```

The resulting unsigned DMG will be placed in `release/`. Public distribution
will additionally require an Apple Developer certificate, hardened runtime,
notarization credentials, and signing configuration; none of those secrets are
committed to the repository.
