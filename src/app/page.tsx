"use client";

import { motion } from "framer-motion";
import { Activity, Search, AlertTriangle, Wrench, Shield, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Search,
    title: "Examination",
    description: "Comprehensive analysis of your codebase structure, dependencies, and patterns. We map every file and trace every import.",
  },
  {
    icon: AlertTriangle,
    title: "Diagnosis",
    description: "Evidence-based findings with severity ratings, affected files, and confidence scores. No guesswork, only facts.",
  },
  {
    icon: Wrench,
    title: "Treatment",
    description: "Safe, reversible repairs with verification steps. Your repository stays untouched until you approve each change.",
  },
];

const trustSignals = [
  { icon: Shield, text: "Your repository remains unchanged" },
  { icon: CheckCircle2, text: "Evidence-based findings" },
  { icon: RotateCcw, text: "Safe, reversible repairs" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-3xl space-y-8"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full bg-accent-light px-4 py-2 text-sm font-medium text-accent"
          >
            <Activity className="h-4 w-4" />
            <span>AI-Powered Repository Health</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl font-bold tracking-tight text-text-primary sm:text-6xl"
          >
            Repo Doctor
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-text-secondary"
          >
            An AI health clinic for messy codebases
          </motion.p>

          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-base leading-relaxed text-text-muted"
          >
            We examine your repository, diagnose issues with evidence, and provide
            safe treatments that improve code quality without breaking anything.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/connect"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white",
                "transition-colors hover:bg-accent-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              )}
            >
              Connect Repository
            </Link>
            <Link
              href="/sample"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-6 py-3 text-base font-medium text-text-primary",
                "transition-colors hover:bg-surface-elevated",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              )}
            >
              View Sample Report
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-12 md:grid-cols-3"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-elevated">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12"
          >
            {trustSignals.map((signal) => (
              <div
                key={signal.text}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <signal.icon className="h-4 w-4 text-accent" />
                <span>{signal.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-xs text-text-muted">
          <p>Repo Doctor — AI Health Clinic for Codebases</p>
        </div>
      </footer>
    </div>
  );
}
