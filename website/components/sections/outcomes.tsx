"use client";

import { CountUp } from "@/components/CountUp";
import { motion, useReducedMotion } from "framer-motion";

const stats = [[1, "", "Treatment applied at a time"], [100, "%", "Changes require your approval"], [0, "", "Files touched without a diff shown first"], [null, "", "Every repair runs in a working copy, never the original"]] as const;
export function Outcomes() { const reduceMotion = useReducedMotion(); return <section className="border-y border-accent/15 bg-background-elevated"><div className="mx-auto grid max-w-7xl divide-y divide-accent/15 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-8">{stats.map(([value, suffix, label], index) => <motion.div key={label} className="py-9 sm:px-7 sm:first:pl-0" initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: .5, delay: index * .09 }}><p className="font-mono text-5xl font-bold tracking-[-.08em] text-accent">{value === null ? "Isolated" : <CountUp value={value} suffix={suffix} />}</p><p className="mt-3 max-w-44 text-sm leading-6 text-text-muted">{label}</p></motion.div>)}</div></section>; }
