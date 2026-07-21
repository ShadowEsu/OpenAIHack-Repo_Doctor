"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { WaitlistCta } from "@/components/WaitlistCta";
import { interactionClasses } from "@/lib/interaction-classes";

const links = [
  ["Diagnoses", "#health-report"],
  ["Treatments", "#verification"],
  ["How it Works", "#how-it-works"],
  ["Compare", "#comparison"],
] as const;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://repo-doctor-two.vercel.app";

export function Navbar() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const [active, setActive] = useState("#overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const overviewTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setActive(pathname);
      return;
    }

    const sections = ["#overview", ...links.map(([, href]) => href)]
      .map((href) => document.querySelector(href))
      .filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.05, 0.35] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOverviewOpen(false);
        setMobileFeaturesOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  const pageHref = (href: string) => href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  const navigate = (href: string) => {
    const target = document.querySelector(href) as HTMLElement | null;
    if (!target) return;

    setActive(href);
    window.history.replaceState(null, "", href);
    target.classList.remove("nav-target-pulse");
    void target.offsetWidth;
    target.classList.add("nav-target-pulse");
    window.setTimeout(() => target.classList.remove("nav-target-pulse"), 1350);

    if (reduceMotion || !window.__repoDoctorLenis) {
      target.scrollIntoView();
      return;
    }

    window.__repoDoctorLenis.scrollTo(target, {
      duration: 1.08,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  };

  const onNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string, mobile = false) => {
    if (!href.startsWith("#") || pathname !== "/") {
      if (mobile) setMobileOpen(false);
      return;
    }

    event.preventDefault();
    if (mobile) {
      setMobileOpen(false);
      window.setTimeout(() => navigate(href), reduceMotion ? 0 : 180);
      return;
    }
    navigate(href);
  };

  const openOverviewMenu = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setOverviewOpen(true);
  };

  const scheduleOverviewClose = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setOverviewOpen(false), 180);
  };

  const closeOverviewMenu = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setOverviewOpen(false);
  };

  const linkClass = `relative px-1 py-2 text-sm text-text-muted ${interactionClasses.navLink}`;
  const overviewIsActive = active === "#overview";
  const menuTransition = { duration: reduceMotion ? 0 : 0.18, ease: "easeOut" as const };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-accent/15 bg-background/95 backdrop-blur" onKeyDown={(event) => {
      if (event.key === "Escape") {
        closeOverviewMenu();
        setMobileFeaturesOpen(false);
        overviewTriggerRef.current?.focus();
      }
    }}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Main navigation">
        <Link href={pageHref("#overview")} onClick={(event) => onNavClick(event, "#overview")} className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Image src="/logo.png" alt="Repo Doctor Logo" width={32} height={32} className="object-contain" />
          Repo <span className="text-accent">Doctor</span>
        </Link>

        <div className="hidden items-center gap-6 xl:flex">
          <div className="relative flex items-center" onMouseEnter={openOverviewMenu} onMouseLeave={scheduleOverviewClose} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleOverviewClose();
          }}>
            <Link href={pageHref("#overview")} onClick={(event) => onNavClick(event, "#overview")} className={`${linkClass} ${overviewIsActive ? "text-text-primary" : ""}`}>
              Overview
            </Link>
            <button ref={overviewTriggerRef} type="button" aria-label="Toggle Overview menu" aria-expanded={overviewOpen} aria-controls="overview-menu" onClick={() => setOverviewOpen((value) => !value)} className="nav-dropdown-trigger flex size-7 items-center justify-center text-text-muted">
              <motion.span aria-hidden animate={{ rotate: overviewOpen ? 180 : 0 }} transition={menuTransition}>⌄</motion.span>
            </button>
            {overviewIsActive && <motion.span layoutId="nav-active-indicator" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
            <AnimatePresence>
              {overviewOpen && (
                <motion.div id="overview-menu" initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? {} : { opacity: 0, y: -4 }} transition={menuTransition} className="absolute left-0 top-full z-50 mt-2 min-w-40 rounded-lg border border-accent/30 bg-background-elevated p-1.5 shadow-2xl shadow-black/40">
                  <Link href="/features" onClick={closeOverviewMenu} className="block rounded-md px-3 py-2 text-sm text-text-muted transition-colors duration-[180ms] ease-out hover:bg-accent/10 hover:text-accent">Features</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {links.map(([label, href]) => (
            <motion.div whileTap={reduceMotion ? {} : { scale: 0.96 }} transition={{ duration: 0.12 }} key={label}>
              <Link href={pageHref(href)} onClick={(event) => onNavClick(event, href)} className={`${linkClass} ${active === href ? "text-text-primary" : ""}`}>
                {label}
                {active === href && <motion.span layoutId="nav-active-indicator" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <WaitlistCta className="hidden rounded-md border border-accent/35 bg-background-elevated px-4 py-2 text-sm font-semibold text-accent hover:border-accent hover:bg-accent/10 sm:inline-flex" />
          <a href={appUrl} className={`hidden ${interactionClasses.primaryButton} rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-secondary hover:text-text-primary sm:block`}>Launch app</a>
          <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((value) => !value)} className={`${interactionClasses.secondaryButton} rounded border border-accent/25 px-3 py-1.5 font-mono text-xs text-accent xl:hidden`}>
            Menu
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div id="mobile-navigation" initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? {} : { opacity: 0, y: -8 }} transition={menuTransition} className="border-t border-accent/15 bg-background px-5 py-4 xl:hidden">
            <div className="flex flex-col gap-1">
              <div>
                <button type="button" aria-expanded={mobileFeaturesOpen} aria-controls="mobile-overview-menu" onClick={() => setMobileFeaturesOpen((value) => !value)} className={`nav-dropdown-trigger ${linkClass} flex w-full items-center justify-between ${overviewIsActive ? "text-accent" : ""}`}>
                  <span>Overview</span>
                  <span className="flex size-9 items-center justify-center text-text-muted">
                    <motion.span aria-hidden animate={{ rotate: mobileFeaturesOpen ? 180 : 0 }} transition={menuTransition}>⌄</motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {mobileFeaturesOpen && (
                    <motion.div id="mobile-overview-menu" initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduceMotion ? {} : { height: 0, opacity: 0 }} transition={menuTransition} className="overflow-hidden">
                      <Link href="/features" onClick={() => { setMobileFeaturesOpen(false); setMobileOpen(false); }} className={`ml-3 block border-l border-accent/30 px-4 py-2 text-sm ${active === "/features" ? "text-accent" : "text-text-muted"}`}>Features</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {links.map(([label, href]) => (
                <motion.div whileTap={reduceMotion ? {} : { scale: 0.96 }} key={label}>
                  <Link href={pageHref(href)} onClick={(event) => onNavClick(event, href, true)} className={`${linkClass} ${active === href ? "text-accent" : ""}`}>{label}</Link>
                </motion.div>
              ))}
              <a href={appUrl} className="mt-3 rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-background">Launch app</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
