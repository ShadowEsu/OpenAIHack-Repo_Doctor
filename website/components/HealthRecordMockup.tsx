"use client";

import { motion, useReducedMotion } from "framer-motion";
import { interactionClasses } from "@/lib/interaction-classes";
import { useEffect, useRef, useState } from "react";

const diagnoses = [
  { severity: "critical", title: "Hardcoded API key in config.js", confidence: "High confidence" },
  { severity: "warning", title: "17 imports resolve to missing files", confidence: "High confidence" },
  { severity: "warning", title: "Test coverage dropped in auth flow", confidence: "Medium confidence" },
] as const;

const severityStyles = {
  critical: { dot: "bg-status-critical", edge: "hover:border-l-status-critical", glow: "group-hover:shadow-[0_0_10px_rgba(255,92,92,.8)]" },
  warning: { dot: "bg-status-warning", edge: "hover:border-l-status-warning", glow: "group-hover:shadow-[0_0_10px_rgba(255,176,32,.8)]" },
} as const;

export function HealthRecordMockup() {
  const reduceMotion = useReducedMotion();
  const [processing, setProcessing] = useState(false);
  const [score, setScore] = useState(0);
  const [hasExamined, setHasExamined] = useState(false);
  const [gaugeReady, setGaugeReady] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const reexamine = () => {
    if (processing) return;
    setProcessing(true); setGaugeReady(false); setScore(0);
    timers.current = [
      window.setTimeout(() => setScore(24), 320),
      window.setTimeout(() => setScore(58), 760),
      window.setTimeout(() => { setScore(76); setGaugeReady(true); }, 1200),
      window.setTimeout(() => { setHasExamined(true); setProcessing(false); }, 1800),
    ];
  };
  return <div className="relative mx-auto w-full max-w-xl lg:rotate-[2deg]"><div className="absolute -inset-4 -z-10 rounded-[2rem] bg-accent/10 blur-3xl transition-opacity duration-500 hover:opacity-150" /><section className="health-record-card relative overflow-hidden rounded-xl border border-accent/35 bg-background-elevated p-4 shadow-2xl shadow-black/50 sm:p-6"><div aria-hidden className="health-record-sweep" /><header className="relative flex items-center justify-between gap-3 border-b border-accent/15 pb-4"><div className="min-w-0"><p className="font-mono text-xs uppercase tracking-[.16em] text-text-muted">Health record</p><div className="mt-1 flex items-center gap-2"><h2 className="truncate font-mono text-base font-semibold text-text-primary">example-app</h2><span className="rounded border border-accent/20 px-2 py-0.5 font-mono text-xs text-text-muted">main</span></div></div><div className="flex items-center gap-2"><span aria-label="Live analysis preview" className="health-live-dot h-2.5 w-2.5 rounded-full bg-status-success" /><button type="button" disabled={processing} onClick={reexamine} className={`${interactionClasses.primaryButton} health-examine-cta shrink-0 rounded bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-background disabled:cursor-wait disabled:opacity-70`}>{processing ? <span className="flex items-center gap-1.5"><span className="health-spinner h-3 w-3 rounded-full border border-accent border-t-transparent" />Re-examining</span> : <span className="flex items-center gap-1.5"><span className="health-examine-icon">↻</span>{hasExamined ? "Re-examine" : "Run examination"}</span>}</button></div></header><div className="relative grid gap-5 border-b border-accent/15 py-5 sm:grid-cols-[auto_1fr] sm:items-center"><div className="flex items-end gap-2"><span className="font-mono text-7xl font-bold leading-none tracking-[-.1em] text-accent">{score}</span><span className="mb-1 font-mono text-sm text-text-muted">/100</span></div><div><div className="flex justify-between font-mono text-xs uppercase tracking-[.12em] text-text-muted"><span>Health Score</span><span className="text-accent">{hasExamined ? "Improving" : "Awaiting scan"}</span></div><div className={`health-gauge-shell mt-2 h-2.5 overflow-hidden rounded-full bg-background ${hasExamined ? "" : "health-gauge-awaiting"}`}><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: gaugeReady ? 1 : 0 }} transition={{ duration: processing ? .35 : .8, ease: "easeOut" }} className="health-gauge h-full w-[76%] origin-left rounded-full bg-accent shadow-[0_0_16px_rgba(26,192,173,.75)]" /></div><p className="mt-2 font-mono text-xs text-text-muted">{hasExamined ? "Last examined moments ago" : "Run an examination to populate this record"}</p></div></div><div className="relative grid grid-cols-3 gap-2 border-b border-accent/15 py-4">{[["1", "Critical", "status-critical"], ["4", "Warnings", "status-warning"], ["3", "Safe Treatments", "status-success"]].map(([value, label, tone], index) => <motion.div key={label} animate={processing && !reduceMotion ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: .35, delay: index * .12 }} className={`rounded border border-${tone}/25 bg-${tone}/10 p-3`}><p className={`font-mono text-xl font-bold text-${tone}`}>{value}</p><p className={`font-mono text-xs leading-3 text-${tone}`}>{label}</p></motion.div>)}</div><div className="relative pt-4"><div className="mb-2 flex justify-between font-mono text-xs uppercase tracking-[.14em] text-text-muted"><span>Active diagnoses</span><span>{hasExamined ? "8 findings" : "Awaiting scan"}</span></div><div className="divide-y divide-accent/10">{diagnoses.map((diagnosis, index) => { const style = severityStyles[diagnosis.severity]; return <motion.div key={diagnosis.title} initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} transition={{ duration: .4, delay: index * .08 }} className={`group ${interactionClasses.hoverRow} flex cursor-default items-center gap-3 border-l-2 border-l-transparent py-3.5 pl-2 transition duration-200 hover:bg-accent/5 ${style.edge}`}><span className={`h-2.5 w-2.5 shrink-0 rounded-full transition-shadow ${style.dot} ${style.glow}`} /><p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{diagnosis.title}</p><span className="shrink-0 font-mono text-xs text-text-muted">{diagnosis.confidence}</span></motion.div>; })}</div></div></section></div>;
}
