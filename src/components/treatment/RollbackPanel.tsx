"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RollbackPanelProps {
  onRollback: () => void;
  disabled?: boolean;
}

export function RollbackPanel({ onRollback, disabled }: RollbackPanelProps) {
  return (
    <div className="rounded-xl border border-strong bg-surface-elevated p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-warning-light p-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </span>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-text-primary">Rollback Changes</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            This will revert all files modified by this treatment to their original state.
            The rollback cannot be undone.
          </p>
        </div>
      </div>

      <button
        onClick={onRollback}
        disabled={disabled}
        className={cn(
          "rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
          disabled
            ? "bg-surface text-text-muted cursor-not-allowed"
            : "bg-critical text-white hover:bg-critical/90"
        )}
      >
        Confirm Rollback
      </button>
    </div>
  );
}
