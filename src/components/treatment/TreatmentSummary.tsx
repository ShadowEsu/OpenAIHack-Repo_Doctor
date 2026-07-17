"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Treatment, TreatmentStatus } from "@/lib/types";

interface TreatmentSummaryProps {
  treatment: Treatment;
}

const statusConfig: Record<TreatmentStatus, { label: string; bg: string; text: string }> = {
  proposed: { label: "Proposed", bg: "bg-info-light", text: "text-info" },
  approved: { label: "Approved", bg: "bg-accent-light", text: "text-accent" },
  applying: { label: "Applying", bg: "bg-warning-light", text: "text-warning" },
  verifying: { label: "Verifying", bg: "bg-info-light", text: "text-info" },
  completed: { label: "Completed", bg: "bg-success-light", text: "text-success" },
  failed: { label: "Failed", bg: "bg-critical-light", text: "text-critical" },
  rolled_back: { label: "Rolled Back", bg: "bg-surface-elevated", text: "text-text-muted" },
};

export function TreatmentSummary({ treatment }: TreatmentSummaryProps) {
  const status = statusConfig[treatment.status];
  const scoreDelta =
    treatment.scoreBefore != null && treatment.scoreAfter != null
      ? treatment.scoreAfter - treatment.scoreBefore
      : null;

  return (
    <div className="rounded-xl border border-strong bg-surface-elevated p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            status.bg,
            status.text
          )}
        >
          {status.label}
        </span>
        <span className="text-xs text-text-muted">{formatDate(treatment.createdAt)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary truncate pr-4">
          {treatment.proposal.summary}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>
          {treatment.patches.length} {treatment.patches.length === 1 ? "file" : "files"} changed
        </span>

        {scoreDelta !== null && (
          <span className={cn("inline-flex items-center gap-1 font-medium", scoreDelta > 0 ? "text-success" : scoreDelta < 0 ? "text-critical" : "text-text-muted")}>
            {scoreDelta > 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : scoreDelta < 0 ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {scoreDelta > 0 ? "+" : ""}{scoreDelta} pts
          </span>
        )}

        {scoreDelta === null && treatment.scoreAfter != null && (
          <span className="text-text-muted">Score: {treatment.scoreAfter}</span>
        )}
      </div>
    </div>
  );
}
