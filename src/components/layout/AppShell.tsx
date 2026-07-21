"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  Clock,
  Settings2,
  Activity,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  repositoryName?: string;
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard, segment: "" },
  { label: "Diagnoses", icon: Stethoscope, segment: "diagnoses" },
  { label: "Treatments", icon: Wrench, segment: "treatments" },
  { label: "History", icon: Clock, segment: "history" },
  { label: "Settings", icon: Settings2, segment: "settings" },
];

export function AppShell({ children, repositoryName }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  const repoMatch = pathname.match(/^\/app\/repos\/([^/]+)/);
  const repositoryId = repoMatch ? repoMatch[1] : undefined;

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  // Close drawer on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    if (mobileNavOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [mobileNavOpen, closeMobileNav]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="grain flex min-h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--accent-glow), transparent 40%)`,
          opacity: 0.3,
        }}
      />

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden border-r border-accent/15 bg-background-elevated lg:flex">
        <SidebarNav repositoryId={repositoryId} />
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobileNav}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface shadow-xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-sm shadow-accent/20">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-text-primary">
                    Repo Doctor
                  </span>
                </div>
                <button
                  onClick={closeMobileNav}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer navigation */}
              <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => {
                  const href = repositoryId
                    ? `/app/repos/${repositoryId}${item.segment ? "/" + item.segment : ""}`
                    : `/app/repos${item.segment ? "/" + item.segment : ""}`;
                  const isActive =
                    pathname === href || pathname.startsWith(href + "/");

                  return (
                    <Link
                      key={item.segment}
                      href={href}
                      onClick={closeMobileNav}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-accent-light text-accent"
                          : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          isActive ? "text-accent" : "text-text-muted"
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden">
          <TopBar
            onMenuToggle={toggleMobileNav}
            repositoryName={repositoryName}
          />
        </header>

        {/* Scrollable content with page transition */}
        <main id="main-content" className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-7xl animate-fade-in-up">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="relative z-10 lg:hidden">
          <MobileNav repositoryId={repositoryId} />
        </nav>
      </div>
    </div>
  );
}

// Desktop sidebar navigation
function SidebarNav({ repositoryId }: { repositoryId?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-screen w-72 flex-col bg-background-elevated"
      aria-label="Main navigation"
    >
      <div className="border-b border-accent/15 px-5 py-5">
        <Link href="/app/repos" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-accent text-sm font-black text-background shadow-lg shadow-accent/15">R</div>
          <div><span className="block text-sm font-bold tracking-tight text-text-primary">Repo Doctor</span><span className="font-mono text-[10px] uppercase tracking-[.14em] text-accent">Evidence workspace</span></div>
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const href = repositoryId
            ? `/app/repos/${repositoryId}${item.segment ? "/" + item.segment : ""}`
            : `/app/repos${item.segment ? "/" + item.segment : ""}`;
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={item.segment}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-light text-accent shadow-sm shadow-accent/10"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-accent"
                    : "text-text-muted group-hover:text-text-primary"
                )}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-accent/15 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-sm shadow-accent/20">
            <Activity className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-text-primary">
              Repo Doctor
            </span>
            <span className="ml-1.5 text-[10px] font-medium text-text-muted">
              v1.0
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
