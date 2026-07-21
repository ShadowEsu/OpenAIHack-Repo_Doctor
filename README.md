<div align="center">

# Repo Doctor

### An AI health clinic for messy codebases

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)

<br />

Repo Doctor examines your repository, diagnoses issues with evidence, and provides
safe treatments that improve code quality without breaking anything.

<br />

**[Live Demo](https://repo-doctor.vercel.app)** · **[Design Spec](DESIGN.md)** · **[Report Bug](https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor/issues)**

<br />

![Repo Doctor Preview](https://via.placeholder.com/1200x600/09090B/2DD4BF?text=Repo+Doctor+Dashboard)

</div>

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### Examination
- Analyzes repository structure, dependencies, and patterns
- Detects technologies and maps file relationships
- Identifies security vulnerabilities and code smells
- Reviews test coverage and documentation

</td>
<td width="50%" valign="top">

### Diagnosis
- Evidence-based findings with confidence scores
- Severity ratings (Critical → Low) with affected files
- Code snippets and line references for every issue
- Repairability assessment for each finding

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Treatment
- Safe, reversible code repairs
- Full diff review before applying changes
- Verification: linting, type checking, tests, build
- One-click rollback if anything fails

</td>
<td width="50%" valign="top">

### Health Dashboard
- Health score across 6 dimensions
- Security, Reliability, Maintainability, Testing, Documentation, Dependencies
- Score trends over time
- Treatment history with before/after comparison

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | TanStack Query |
| Validation | Zod |
| Font | Geist Sans / Geist Mono |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+
- Git (required when examining a public GitHub repository)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor.git
cd OpenAIHack-Repo_Doctor

# Install exact frontend dependencies
npm ci

# Configure the frontend-to-backend URL
cp .env.example .env.local

# Install backend dependencies
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env

# Start the backend (terminal 1)
.venv/bin/uvicorn app.main:app --reload --port 8000

# Start the frontend (terminal 2, from the repository root)
cd ../..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The backend
health check is available at [http://localhost:8000/api/health](http://localhost:8000/api/health).

An OpenAI API key is **not configured yet and is not required to run the app**.
Without it, Repo Doctor uses its deterministic rule-based diagnosis engine. When
the team is ready, put `OPENAI_API_KEY` only in `apps/api/.env` or the backend
hosting provider's secret settings. Never put it in a `NEXT_PUBLIC_` variable or
commit it to Git.

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── connect/                  # Repository connection
│   ├── exam/[id]/progress/       # Examination progress
│   ├── sample/                   # Sample health report
│   └── app/repos/                # Application shell
│       ├── [repoId]/             # Repository dashboard
│       │   ├── diagnoses/        # Diagnosis list + detail
│       │   ├── treatments/       # Treatment list + detail
│       │   ├── history/          # Treatment history
│       │   └── settings/         # Repository settings
│       └── page.tsx              # Repository list
│
├── components/                   # React components
│   ├── layout/                   # AppShell, Sidebar, TopBar, MobileNav
│   ├── health/                   # HealthScore, Dimensions, Trend
│   ├── diagnosis/                # Cards, Filters, Detail, Evidence
│   ├── treatment/                # Proposal, Diff, Verification
│   ├── repository/               # Cards, Identity, Badges
│   ├── code/                     # CodeSnippet, FilePath, Diff
│   └── feedback/                 # Empty, Error, Loading, Toast
│
├── lib/                          # Utilities and types
│   ├── types.ts                  # TypeScript interfaces
│   ├── api.ts                    # FastAPI client + sample-page fixtures
│   ├── utils.ts                  # Helper functions
│   ├── theme-provider.tsx        # Dark mode context
│   └── providers.tsx             # TanStack Query provider
│
└── globals.css                   # Design tokens + animations
```

---

## Design System

### Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent` | `#0D9488` | `#2DD4BF` | Primary actions |
| `--success` | `#16A34A` | `#4ADE80` | Passed, healthy |
| `--warning` | `#D97706` | `#FBBF24` | Warnings |
| `--critical` | `#DC2626` | `#F87171` | Errors, severe |
| `--info` | `#2563EB` | `#60A5FA` | Informational |

### Severity System

Every diagnosis uses **icon + text + color** (never color-only):

| Severity | Icon | Color |
|----------|------|-------|
| Critical | Alert Triangle | Red |
| High | Arrow Up | Amber |
| Medium | Minus | Blue |
| Low | Arrow Down | Gray |

### Animations

- **Fade in up** — Page load, list items
- **Scale in** — Score reveal, badges
- **Gradient shift** — Hero text
- **Pulse glow** — Active states
- **Spring** — Drawer open/close
- **Stagger** — Sequential reveals

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/connect` | Connect a repository |
| `/sample` | Sample health report |
| `/exam/[id]/progress` | Examination progress |
| `/app/repos` | Repository list |
| `/app/repos/[repoId]` | Repository overview |
| `/app/repos/[repoId]/diagnoses` | Diagnosis list |
| `/app/repos/[repoId]/diagnoses/[id]` | Diagnosis detail |
| `/app/repos/[repoId]/treatments` | Treatment list |
| `/app/repos/[repoId]/treatments/[id]` | Treatment detail |
| `/app/repos/[repoId]/history` | Treatment history |
| `/app/repos/[repoId]/settings` | Repository settings |

---

## API Contract

The product frontend is connected to these FastAPI endpoints:

```typescript
POST   /api/repositories/github
POST   /api/repositories/upload
GET    /api/repositories[/:id]
DELETE /api/repositories/:id

POST   /api/repositories/:id/examinations
GET    /api/repositories/:id/examinations/latest
GET    /api/examinations/:id/progress
GET    /api/examinations/:id/health-record
GET    /api/examinations/:id/diagnoses

GET    /api/diagnoses/:id
PATCH  /api/diagnoses/:id/status
POST   /api/diagnoses/:id/treatment-proposal

GET    /api/repositories/:id/treatments
GET    /api/treatments/:id
POST   /api/treatments/:id/approve
POST   /api/treatments/:id/apply
GET    /api/treatments/:id/verification
POST   /api/treatments/:id/rollback
GET    /api/treatments/:id/download
```

TypeScript types are defined in `src/lib/types.ts`.

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop | ≥1280px | Sidebar + content |
| Laptop | 1024-1279px | Collapsible sidebar |
| Tablet | 768-1023px | No sidebar, bottom nav |
| Mobile | <768px | Bottom nav, stacked |

---

## Accessibility

- Skip-to-content link
- Keyboard navigation throughout
- ARIA labels on all interactive elements
- Severity badges use icon + text + color
- Focus-visible rings on all focusable elements
- Reduced motion support
- Screen reader announcements for progress

---

## Environment Variables and Deployment

For the frontend, configure the public backend URL at build time:

```env
NEXT_PUBLIC_API_URL=https://your-api.example.com/api
```

For the FastAPI service, configure `DATABASE_URL`, `WORKSPACE_ROOT`, and
`CORS_ORIGINS=https://your-frontend.example.com`. `OPENAI_API_KEY` remains
optional. The backend includes a production Dockerfile at `apps/api/Dockerfile`;
deploy that service to a host with persistent storage, then deploy the Next.js
frontend with `NEXT_PUBLIC_API_URL` set to its HTTPS API URL.

Before a release, run `npm run build`, `npm run lint`, and
`apps/api/.venv/bin/pytest -q` from their respective directories, then repeat
the complete connect → examine → diagnose → treat → verify → download → rollback
flow against the deployed URLs.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT © 2026 Repo Doctor Team

---

<div align="center">

**Built for the OpenAI Hackathon · July 13-21, 2026**

[![Devpost](https://img.shields.io/badge/Devpost-Repo%20Doctor-blue?style=for-the-badge)](https://devpost.com/software/repo-doctor)

</div>
