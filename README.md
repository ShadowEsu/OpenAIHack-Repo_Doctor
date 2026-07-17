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

- Node.js 18+ (recommended: 20)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor.git
cd OpenAIHack-Repo_Doctor

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
│   ├── api.ts                    # API client + mock data
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

The frontend expects these endpoints from the backend:

```typescript
POST   /api/repos/connect              // Connect repository
GET    /api/repos                       // List repositories
GET    /api/repos/:id                   // Get repository
DELETE /api/repos/:id                   // Delete repository

POST   /api/repos/:id/examine           // Start examination
GET    /api/repos/:id/examination        // Get examination status

GET    /api/repos/:id/health             // Get latest health record
GET    /api/repos/:id/health/history     // Get health history

GET    /api/repos/:id/diagnoses          // List diagnoses
GET    /api/repos/:id/diagnoses/:id      // Get diagnosis
PATCH  /api/repos/:id/diagnoses/:id      // Update diagnosis status

POST   /api/repos/:id/treatments         // Create treatment proposal
GET    /api/repos/:id/treatments         // List treatments
GET    /api/repos/:id/treatments/:id     // Get treatment
POST   /api/repos/:id/treatments/:id/approve  // Approve treatment
POST   /api/repos/:id/treatments/:id/rollback // Rollback treatment
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

## Environment Variables

No environment variables required for development. The app uses mock data.

For production, configure:

```env
NEXT_PUBLIC_API_URL=https://your-api.com
```

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
