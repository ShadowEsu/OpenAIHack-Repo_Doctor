# Repo Doctor

Repo Doctor is an evidence-first interface for examining repository health,
reviewing diagnoses, and approving only safe, verifiable treatments.

## Local setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Build the production bundle with:

```bash
npm run build
```

## Backend integration

The initial checkout did not contain a backend. The interface is deliberately
honest about that state: without `VITE_API_BASE_URL`, repository validation
shows a recoverable unavailable message instead of fabricated analysis data.

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
