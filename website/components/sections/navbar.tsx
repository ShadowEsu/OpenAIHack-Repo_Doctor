"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const links = [["Overview", "#overview"], ["Diagnoses", "#diagnoses"], ["Repository Map", "#how-it-works"], ["Treatments", "#verification"], ["How it Works", "#how-it-works"]] as const;

export function Navbar() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState("#overview");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = [...new Set(links.map(([, href]) => href))].map((href) => document.querySelector(href)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) setActive(`#${visible.target.id}`); }, { rootMargin: "-35% 0px -50% 0px", threshold: [0.05, .35] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const navigate = (href: string) => {
    const target = document.querySelector(href) as HTMLElement | null;
    if (!target) return;
    setActive(href);
    window.history.replaceState(null, "", href);
    target.classList.remove("nav-target-pulse");
    void target.offsetWidth;
    target.classList.add("nav-target-pulse");
    window.setTimeout(() => target.classList.remove("nav-target-pulse"), 1350);
    if (reduceMotion || !window.__repoDoctorLenis) { target.scrollIntoView(); return; }
    window.__repoDoctorLenis.scrollTo(target, { duration: 1.08, easing: (t) => 1 - Math.pow(1 - t, 4) });
  };
  const onNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string, mobile = false) => { event.preventDefault(); if (mobile) { setOpen(false); window.setTimeout(() => navigate(href), reduceMotion ? 0 : 180); } else navigate(href); };
  const linkClass = "relative px-1 py-2 text-sm text-text-muted transition-colors hover:text-accent";
  return <header className="sticky top-0 z-50 border-b border-accent/15 bg-background/95 backdrop-blur"><nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Main navigation"><a href="#overview" onClick={(event) => onNavClick(event, "#overview")} className="flex items-center gap-2 text-lg font-bold tracking-tight"><Image src="/logo.png" alt="Repo Doctor Logo" width={32} height={32} className="object-contain" />Repo <span className="text-accent">Doctor</span></a><div className="hidden items-center gap-6 lg:flex">{links.map(([label, href]) => <motion.a whileTap={reduceMotion ? {} : { scale: .96 }} transition={{ duration: .12 }} key={label} href={href} onClick={(event) => onNavClick(event, href)} className={`${linkClass} ${active === href ? "text-text-primary" : ""}`}>{label}{active === href && <motion.span layoutId="nav-active-indicator" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}</motion.a>)}</div><div className="flex items-center gap-3"><a href="#health-report" onClick={(event) => onNavClick(event, "#health-report")} className="hidden rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-secondary hover:text-text-primary sm:block">Examine a Repository</a><button type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)} className="rounded border border-accent/25 px-3 py-1.5 font-mono text-xs text-accent lg:hidden">Menu</button></div></nav><AnimatePresence>{open && <motion.div id="mobile-navigation" initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? {} : { opacity: 0, y: -8 }} transition={{ duration: .18, ease: "easeOut" }} className="border-t border-accent/15 bg-background px-5 py-4 lg:hidden"><div className="flex flex-col gap-1">{links.map(([label, href]) => <motion.a whileTap={reduceMotion ? {} : { scale: .96 }} key={label} href={href} onClick={(event) => onNavClick(event, href, true)} className={`${linkClass} ${active === href ? "text-accent" : ""}`}>{label}</motion.a>)}</div></motion.div>}</AnimatePresence></header>;
}
