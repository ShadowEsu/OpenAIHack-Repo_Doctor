<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repo Doctor Website — Agent Instructions

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion. Deployed on Vercel.

## Design Tokens

Tailwind theme tokens are already configured. Reuse these values; do not invent new colors:

- background: `#031614`
- background-elevated: `#0A2320`
- accent: `#1AC0AD`
- accent-secondary: `#0E6B60`
- text-primary: `#EAFBF8`
- text-muted: `#7FA39D`
- status-critical: `#FF5C5C`
- status-warning: `#FFB020`
- status-success: `#3DDC97`

## Typography

Use a sans-serif font (Inter or Geist via `next/font`) for body copy and headings. Use a monospace font (JetBrains Mono or Geist Mono) for code, metrics, and technical labels only.

## Product Context

Repo Doctor is an AI health-clinic for messy codebases: it diagnoses maintainability issues in a repository, explains them with evidence and a confidence score, and safely repairs one issue at a time in an isolated working copy after explicit user approval. This is a marketing/landing website for the product, not the product itself — no real backend calls; all content is static or mocked for presentation.

## Quality Bar & Anti-Patterns

- Never leave lorem ipsum, TODO comments, or placeholder buttons that go nowhere.
- Every section must be responsive at 375px, 768px, and 1440px.
- Do not make unsupported product claims such as “finds every bug” or “guarantees secure code.”
- Prefer editorial, intentional design over generic template layouts: bold typography, purposeful color use, meaningful motion, and no default flat purple-on-white patterns.
- Run `npm run build` before considering a phase done; fix any errors.

## Structural Blueprint (Nominal.so Inspiration)

When building sections, adhere to these structural patterns:

- A row of small tag/pill labels above the hero headline.
- A horizontal marquee strip directly under the hero, focused on the tech stack rather than client logos.
- Three-pillar feature cards: icon, bold title, one-liner, and bullet sublist.
- A prominent outcomes row using oversized numbers as the visual hook (for example, principles-as-stats).
- A numbered “01 / 02 / 03 / 04” section where a label pins on one side while content changes on the other while scrolling.
- A carousel-style social-proof section for personas or use cases.
- A single centered final CTA banner before the footer.
