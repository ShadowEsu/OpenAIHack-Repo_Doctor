"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const inView = useInView(ref, { once: false, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      setCount(0);
      return;
    }
    if (reduceMotion) { setCount(value); return; }
    const start = window.setTimeout(() => {
      controlsRef.current = animate(0, value, { duration: 1.3, ease: [0.16, 1, 0.3, 1], onUpdate: (latest) => setCount(Math.round(latest)) });
    }, 90);
    return () => { window.clearTimeout(start); controlsRef.current?.stop(); };
  }, [inView, reduceMotion, value]);
  return <motion.span ref={ref}>{count}{suffix}</motion.span>;
}
