"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuToggle?: () => void;
  repositoryName?: string;
}

export function TopBar({ onMenuToggle, repositoryName }: TopBarProps) {
  return (
    <div className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
      {/* Hamburger menu */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title + repo name */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-text-primary">
          {repositoryName || "Repo Doctor"}
        </h1>
      </div>
    </div>
  );
}
