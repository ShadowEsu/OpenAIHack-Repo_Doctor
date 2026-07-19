"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";

const faqs = [
  {
    question: "Does Repo Doctor modify my repository?",
    answer: "Repo Doctor does not modify a repository unless you own it. Every treatment runs in an isolated working copy, and nothing is applied without your explicit approval.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "Repo Doctor currently supports JavaScript, TypeScript, Python, React, and Next.js.",
  },
  {
    question: "Is my code sent anywhere?",
    answer: "Scanning happens locally and deterministically before any AI call is made.",
  },
  {
    question: "What happens if a fix is wrong?",
    answer: "Every proposed change is shown as a diff before anything is applied, and tests are re-run after each treatment to verify nothing broke; you can reject any proposed fix.",
  },
  {
    question: "How is this different from a linter or generic AI code reviewer?",
    answer: "Repo Doctor follows a three-step process: deterministic scanning first, then evidence and a confidence score for each finding. A single isolated fix is proposed only after your approval.",
  },
] as const;

export function Faq() {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionId = useId();
  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? {} : { opacity: 1, y: 0 },
    viewport: { once: false, margin: "-50px" },
    transition: { duration: 0.65, ease: "easeOut" as const },
  };
  const toggleTransition = { duration: reduceMotion ? 0 : 0.18, ease: "easeOut" as const };

  return (
    <section id="faq" className="border-y border-accent/15 bg-background-elevated">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <motion.div {...reveal} className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">FAQ</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-.04em] sm:text-5xl">Answers before you examine.</h2>
        </motion.div>

        <motion.div {...reveal} transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }} className="faq-accordion mt-12 divide-y divide-accent/15 rounded-xl border border-accent/35 bg-background shadow-2xl shadow-black/15">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `${sectionId}-answer-${index}`;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="faq-accordion-button flex w-full items-center justify-between gap-5 px-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-7 sm:py-6"
                >
                  <span className="text-lg font-semibold leading-7 sm:text-xl">{faq.question}</span>
                  <motion.span
                    aria-hidden
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={toggleTransition}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/35 font-mono text-lg leading-none text-accent"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
                      transition={toggleTransition}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-6 text-base leading-7 text-text-muted sm:px-7 sm:pb-7">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
