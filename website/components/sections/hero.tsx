"use client";

import { HealthRecordMockup } from "@/components/HealthRecordMockup";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const tags = ["Diagnosis", "Evidence", "Confidence", "Safe Repair", "Verification"];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -9]);
  const reveal = { initial: reduceMotion ? false : { opacity: 0, y: 24 }, whileInView: reduceMotion ? {} : { opacity: 1, y: 0 }, viewport: { once: true, amount: .2 }, transition: { duration: .65, ease: "easeOut" as const } };
  return <section ref={sectionRef} id="overview" className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8"><div aria-hidden className="hero-blob hero-blob-one" /><div aria-hidden className="hero-blob hero-blob-two" /><motion.div className="relative z-10" {...reveal}><div className="mb-7 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-accent/15 bg-background-elevated px-3 py-1 font-mono text-xs text-accent">{tag}</span>)}</div><h1 className="max-w-3xl text-5xl font-bold leading-[.96] tracking-[-.055em] sm:text-6xl lg:text-7xl">Your codebase has symptoms. <span className="text-accent">Repo Doctor finds the cause.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-text-muted">Repo Doctor examines messy repositories, explains what is wrong, and safely repairs maintainability issues one treatment at a time.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#health-report" className="cta-primary rounded-md bg-accent px-5 py-3 text-center font-semibold text-background hover:bg-accent-secondary hover:text-text-primary">Examine a Repository</a><a href="#diagnoses" className="rounded-md border border-accent/30 px-5 py-3 text-center font-semibold hover:border-accent hover:text-accent">View Sample Health Record</a></div></motion.div><motion.div className="relative z-10" {...reveal} transition={{ duration: .65, delay: .12, ease: "easeOut" }} style={reduceMotion ? undefined : { y: dashboardY }}><HealthRecordMockup /></motion.div></section>;
}
