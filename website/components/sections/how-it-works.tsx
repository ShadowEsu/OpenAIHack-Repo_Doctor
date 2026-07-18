"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const steps = [["01", "Intake", "Provide a GitHub URL or ZIP upload. We map the repo structure, detect languages and frameworks."], ["02", "Examination", "Deterministic scanners check imports, secrets, tests, and structure first — before any AI runs."], ["03", "Diagnosis", "AI explains findings, estimates confidence and risk, and prioritizes what matters most."], ["04", "Treatment", "You review the proposed fix and diff, approve it, and Repo Doctor verifies tests still pass."]] as const;

export function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduceMotion || !sectionRef.current || !trackRef.current) return;
    const context = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          const track = trackRef.current!;
          return gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth), ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top top", end: () => `+=${track.scrollWidth - window.innerWidth}`, pin: true, scrub: .8, invalidateOnRefresh: true } });
        },
      });
    }, sectionRef);
    return () => context.revert();
  }, [reduceMotion]);
  return <section ref={sectionRef} id="how-it-works" className="how-scroll-section overflow-hidden py-24"><div ref={trackRef} className="how-scroll-track mx-auto flex max-w-7xl flex-col gap-8 px-5 lg:w-max lg:max-w-none lg:flex-row lg:gap-6 lg:px-0">{steps.map(([number, title, copy], index) => <motion.article key={number} className="how-step-panel rounded-lg border border-accent/15 bg-background-elevated p-8 lg:w-[72vw] lg:max-w-4xl" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .65, delay: index * .08, ease: "easeOut" }}><span className="font-mono text-xl text-accent">{number}</span><h3 className="mt-8 text-3xl font-bold">{title}</h3><p className="mt-4 max-w-xl text-lg leading-8 text-text-muted">{copy}</p></motion.article>)}</div></section>;
}
