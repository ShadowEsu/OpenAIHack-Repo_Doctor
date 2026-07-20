"use client";

import { DiagnosisReportCard } from "@/components/DiagnosisReportCard";
import { XraySlider } from "@/components/XraySlider";
import { interactionClasses } from "@/lib/interaction-classes";
import { motion, useReducedMotion } from "framer-motion";

const scannerChecks = ["Broken imports", "Dead files", "Hardcoded secrets", "Weak test coverage"];
const repairSteps = ["Isolated working copy", "Readable diff", "Explicit approval", "Full test re-run"];

function StepNumber({ number }: { number: string }) {
  return (
    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center bg-background lg:h-20">
      <span className="font-mono text-4xl tracking-[-.08em] text-accent sm:text-5xl">{number}</span>
    </div>
  );
}

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

      <div className="relative mt-16 space-y-16 sm:space-y-20 lg:space-y-28">
        <div aria-hidden="true" className="absolute bottom-16 left-7 top-8 w-px bg-gradient-to-b from-transparent via-accent/45 to-transparent" />

        <motion.section {...reveal(0.04)} className="feature-step relative grid gap-7 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
          <StepNumber number="01" />
          <div className="feature-copy order-3 lg:col-start-2 lg:row-start-1 lg:self-center">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Diagnose</p>
            <h2 className="mt-5 text-4xl font-bold tracking-[-.04em] sm:text-5xl">Ground every finding in real analysis.</h2>
            <p className="mt-5 max-w-xl leading-8 text-text-muted">Deterministic scanners inspect the repository before any AI runs, so the initial record comes from observable code structure rather than opinion alone.</p>
          </div>
          <article className={`feature-visual ${interactionClasses.hoverCard} order-2 rounded-xl border border-accent/20 bg-background-elevated p-6 shadow-2xl shadow-black/15 sm:p-8 lg:col-start-3 lg:row-start-1`}>
            <p className="font-mono text-xs text-text-muted">DETERMINISTIC CHECKS</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {scannerChecks.map((check) => (
                <div key={check} className="rounded-lg border border-accent/15 bg-background px-4 py-3 font-mono text-sm text-text-primary">
                  <span className="mr-2 text-accent">↗</span>{check}
                </div>
              ))}
            </div>
          </article>
        </motion.section>

        <motion.section {...reveal(0.08)} className="feature-step relative grid gap-7 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
          <StepNumber number="02" />
          <div className="feature-copy order-3 lg:col-start-3 lg:row-start-1 lg:self-center">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Explain</p>
            <h2 className="mt-5 text-4xl font-bold tracking-[-.04em] sm:text-5xl">Make the risk legible.</h2>
            <p className="mt-5 max-w-xl leading-8 text-text-muted">Each diagnosis pairs severity, confidence, affected files, and a plain-language root cause.</p>
          </div>
          <div className="feature-visual order-2 lg:col-start-2 lg:row-start-1">
            <DiagnosisReportCard
              className={interactionClasses.hoverCard}
              diagnosisId="RD-027"
              title="Broken import in billing/summary.ts"
              severity="Warning"
              confidence="Medium confidence"
              affectedFiles={["billing/summary.ts :8", "billing/index.ts :3"]}
              evidence="A local module path no longer resolves from the billing summary entry point."
              whyItMatters="The screen can fail at runtime until the import path is corrected."
            />
          </div>
        </motion.section>

        <motion.section {...reveal(0.12)} className="feature-step relative grid gap-7 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
          <StepNumber number="03" />
          <div className="feature-copy order-3 lg:col-start-2 lg:row-start-1 lg:self-center">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Repair</p>
            <h2 className="mt-5 text-4xl font-bold tracking-[-.04em] sm:text-5xl">Treat one issue safely.</h2>
            <p className="mt-5 max-w-xl leading-8 text-text-muted">Each proposed treatment is isolated, reviewable, and gated by your approval before it can touch a repository.</p>
          </div>
          <div className="feature-visual order-2 space-y-4 lg:col-start-3 lg:row-start-1">
            <article className={`${interactionClasses.hoverCard} rounded-xl border border-accent/20 bg-background-elevated p-6 shadow-2xl shadow-black/15 sm:p-8`}>
              <p className="font-mono text-xs text-text-muted">TREATMENT PROTOCOL</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {repairSteps.map((step) => (
                  <li key={step} className="border-t border-accent/15 pt-3 font-mono text-sm"><span className="mr-2 text-accent">↗</span>{step}</li>
                ))}
              </ul>
            </article>
            <XraySlider />
          </div>
        </motion.section>

        <motion.section {...reveal(0.16)} className="feature-step relative grid gap-7 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
          <StepNumber number="04" />
          <div className="feature-copy order-3 lg:col-start-3 lg:row-start-1 lg:self-center">
            <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Verify</p>
            <h2 className="mt-5 text-4xl font-bold tracking-[-.04em] sm:text-5xl">Confirm the repair changed the record.</h2>
            <p className="mt-5 max-w-xl leading-8 text-text-muted">Before-and-after health scores make the result visible. Tests are re-run after every treatment, and no change is applied without approval.</p>
          </div>
          <article className={`feature-visual ${interactionClasses.hoverCard} order-2 rounded-xl border border-accent/20 bg-background-elevated p-6 shadow-2xl shadow-black/15 sm:p-8 lg:col-start-2 lg:row-start-1`}>
            <p className="font-mono text-xs text-text-muted">VERIFICATION RECORD</p>
            <div className="mt-7 grid grid-cols-2 gap-5 font-mono">
              <div>
                <p className="text-xs text-text-muted">BEFORE</p>
                <p className="mt-2 text-6xl font-bold tracking-[-.08em] text-status-warning">58</p>
                <p className="mt-2 text-sm text-text-muted">Health Score</p>
              </div>
              <div className="border-l border-accent/20 pl-5">
                <p className="text-xs text-text-muted">AFTER</p>
                <p className="mt-2 text-6xl font-bold tracking-[-.08em] text-status-success">82</p>
                <p className="mt-2 text-sm text-text-muted">Health Score</p>
              </div>
            </div>
          </article>
        </motion.section>
      </div>
    </section>
  );
}
