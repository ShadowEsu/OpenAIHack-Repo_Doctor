"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  repositoryName?: string;
}

export function AppShell({ children, repositoryName }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  const repoMatch = pathname.match(/^\/app\/repos\/([^/]+)/);
  const repositoryId = repoMatch ? repoMatch[1] : undefined;

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="grain flex h-screen overflow-hidden bg-background">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--accent-glow), transparent 40%)`,
          opacity: 0.3,
        }}
      />

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden lg:flex">
        <Sidebar repositoryId={repositoryId} />
      </aside>

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
        <main id="main-content" className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="animate-fade-in-up">
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
