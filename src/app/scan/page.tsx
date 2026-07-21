"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Bot, CheckCircle2, Clipboard, FileCode2, LoaderCircle, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";

type Finding = { id: string; title: string; severity: "critical" | "high" | "medium" | "low"; category: string; summary: string; evidence: string; path: string | null; repairable: boolean };
type Scan = { repository: { fullName: string; url: string; defaultBranch: string; files: string[] }; review: { score: number; summary: string; findings: Finding[] }; scannedAt: string; mode: string };
type Repair = { summary: string; risk: "low" | "medium" | "high"; assumptions: string[]; verification: string[]; patch: string; applied: false };

const severityClass = { critical: "border-critical/35 bg-critical/10 text-critical", high: "border-warning/35 bg-warning/10 text-warning", medium: "border-accent/30 bg-accent/10 text-accent", low: "border-border bg-surface-elevated text-text-secondary" };

function ScanPageContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [repair, setRepair] = useState<Repair | null>(null);
  const [repairing, setRepairing] = useState<string | null>(null);

  useEffect(() => {
    if (!url) { setError("No repository URL was provided."); return; }
    let active = true;
    fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })
      .then(async (response) => {
        const payload = await response.json() as Scan | { message?: string };
        if (!response.ok) throw new Error("message" in payload ? payload.message : "The scan could not be completed.");
        if (active) setScan(payload as Scan);
      })
      .catch((reason: Error) => active && setError(reason.message));
    return () => { active = false; };
  }, [url]);

  async function generateRepair(finding: Finding) {
    if (!scan) return;
    setRepair(null); setRepairing(finding.id);
    try {
      const response = await fetch("/api/repair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repository: scan.repository, finding }) });
      const payload = await response.json() as Repair | { message?: string };
      if (!response.ok) throw new Error("message" in payload ? payload.message : "Could not generate a repair proposal.");
      setRepair(payload as Repair);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not generate a repair proposal."); }
    finally { setRepairing(null); }
  }

  async function copyPatch() { if (repair?.patch) await navigator.clipboard.writeText(repair.patch); }

  if (error) return <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6"><section className="w-full rounded-2xl border border-critical/30 bg-surface p-8 text-center"><AlertCircle className="mx-auto mb-4 text-critical" /><h1 className="text-xl font-semibold">Scan unavailable</h1><p className="mt-3 text-sm text-text-secondary">{error}</p><Link href="/connect" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"><ArrowLeft className="h-4 w-4" />Try another repository</Link></section></main>;
  if (!scan) return <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6"><section className="w-full rounded-2xl border border-strong bg-surface p-10 text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-accent" /><p className="mt-5 text-lg font-semibold">Examining the public repository</p><p className="mt-2 text-sm text-text-secondary">Mapping its file tree and reviewing safe manifest excerpts.</p></section></main>;

  return <main className="min-h-screen bg-background px-5 py-10 sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/connect" className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-accent"><ArrowLeft className="h-4 w-4" />New examination</Link><header className="rounded-2xl border border-strong bg-surface p-6 shadow-[0_20px_70px_rgb(0_0_0_/_0.16)] sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"><ShieldCheck className="h-3.5 w-3.5" />Live public-repository review</div><h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">{scan.repository.fullName}</h1><p className="mt-2 text-sm text-text-secondary">{scan.review.summary}</p><p className="mt-3 text-xs text-text-muted">Branch: {scan.repository.defaultBranch} · {scan.repository.files.length} indexed files · {scan.mode.replaceAll("-", " ")}</p></div><div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-accent/20 bg-background"><strong className="text-3xl text-accent">{scan.review.score}</strong><span className="text-[10px] uppercase tracking-[0.16em] text-text-muted">health</span></div></div></header>
  <section className="mt-8"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold">Evidence-backed findings</h2></div>{scan.review.findings.length === 0 ? <div className="rounded-xl border border-success/25 bg-success/10 p-6 text-sm text-success"><CheckCircle2 className="mr-2 inline h-4 w-4" />No concrete issues were found from the available metadata and manifest excerpts.</div> : <div className="grid gap-4">{scan.review.findings.map((finding) => <article key={finding.id} className="rounded-xl border border-border bg-surface p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${severityClass[finding.severity]}`}>{finding.severity}</span><span className="text-xs capitalize text-text-muted">{finding.category}</span></div><h3 className="mt-3 font-semibold text-text-primary">{finding.title}</h3><p className="mt-1 text-sm text-text-secondary">{finding.summary}</p><div className="mt-3 flex items-start gap-2 text-xs text-text-muted"><FileCode2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /><span>{finding.path ? `${finding.path}: ` : "Inventory evidence: "}{finding.evidence}</span></div></div>{finding.repairable && <button onClick={() => generateRepair(finding)} disabled={repairing !== null} className="inline-flex h-fit shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"><Wrench className="h-4 w-4" />{repairing === finding.id ? "Planning…" : "Plan repair"}</button>}</div></article>)}</div>}</section>
  {repair && <section className="mt-8 rounded-2xl border border-accent/25 bg-surface p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="inline-flex items-center gap-2 text-sm font-semibold text-accent"><Bot className="h-4 w-4" />Review-only repair proposal</div><p className="mt-2 text-sm text-text-secondary">{repair.summary}</p></div><span className="rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-xs capitalize text-text-secondary">{repair.risk} risk</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Assumptions</h3><ul className="mt-2 space-y-1 text-sm text-text-secondary">{repair.assumptions.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Verify before merge</h3><ul className="mt-2 space-y-1 text-sm text-text-secondary">{repair.verification.map((item) => <li key={item}>• {item}</li>)}</ul></div></div><div className="relative mt-5 overflow-hidden rounded-lg border border-border bg-[#02110f]"><button onClick={copyPatch} className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary hover:text-accent"><Clipboard className="h-3.5 w-3.5" />Copy</button><pre className="max-h-96 overflow-auto p-4 pr-20 text-xs leading-6 text-[#b9d9d4]">{repair.patch || "No safe patch could be proposed from metadata alone. Inspect the cited file, then rerun after adding the needed context."}</pre></div><p className="mt-3 text-xs text-text-muted">This proposal is never applied automatically and Repo Doctor does not write to GitHub.</p></section>}</div></main>;
}

export default function ScanPage() {
  return <Suspense fallback={<main className="mx-auto flex min-h-screen max-w-2xl items-center px-6"><section className="w-full rounded-2xl border border-strong bg-surface p-10 text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-accent" /><p className="mt-5 text-lg font-semibold">Preparing examination</p></section></main>}><ScanPageContent /></Suspense>;
}
