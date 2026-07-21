"use client";

import { HealthRecordMockup } from "@/components/HealthRecordMockup";
import { interactionClasses } from "@/lib/interaction-classes";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const tags = ["Diagnosis", "Evidence", "Confidence", "Safe Repair", "Verification"];

export function Hero() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://repo-doctor-two.vercel.app";
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [canParallax, setCanParallax] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 80, damping: 20, mass: 0.45 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 80, damping: 20, mass: 0.45 });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -9]);
  const gridX = useTransform(smoothMouseX, (value) => value * 7);
  const gridY = useTransform(smoothMouseY, (value) => value * 5);
  const linesX = useTransform(smoothMouseX, (value) => value * -11);
  const linesY = useTransform(smoothMouseY, (value) => value * -8);
  const nodesX = useTransform(smoothMouseX, (value) => value * 16);
  const nodesY = useTransform(smoothMouseY, (value) => value * 12);
  const marksX = useTransform(smoothMouseX, (value) => value * -9);
  const marksY = useTransform(smoothMouseY, (value) => value * 7);
  const edgeX = useTransform(smoothMouseX, (value) => value * 2);
  const edgeY = useTransform(smoothMouseY, (value) => value * 8);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanParallax(!reduceMotion && media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [reduceMotion]);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!canParallax || !sectionRef.current) return;
    const bounds = sectionRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - bounds.left - bounds.width / 2) / bounds.width);
    mouseY.set((event.clientY - bounds.top - bounds.height / 2) / bounds.height);
  };

  const resetParallax = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.65, ease: "easeOut" as const },
  };

  return (
    <section
      ref={sectionRef}
      id="overview"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
      className="relative overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="hero-blob hero-blob-one" />
        <div className="hero-blob hero-blob-two" />
        <motion.div style={{ x: gridX, y: gridY }} className="hero-parallax-grid" />
        <motion.div style={{ x: linesX, y: linesY }} className="hero-parallax-lines" />
        <motion.div style={{ x: nodesX, y: nodesY }} className="hero-parallax-nodes">
          <span /><span /><span /><span /><span /><span /><i /><i /><i /><i /><i />
        </motion.div>
        <motion.div style={{ x: marksX, y: marksY }} className="hero-parallax-marks">
          <span /><span /><span />
        </motion.div>
        <motion.div style={{ x: edgeX, y: edgeY }} className="hero-parallax-edge" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
      <motion.div className="min-w-0" {...reveal}>
        <div className="mb-7 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-accent/15 bg-background-elevated px-3 py-1 font-mono text-xs text-accent">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="max-w-3xl text-5xl font-bold leading-[.96] tracking-[-.055em] sm:text-6xl lg:text-7xl">
          Your codebase has symptoms. <span className="text-accent">Repo Doctor finds the cause.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-text-muted">
          Repo Doctor examines messy repositories, explains what is wrong, and safely repairs maintainability issues one treatment at a time.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href={appUrl} className={`${interactionClasses.primaryButton} cta-primary rounded-md bg-accent px-5 py-3 text-center font-semibold text-background hover:bg-accent-secondary hover:text-text-primary`}>
            Launch Repo Doctor
          </a>
          <a href="#health-report" className={`${interactionClasses.secondaryButton} rounded-md border border-accent/30 px-5 py-3 text-center font-semibold hover:border-accent hover:text-accent`}>
            View Sample Health Record
          </a>
        </div>
      </motion.div>

      <motion.div className="min-w-0" {...reveal} transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }} style={reduceMotion ? undefined : { y: dashboardY }}>
        <HealthRecordMockup />
      </motion.div>
      </div>
    </section>
  );
}
