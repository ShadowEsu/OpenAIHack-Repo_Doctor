"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  Search,
  AlertTriangle,
  Wrench,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GitBranch,
  FileCode,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Search,
    title: "Examination",
    description:
      "Comprehensive analysis of your codebase structure, dependencies, and patterns. We map every file and trace every import.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: AlertTriangle,
    title: "Diagnosis",
    description:
      "Evidence-based findings with severity ratings, affected files, and confidence scores. No guesswork, only facts.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Wrench,
    title: "Treatment",
    description:
      "Safe, reversible repairs with verification steps. Your repository stays untouched until you approve each change.",
    gradient: "from-violet-500 to-purple-500",
  },
];

const stats = [
  { value: "100%", label: "Safe repairs" },
  { value: "0", label: "Data stored" },
  { value: "6", label: "Health dimensions" },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient glow that follows mouse */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--accent-glow), transparent 40%)`,
        }}
      />

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center"
      >
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-light px-4 py-2 text-sm font-medium text-accent"
        >
          <Sparkles className="h-4 w-4" />
          AI-Powered Repository Health
        </motion.div>

        {/* Main heading with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="gradient-text">Repo Doctor</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 max-w-2xl text-xl text-text-secondary sm:text-2xl"
        >
          An AI health clinic for messy codebases
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-text-muted"
        >
          We examine your repository, diagnose issues with evidence, and provide
          safe treatments that improve code quality without breaking anything.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/connect"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Connect Repository</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-hover opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <Link
            href="/sample"
            className="group inline-flex items-center gap-2 rounded-xl border border-strong bg-surface px-8 py-4 text-base font-semibold text-text-primary transition-all duration-300 hover:bg-surface-elevated hover:shadow-md"
          >
            View Sample Report
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex items-center gap-8 sm:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-text-primary sm:text-3xl">
                {stat.value}
              </div>
              <div className="text-xs text-text-muted sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 border-t border-border bg-surface/50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-text-secondary">
              Three stages from chaos to clarity. Every step is transparent,
              evidence-based, and reversible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-all duration-500 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div
                    className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 border-t border-border px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {[
              {
                icon: Shield,
                title: "Your code stays safe",
                description: "No changes are made without your explicit approval. All treatments are reversible.",
              },
              {
                icon: CheckCircle2,
                title: "Evidence-based",
                description: "Every finding includes file references, code snippets, and confidence scores.",
              },
              {
                icon: Zap,
                title: "Verified repairs",
                description: "Every treatment runs through linting, type checking, tests, and build verification.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-xs text-text-secondary">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 border-t border-border px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Ready to examine your codebase?
            </h2>
            <p className="mb-8 text-lg text-text-secondary">
              Connect your repository and get a complete health report in minutes.
            </p>
            <Link
              href="/connect"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-xs text-text-muted">
          <p>Repo Doctor — AI Health Clinic for Codebases</p>
        </div>
      </footer>
    </div>
  );
}
