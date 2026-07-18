"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) { setCount(value); return; }
    const controls = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (latest) => setCount(Math.round(latest)) });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);
  return <motion.span ref={ref}>{count}{suffix}</motion.span>;
}
