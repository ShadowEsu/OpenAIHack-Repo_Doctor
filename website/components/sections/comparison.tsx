"use client";

import { motion, useReducedMotion } from "framer-motion";

const comparisons = [
  {
    capability: "Finds issues with evidence, not just opinion",
    repoDoctor: "Yes",
    genericReviewer: "Partial",
    manualReview: "Yes",
  },
  {
    capability: "Explains confidence/severity per issue",
    repoDoctor: "Yes",
    genericReviewer: "Yes",
    manualReview: "No",
  },
  {
    capability: "Fixes issues one at a time with your approval",
    repoDoctor: "Yes",
    genericReviewer: "Partial",
    manualReview: "Yes",
  },
  {
    capability: "Runs in an isolated working copy (never touches original repo directly)",
    repoDoctor: "Yes",
    genericReviewer: "No",
    manualReview: "No",
  },
  {
    capability: "Re-verifies tests after each fix",
    repoDoctor: "Yes",
    genericReviewer: "Partial",
    manualReview: "Partial",
  },
  {
    capability: "Requires no setup beyond a repo URL",
    repoDoctor: "Yes",
    genericReviewer: "Partial",
    manualReview: "No",
  },
] as const;

function ComparisonValue({ value }: { value: "Yes" | "Partial" | "No" }) {
  const symbol = value === "Yes" ? "●" : value === "Partial" ? "◐" : "○";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm text-text-primary">
      <span aria-hidden className="text-text-muted">{symbol}</span>
      {value}
    </span>
  );
}

export function Comparison() {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: false, margin: "-50px" },
    transition: { duration: 0.65, ease: "easeOut" as const },
  };

  return (
    <section id="comparison" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <motion.div {...reveal} className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">How it compares</p>
        <h2 className="mt-4 text-4xl font-bold tracking-[-.04em] sm:text-5xl">RepoDoctor VS Everyone Else</h2>
        <p className="mt-5 text-lg leading-8 text-text-muted">A practical view of how different review approaches support diagnosis, repair, and verification.</p>
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }} className="mt-12 overflow-x-auto rounded-xl border border-accent/20 bg-background-elevated shadow-2xl shadow-black/15">
        <table className="min-w-[52rem] w-full border-collapse text-left">
          <caption className="sr-only">Comparison of Repo Doctor, a generic AI code reviewer, and manual review.</caption>
          <thead>
            <tr className="border-b border-accent/15">
              <th scope="col" className="w-[42%] px-6 py-5 font-mono text-xs uppercase tracking-[.12em] text-text-muted">Capability</th>
              <th scope="col" className="w-[19%] bg-accent/5 px-6 py-5 text-base font-semibold text-accent">Repo Doctor</th>
              <th scope="col" className="w-[19%] px-6 py-5 text-base font-semibold text-text-primary">Generic AI Code Reviewer</th>
              <th scope="col" className="w-[20%] px-6 py-5 text-base font-semibold text-text-primary">Manual Review</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row, index) => (
              <motion.tr
                key={row.capability}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                className="border-b border-accent/15 last:border-b-0"
              >
                <th scope="row" className="px-6 py-5 font-mono text-sm font-medium leading-6 text-text-primary">{row.capability}</th>
                <td className="bg-accent/5 px-6 py-5"><ComparisonValue value={row.repoDoctor} /></td>
                <td className="px-6 py-5"><ComparisonValue value={row.genericReviewer} /></td>
                <td className="px-6 py-5"><ComparisonValue value={row.manualReview} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <p className="mt-3 font-mono text-xs text-text-muted">Scroll horizontally to compare columns on smaller screens.</p>
    </section>
  );
}
