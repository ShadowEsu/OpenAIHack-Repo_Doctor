"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { interactionClasses } from "@/lib/interaction-classes";

type WaitlistCtaProps = {
  className?: string;
};

type FormState = "form" | "submitting" | "success";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistCta({ className = "" }: WaitlistCtaProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<FormState>("form");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const headingId = useId();
  const descriptionId = useId();

  const close = () => {
    setOpen(false);
    setEmail("");
    setError("");
    setFormState("form");
  };

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setFormState("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "We couldn't save your email. Please try again.");
      setFormState("success");
    } catch (submissionError) {
      setFormState("form");
      setError(submissionError instanceof Error ? submissionError.message : "We couldn't save your email. Please try again.");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${interactionClasses.secondaryButton} ${className}`}>
        Join the Demo
      </button>

      {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-background/75 p-5 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? {} : { opacity: 0 }}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              aria-describedby={descriptionId}
              className="w-full max-w-md rounded-xl border border-accent/60 bg-background-elevated p-6 shadow-2xl shadow-black/50 sm:p-8"
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? {} : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {formState === "success" ? (
                <div className="text-center">
                  <div aria-hidden className="mx-auto flex size-12 items-center justify-center rounded-full border border-status-success/50 bg-status-success/10 text-2xl text-status-success">✓</div>
                  <h2 id={headingId} className="mt-5 text-2xl font-bold">You&apos;re on the list</h2>
                  <p id={descriptionId} className="mt-3 leading-7 text-status-success">We&apos;ll reach out when the demo is ready.</p>
                  <button type="button" onClick={close} className={`${interactionClasses.secondaryButton} mt-7 rounded-md border border-accent/35 px-4 py-2 font-semibold text-accent hover:border-accent hover:bg-accent/10`}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative text-center">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[.16em] text-accent">Demo access</p>
                      <h2 id={headingId} className="mt-3 text-3xl font-bold tracking-[-.035em]">Get early access</h2>
                    </div>
                    <button type="button" onClick={close} aria-label="Close early access form" className={`${interactionClasses.secondaryButton} absolute right-0 top-0 rounded-md border border-accent/25 px-3 py-1.5 font-mono text-sm text-accent hover:border-accent`}>
                      ×
                    </button>
                  </div>
                  <p id={descriptionId} className="mt-3 text-center text-text-muted">Join the list and we&apos;ll let you know when the Repo Doctor demo is ready.</p>
                  <form className="mt-7" onSubmit={submit} noValidate>
                    <label htmlFor="waitlist-email" className="font-mono text-xs uppercase tracking-[.12em] text-text-muted">Email address</label>
                    <input
                      ref={inputRef}
                      id="waitlist-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "waitlist-error" : undefined}
                      className="mt-2 w-full rounded-md border border-accent/25 bg-background px-4 py-3 text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      placeholder="you@example.com"
                      required
                    />
                    {error && <p id="waitlist-error" role="alert" className="mt-3 text-sm text-status-critical">{error}</p>}
                    <button type="submit" disabled={formState === "submitting"} className={`${interactionClasses.primaryButton} mt-5 w-full rounded-md bg-accent px-5 py-3 font-semibold text-background hover:bg-accent-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60`}>
                      {formState === "submitting" ? "Saving…" : "Notify Me"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
}
