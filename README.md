<div align="center">

# Repo Doctor

### A calm, evidence-first workspace for repository health.

Connect a public GitHub repository. See the signal. Review the next safe repair.

[**Open the app →**](https://repo-doctor-two.vercel.app) &nbsp;·&nbsp; [**Visit the launch website →**](https://website-six-khaki-20.vercel.app) &nbsp;·&nbsp; [Report an issue](https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor/issues)

<br />

![Next.js](https://img.shields.io/badge/Next.js_16-031614?style=flat-square&logo=next.js&logoColor=EAFBF8)
![React](https://img.shields.io/badge/React_19-031614?style=flat-square&logo=react&logoColor=1AC0AD)
![TypeScript](https://img.shields.io/badge/TypeScript-031614?style=flat-square&logo=typescript&logoColor=1AC0AD)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-031614?style=flat-square&logo=vercel&logoColor=EAFBF8)

</div>

<br />

> **Public repositories in. Clear engineering signal out.**
>
> Repo Doctor maps a public repository, reviews safe metadata and manifest excerpts with a server-side model, and turns supported findings into review-only repair proposals. It never writes to GitHub.

## The flow

```text
Connect a repository  →  Map its public structure  →  Review evidence  →  Plan a safe repair
```

| 01 · Connect | 02 · Examine | 03 · Repair |
| --- | --- | --- |
| Paste a public `github.com/owner/repo` URL. | Repo Doctor reads the public tree and a bounded set of safe project files. | Generate a small unified diff to review and apply yourself. |

## What it does

### One workspace. One glance.

- **Live public-repository scans** — validates GitHub repositories, indexes the public file tree, and inspects safe manifest excerpts.
- **Evidence-first findings** — every finding includes the supporting path or inventory evidence; unsupported metadata is filtered out.
- **Model-assisted repair planning** — creates a review-only unified diff from the cited public file when there is enough context.
- **No invisible writes** — Repo Doctor does not commit, push, or modify GitHub repositories.

### Built to stay out of the way.

| Signal | What happens |
| --- | --- |
| **Public only** | Private repositories are not scanned. |
| **Bounded context** | File inventories are capped and only selected, text-based project files are read. |
| **Server-side model key** | The AI credential stays in Vercel’s encrypted server environment—never in the browser or this repository. |
| **Human in control** | A repair is a proposal, not an automatic change. Review it, test it, and merge it on your terms. |

## Quick start

```bash
git clone https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor.git
cd OpenAIHack-Repo_Doctor
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000), select **Connect a repository**, and paste a public GitHub URL.

### Environment

The app runs without a browser-exposed secret. To enable live model-backed scans and repair proposals locally, add a server-only key:

```bash
# .env.local — do not commit this file
GROQ_API_KEY=your_key_here
# Optional; defaults to llama-3.3-70b-versatile
GROQ_MODEL=llama-3.3-70b-versatile
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js app |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Architecture

```text
src/
├── app/
│   ├── connect/          # Repository URL entry
│   ├── scan/             # Live scan and repair-review experience
│   └── api/
│       ├── repositories/ # Public GitHub validation
│       ├── scan/         # Bounded GitHub + model-backed review
│       └── repair/       # Review-only unified-diff proposal
└── lib/server/
    ├── github.ts         # Public GitHub snapshot and safe file reads
    └── groq.ts           # Server-side structured model requests
```

## Stack

**Next.js 16** · **React 19** · **TypeScript** · **Tailwind CSS 4** · **Framer Motion** · **Vercel**

## Live links

| Destination | Link |
| --- | --- |
| **Repo Doctor app** | [repo-doctor-two.vercel.app](https://repo-doctor-two.vercel.app) |
| **Launch website** | [website-six-khaki-20.vercel.app](https://website-six-khaki-20.vercel.app) |

For production, configure `GROQ_API_KEY` as an encrypted Vercel environment variable. Do not use a `NEXT_PUBLIC_` prefix and do not commit credentials.

---

<div align="center">

**Less guesswork. More signal.**

Built for engineers who want to understand a repository before they touch it.

</div>
