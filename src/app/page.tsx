"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, FileSearch, GitBranch, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import "./product-entry.css";

const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] as const };
  return <main id="main-content" className="app-entry min-h-screen overflow-hidden">
    <header className="app-entry-nav"><Link href="/" className="app-wordmark"><span>R</span>Repo Doctor</Link><div className="hidden items-center gap-6 text-sm text-text-muted sm:flex"><a href="#workflow">Workflow</a><a href="#assurance">Safety</a></div><Link href="/connect" className="app-nav-cta">Open workspace <ArrowRight size={15} /></Link></header>
    <section className="app-hero">
      <div className="app-orb app-orb-a" /><div className="app-orb app-orb-b" />
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: reduceMotion ? 0 : .1 } } }} className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <motion.div variants={reveal} transition={transition} className="app-kicker"><span />Evidence-first repository care</motion.div>
        <motion.h1 variants={reveal} transition={transition} className="app-title">Know what your<br /><em>codebase needs next.</em></motion.h1>
        <motion.p variants={reveal} transition={transition} className="app-subtitle">A calm workspace for inspecting repository health, understanding evidence, and reviewing the next safe repair.</motion.p>
        <motion.div variants={reveal} transition={transition} className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/connect" className="app-primary">Connect a repository <ArrowRight size={17} /></Link><Link href="/app/repos" className="app-secondary">Open sample workspace</Link></motion.div>
        <motion.div variants={reveal} transition={transition} className="app-trust"><span><Check size={14} />Read-only examination</span><span><Check size={14} />Evidence before action</span><span><Check size={14} />Human approval required</span></motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition, delay: reduceMotion ? 0 : .35 }} className="app-record mx-auto max-w-7xl">
        <div className="app-record-head"><div><p>LIVE WORKSPACE PREVIEW</p><h2>northstar-api <small>main</small></h2><span>TypeScript · 214 files · Last examined just now</span></div><div className="app-score"><span>Structural health</span><strong>72</strong><small>Needs attention</small></div></div>
        <div className="app-record-grid"><div><span>Architecture</span><b>84</b><i style={{ "--progress": "84%" } as React.CSSProperties} /></div><div><span>Reliability</span><b>61</b><i style={{ "--progress": "61%" } as React.CSSProperties} /></div><div><span>Test signals</span><b>76</b><i style={{ "--progress": "76%" } as React.CSSProperties} /></div><div><span>Dependency health</span><b>88</b><i style={{ "--progress": "88%" } as React.CSSProperties} /></div></div>
        <div className="app-record-foot"><span><b />1 finding needs review</span><span>Every conclusion is linked to repository evidence.</span><Link href="/connect">Start an examination <ArrowRight size={14} /></Link></div>
      </motion.div>
    </section>
    <section id="workflow" className="app-workflow"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><p className="app-eyebrow">A legible chain of care</p><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><h2>From repository to<br />reviewable next steps.</h2><p>Each stage stays visible, bounded, and grounded in the source tree.</p></div><div className="app-steps">{[[GitBranch,"Connect","Validate a public GitHub source before anything is read."],[FileSearch,"Examine","Map metadata, structure, languages, and project signals."],[Stethoscope,"Diagnose","Surface structural observations with clear confidence."],[ShieldCheck,"Review","Keep actions human-approved and repository-safe."]].map(([Icon,title,copy], index) => { const Glyph = Icon as typeof GitBranch; return <motion.article key={String(title)} whileHover={reduceMotion ? {} : { y: -5 }} className="app-step"><span>0{index + 1}</span><Glyph /><h3>{String(title)}</h3><p>{String(copy)}</p></motion.article>; })}</div></div></section>
    <section id="assurance" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="app-assurance"><Sparkles /><div><p className="app-eyebrow">Built for steady engineering teams</p><h2>Clear signal. No invisible changes.</h2><p>Repo Doctor only validates and examines until you explicitly choose a reviewed treatment.</p></div><Link href="/connect" className="app-secondary">Begin safely <ArrowRight size={16} /></Link></div></section>
  </main>;
}
