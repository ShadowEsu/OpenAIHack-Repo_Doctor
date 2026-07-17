"use client";

import { useState, useCallback } from "react";
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
  const pathname = usePathname();

  // Extract repoId from URL: /app/repos/:repoId/...
  const repoMatch = pathname.match(/^\/app\/repos\/([^/]+)/);
  const repositoryId = repoMatch ? repoMatch[1] : undefined;

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — full width ≥1280px, collapsed 1024-1279px */}
      <aside className="hidden lg:flex">
        <Sidebar repositoryId={repositoryId} />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar — visible <1024px */}
        <header className="lg:hidden">
          <TopBar
            onMenuToggle={toggleMobileNav}
            repositoryName={repositoryName}
          />
        </header>

        {/* Scrollable content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>

        {/* Mobile bottom nav — visible <1024px */}
        <nav className="lg:hidden">
          <MobileNav repositoryId={repositoryId} />
        </nav>
      </div>
    </div>
  );
}
