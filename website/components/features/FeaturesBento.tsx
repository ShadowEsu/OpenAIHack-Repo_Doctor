"use client";

import { DiagnosisReportCard } from "@/components/DiagnosisReportCard";
import { interactionClasses } from "@/lib/interaction-classes";
import { motion, useReducedMotion } from "framer-motion";

const scannerChecks = ["Broken imports", "Dead files", "Hardcoded secrets", "Weak test coverage"];
const repairSteps = ["Isolated working copy", "Readable diff", "Explicit approval", "Full test re-run"];

export function FeaturesBento() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: false, margin: "-50px" },
    transition: { duration: 0.65, delay, ease: "easeOut" as const },
  });

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <motion.div {...reveal()} className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Feature record</p>
        <h1 className="mt-4 text-5xl font-bold tracking-[-.05em] sm:text-6xl">A safer path from symptom to repair.</h1>
        <p className="mt-6 text-lg leading-8 text-text-muted">Repo Doctor keeps diagnosis, explanation, repair, and verification in one deliberate workflow.</p>
      </motion.div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(15rem,auto)]">
        <motion.article {...reveal(0.04)} className={`${interactionClasses.hoverCard} order-1 rounded-xl border border-accent/20 bg-background-elevated p-7 shadow-2xl shadow-black/15 md:col-span-2 lg:col-span-7 lg:row-span-2 lg:p-9`}>
          <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">01 / Diagnose</p>
          <h2 className="mt-6 max-w-xl text-4xl font-bold tracking-[-.04em]">Ground every finding in real analysis.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-text-muted">Deterministic scanners inspect the repository before any AI runs, so the initial record comes from observable code structure rather than opinion alone.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {scannerChecks.map((check) => <div key={check} className="rounded-lg border border-accent/15 bg-background px-4 py-3 font-mono text-sm text-text-primary"><span className="mr-2 text-accent">↗</span>{check}</div>)}
          </div>
        </motion.article>

        <motion.article {...reveal(0.1)} className={`${interactionClasses.hoverCard} order-2 rounded-xl border border-accent/20 bg-background-elevated p-7 shadow-2xl shadow-black/15 lg:col-span-5 lg:p-8`}>
          <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">03 / Repair</p>
          <h2 className="mt-5 text-3xl font-bold tracking-[-.04em]">Treat one issue safely.</h2>
          <p className="mt-4 leading-7 text-text-muted">Each proposed treatment is isolated, reviewable, and gated by your approval before it can touch a repository.</p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {repairSteps.map((step) => <li key={step} className="border-t border-accent/15 pt-3 font-mono text-sm"><span className="mr-2 text-accent">↗</span>{step}</li>)}
          </ul>
        </motion.article>

        <motion.article {...reveal(0.16)} className={`${interactionClasses.hoverCard} order-3 rounded-xl border border-accent/20 bg-background-elevated p-7 shadow-2xl shadow-black/15 lg:col-span-5 lg:p-8`}>
          <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">02 / Explain</p>
          <h2 className="mt-5 text-3xl font-bold tracking-[-.04em]">Make the risk legible.</h2>
          <p className="mt-4 leading-7 text-text-muted">Each diagnosis pairs severity, confidence, affected files, and a plain-language root cause.</p>
          <DiagnosisReportCard className="mt-7 p-5 sm:p-6" diagnosisId="RD-027" title="Broken import in billing/summary.ts" severity="Warning" confidence="Medium confidence" affectedFiles={["billing/summary.ts :8", "billing/index.ts :3"]} evidence="A local module path no longer resolves from the billing summary entry point." whyItMatters="The screen can fail at runtime until the import path is corrected." />
        </motion.article>

        <motion.article {...reveal(0.22)} className={`${interactionClasses.hoverCard} order-4 rounded-xl border border-accent/20 bg-background-elevated p-7 shadow-2xl shadow-black/15 md:col-span-2 lg:col-span-7 lg:p-9`}>
          <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">04 / Verify</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-[-.04em]">Confirm the repair changed the record.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-text-muted">Before-and-after health scores make the result visible. Tests are re-run after every treatment, and no change is applied without approval.</p>
            </div>
            <div className="flex gap-5 font-mono">
              <div><p className="text-xs text-text-muted">BEFORE</p><p className="mt-1 text-5xl font-bold text-status-warning">58</p></div>
              <div className="border-l border-accent/20 pl-5"><p className="text-xs text-text-muted">AFTER</p><p className="mt-1 text-5xl font-bold text-status-success">82</p></div>
            </div>
          </div>
        </motion.article>

        {/* X-ray slider goes here — Phase 7.7 */}
        <motion.div {...reveal(0.28)} aria-label="Reserved space for the X-ray slider" className="order-5 min-h-48 rounded-xl border border-dashed border-accent/25 bg-background/50 lg:col-span-5" />
      </div>
    </section>
  );
}
