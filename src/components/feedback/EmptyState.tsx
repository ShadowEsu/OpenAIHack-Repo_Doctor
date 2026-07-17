"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-surface-elevated p-3">
        <Icon className="h-8 w-8 text-text-muted" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white",
            "transition-colors hover:bg-accent-hover",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
