<div align="center">

<img src="https://raw.githubusercontent.com/ShadowEsu/OpenAIHack-Repo_Doctor/launchwebsite/public/logo.png" width="112" alt="Repo Doctor logo" />

# Repo Doctor

### Codebase health, explained.

An evidence-first workspace for understanding a public repository before changing it.

[**Open the live app →**](https://repo-doctor-two.vercel.app) &nbsp;·&nbsp; [**Visit the launch website →**](https://website-six-khaki-20.vercel.app) &nbsp;·&nbsp; [Report an issue](https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor/issues)

<br />

![Vite](https://img.shields.io/badge/Vite-101311?style=flat-square&logo=vite&logoColor=8B5CF6)
![TypeScript](https://img.shields.io/badge/TypeScript-101311?style=flat-square&logo=typescript&logoColor=2DD4BF)
![Node.js](https://img.shields.io/badge/Node.js-101311?style=flat-square&logo=node.js&logoColor=2DD4BF)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-101311?style=flat-square&logo=vercel&logoColor=FFFFFF)

</div>

<br />

> **Connect a repository. Find the signal. Make a safer next move.**
>
> Repo Doctor validates a public GitHub repository, maps its structure, checks practical hygiene signals, and presents the result as a clear health record. It is read-only: no clone, commit, push, or hidden code change.

## How it works

```text
Public GitHub URL  →  Validate  →  Map the repository  →  Review the health record
```

| 01 · Intake | 02 · Examination | 03 · Evidence |
| --- | --- | --- |
| Submit a public `github.com/owner/repo` URL. | Repo Doctor reads GitHub metadata, languages, and the default-branch file tree. | Review structural signals for documentation, automation, testing, and dependency hygiene. |

## What Repo Doctor checks

The current examination is deliberately conservative. It reports only facts supported by the public repository tree.

- **Repository reachability** — confirms that the repository exists and is public.
- **Language signals** — reads GitHub’s language metadata.
- **Project structure** — maps the default-branch file tree.
- **Continuous integration** — checks for GitHub Actions workflows.
- **Test conventions** — looks for conventional test, spec, and `__tests__` paths.
- **Documentation** — checks for a root README.
- **Dependency hygiene** — looks for `.gitignore` and recognized dependency lockfiles.

Each structural observation has a severity, confidence level, affected path, and plain-language explanation. A structural result is never presented as proof of runtime coverage, code correctness, or a security vulnerability.

## Safety model

| Principle | What it means |
| --- | --- |
| **Public data only** | The API accepts public GitHub URLs only. |
| **Read-only examination** | Repo Doctor reads GitHub API responses; it does not write back to GitHub. |
| **Bounded requests** | Request bodies have a size limit and GitHub requests time out after 10 seconds. |
| **No invented diagnoses** | Results are derived from repository metadata and file-tree signals. |
| **Human control** | The health record is decision support, not an automatic repair system. |

## Local development

### Requirements

- Node.js 18 or newer
- npm

### Run the app and local API

```bash
git clone https://github.com/ShadowEsu/OpenAIHack-Repo_Doctor.git
cd OpenAIHack-Repo_Doctor
npm install
npm run dev:all
```

The Vite frontend starts on the URL printed by Vite. The local API listens at `http://localhost:8787/api`.

To run each service separately:

```bash
npm run server
npm run dev
```

## API flow

```text
POST /api/repositories
  { "source": "github", "url": "https://github.com/owner/repository" }
  → { "id": "…", "status": "running" }

GET /api/examinations/:id/progress
  → current stage, message, completed steps, total steps

GET /api/examinations/:id
  → completed health record, score, checks, and diagnoses
```

The local server stores active examinations in memory. Restarting it clears previous examination records.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend |
| `npm run server` | Start the local Node API on port 8787 |
| `npm run dev:all` | Start both services |
| `npm run build` | Type-check and create the production Vite bundle |
| `npm run preview` | Preview the production bundle locally |
| `npm run desktop:package` | Package the Electron macOS DMG |

## Architecture

```text
src/                 # TypeScript frontend
server/index.mjs     # Dependency-free Node HTTP API
api/                 # Vercel-compatible serverless routes
electron/            # Optional macOS desktop wrapper
vercel.json          # Static Vite deployment configuration
```

## Deployment

The repository is configured for a static Vite deployment through Vercel.

```bash
npm run build
npx vercel --prod
```

For a separate backend, set `VITE_API_BASE_URL` in `.env` using `.env.example` as the starting point.

## Live links

| Destination | Link |
| --- | --- |
| **Repo Doctor app** | [repo-doctor-two.vercel.app](https://repo-doctor-two.vercel.app) |
| **Launch website** | [website-six-khaki-20.vercel.app](https://website-six-khaki-20.vercel.app) |

---

<div align="center">

**Less guesswork. More signal.**

Built for developers who want to understand a repository before they touch it.

</div>
