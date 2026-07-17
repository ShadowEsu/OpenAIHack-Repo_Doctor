"use client";

import { ShieldCheck, AlertTriangle, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalPanelProps {
  risk: "low" | "medium" | "high";
  onApprove: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const riskConfig = {
  low: {
    icon: ShieldCheck,
    color: "text-success",
    bg: "bg-success-light",
    message: "This treatment has minimal risk. Changes are isolated and easily reversible.",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning-light",
    message: "This treatment modifies core logic. Review the diff carefully before approving.",
  },
  high: {
    icon: FileWarning,
    color: "text-critical",
    bg: "bg-critical-light",
    message: "This treatment involves significant changes. A rollback may not fully restore the original state.",
  },
};

export function ApprovalPanel({ risk, onApprove, onCancel, disabled }: ApprovalPanelProps) {
  const config = riskConfig[risk];
  const RiskIcon = config.icon;

  return (
    <div className="rounded-xl border border-strong bg-surface-elevated p-6 space-y-5">
      <div className="flex items-start gap-3">
        <span className={cn("mt-0.5 rounded-lg p-2", config.bg)}>
          <RiskIcon className={cn("h-5 w-5", config.color)} />
        </span>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-text-primary">Safety Notice</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{config.message}</p>
        </div>
      </div>

      <div className="rounded-lg bg-info-light px-4 py-3 text-sm text-info">
        Your original repository remains unchanged until you approve this treatment.
      </div>

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={onApprove}
          disabled={disabled}
          className={cn(
            "rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
            disabled
              ? "bg-surface text-text-muted cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent/90"
          )}
        >
          Approve Treatment
        </button>
        <button
          onClick={onCancel}
          className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
