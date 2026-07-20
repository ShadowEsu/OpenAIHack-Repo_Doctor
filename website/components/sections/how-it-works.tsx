"use client";

import { interactionClasses } from "@/lib/interaction-classes";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const steps = [
  ["01", "Intake", "Provide a GitHub URL or ZIP upload. We map the repo structure, detect languages and frameworks."],
  ["02", "Examination", "Deterministic scanners check imports, secrets, tests, and structure first — before any AI runs."],
  ["03", "Diagnosis", "AI explains findings, estimates confidence and risk, and prioritizes what matters most."],
  ["04", "Treatment", "You review the proposed fix and diff, approve it, and Repo Doctor verifies tests still pass."],
] as const;

function StepIcon({ step }: { step: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.6 };

  if (step === 0) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6"><path {...common} d="M4 6.5h16v11H4zM8 4v5M16 4v5M8 15h3" /></svg>;
  }
  if (step === 1) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6"><circle {...common} cx="10.5" cy="10.5" r="5.5" /><path {...common} d="m15 15 4.5 4.5M8 10.5h5M10.5 8v5" /></svg>;
  }
  if (step === 2) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6"><path {...common} d="M5 5h14v14H5zM8.5 9h7M8.5 12h5M8.5 15h3" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6"><path {...common} d="m5 12 4 4L19 6M5 6h5M14 18h5" /></svg>;
}

function Connector({ active, showParticle }: { active: boolean; showParticle: boolean }) {
  return (
    <div aria-hidden="true" className="relative flex h-10 shrink-0 items-center justify-center lg:h-auto lg:w-14">
      <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 lg:left-0 lg:top-1/2 lg:h-px lg:w-full lg:-translate-y-1/2 lg:translate-x-0 ${active ? "bg-accent/60" : "bg-accent/20"}`} />
      {showParticle && (
        <motion.span
          className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(26,192,173,.9)]"
          initial={{ x: "0%", opacity: 0 }}
          animate={{ x: "calc(100% + 3rem)", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.95, ease: "linear" }}
        />
      )}
    </div>
  );
}

export function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeStep, setActiveStep] = useState(3);
  const [travelingConnector, setTravelingConnector] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasRun = useRef(false);
  const isInView = useInView(sectionRef, { amount: 0.2, once: true });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsDesktop(mediaQuery.matches);
      if (!mediaQuery.matches) hasRun.current = false;
    };
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop || reduceMotion) {
      setActiveStep(3);
      setTravelingConnector(null);
      return;
    }

    if (!isInView || hasRun.current) return;
    hasRun.current = true;
    setActiveStep(0);
    setTravelingConnector(0);

    let loopTimer: number | undefined;
    let connectorIndex = 0;
    const continueLoop = () => {
      setTravelingConnector(connectorIndex);
      connectorIndex = (connectorIndex + 1) % (steps.length - 1);
      loopTimer = window.setTimeout(continueLoop, 1050);
    };

    const timers = [
      window.setTimeout(() => {
        setActiveStep(1);
        setTravelingConnector(1);
      }, 1050),
      window.setTimeout(() => {
        setActiveStep(2);
        setTravelingConnector(2);
      }, 2100),
      window.setTimeout(() => {
        setActiveStep(3);
        continueLoop();
      }, 3150),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      if (loopTimer) window.clearTimeout(loopTimer);
    };
  }, [isDesktop, isInView, reduceMotion]);

  const useStaticFallback = !isDesktop || reduceMotion;

  return (
    <section ref={sectionRef} id="how-it-works" className="relative overflow-hidden py-24">
      <motion.div
        className="mx-auto max-w-7xl px-5 lg:px-8"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {steps.map(([number, title, copy], index) => {
            const isLit = useStaticFallback || index <= activeStep;

            return (
              <div key={number} className="flex flex-1 flex-col lg:flex-row lg:items-stretch">
                <motion.article
                  className={`${interactionClasses.hoverCard} relative min-h-56 flex-1 rounded-xl border bg-background-elevated p-6 sm:p-7`}
                  animate={{
                    borderColor: isLit ? "rgba(26, 192, 173, .75)" : "rgba(26, 192, 173, .15)",
                    boxShadow: isLit ? "0 0 28px rgba(26, 192, 173, .14)" : "0 0 0 rgba(26, 192, 173, 0)",
                  }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/25 text-accent"
                    animate={{ backgroundColor: isLit ? "rgba(26, 192, 173, .14)" : "rgba(3, 22, 20, .3)", color: isLit ? "#1AC0AD" : "#7FA39D" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StepIcon step={index} />
                  </motion.div>
                  <p className="mt-7 font-mono text-xl text-accent">{number}</p>
                  <h3 className="mt-3 text-3xl font-bold tracking-[-.04em]">{title}</h3>
                  <p className="mt-4 text-lg leading-8 text-text-muted">{copy}</p>
                </motion.article>
                {index < steps.length - 1 && (
                  <Connector active={useStaticFallback || index < activeStep} showParticle={isDesktop && !reduceMotion && travelingConnector === index} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
