"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  ["01", "Intake", "Provide a GitHub URL or ZIP upload. We map the repo structure, detect languages and frameworks."],
  ["02", "Examination", "Deterministic scanners check imports, secrets, tests, and structure first — before any AI runs."],
  ["03", "Diagnosis", "AI explains findings, estimates confidence and risk, and prioritizes what matters most."],
  ["04", "Treatment", "You review the proposed fix and diff, approve it, and Repo Doctor verifies tests still pass."],
] as const;

export function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinnedDesktop, setIsPinnedDesktop] = useState(false);
  const shouldPolish = isPinnedDesktop && !reduceMotion;

  useLayoutEffect(() => {
    if (reduceMotion || !sectionRef.current || !trackRef.current) return;

    const context = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          setIsPinnedDesktop(true);
          const track = trackRef.current!;

          const tween = gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${track.scrollWidth - window.innerWidth}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                progress.set(self.progress);
                const nextActiveIndex = Math.min(
                  steps.length - 1,
                  Math.round(self.progress * (steps.length - 1)),
                );
                setActiveIndex((current) =>
                  current === nextActiveIndex ? current : nextActiveIndex,
                );
              },
            },
          });

          return () => {
            tween.kill();
            progress.set(0);
            setActiveIndex(0);
            setIsPinnedDesktop(false);
          };
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, [progress, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="how-scroll-section relative overflow-hidden py-24"
    >
      <div
        ref={trackRef}
        className="relative z-10 how-scroll-track mx-auto flex max-w-7xl flex-col gap-8 px-5 lg:w-max lg:max-w-none lg:flex-row lg:gap-6 lg:px-0"
      >
        {steps.map(([number, title, copy], index) => {
          const isActive = !shouldPolish || activeIndex === index;
          const contentOffset =
            index > activeIndex ? 18 : index < activeIndex ? -12 : 0;

          return (
            <motion.article
              key={number}
              className="how-step-panel rounded-lg border border-accent/15 bg-background-elevated p-8 lg:w-[72vw] lg:max-w-4xl"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: "easeOut" }}
            >
              <motion.div
                animate={{ opacity: isActive ? 1 : 0.6 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.span
                  className="font-mono text-xl text-accent"
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    opacity: isActive ? 1 : 0.78,
                    color: isActive ? "#EAFBF8" : "#1AC0AD",
                    fontWeight: isActive ? 700 : 400,
                  }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "inline-block", transformOrigin: "left center" }}
                >
                  {number}
                </motion.span>

                <motion.div
                  animate={{
                    x: shouldPolish ? contentOffset : 0,
                    opacity: isActive ? 1 : 0.84,
                  }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="mt-8 text-3xl font-bold">{title}</h3>
                  <p className="mt-4 max-w-xl text-lg leading-8 text-text-muted">
                    {copy}
                  </p>
                </motion.div>
              </motion.div>
            </motion.article>
          );
        })}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 bottom-6 z-20 hidden lg:block lg:inset-x-8"
      >
        <div className="h-px overflow-hidden bg-accent/20">
          <motion.div
            className="h-full origin-left bg-accent"
            style={{ scaleX: progress }}
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {steps.map(([number], index) => (
            <span
              key={number}
              className={`h-1 rounded-full transition-colors duration-200 ${
                activeIndex >= index ? "bg-accent" : "bg-accent/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
