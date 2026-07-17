"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-critical-light p-3">
        <AlertTriangle className="h-8 w-8 text-critical" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-critical">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-surface-elevated px-4 py-2 text-sm font-medium",
            "border border-border text-text-primary transition-colors",
            "hover:bg-surface hover:border-border-strong",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          )}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
