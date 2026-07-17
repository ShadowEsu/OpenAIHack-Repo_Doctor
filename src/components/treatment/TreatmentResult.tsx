"use client";

import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  RotateCcw,
  Plus,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Treatment } from "@/lib/types";

interface TreatmentResultProps {
  treatment: Treatment;
  onDownload?: () => void;
  onRollback?: () => void;
  onNewExamination?: () => void;
}

export function TreatmentResult({ treatment, onDownload, onRollback, onNewExamination }: TreatmentResultProps) {
  const isCompleted = treatment.status === "completed";
  const isFailed = treatment.status === "failed";

  const scoreDelta =
    treatment.scoreBefore != null && treatment.scoreAfter != null
      ? treatment.scoreAfter - treatment.scoreBefore
      : null;

  return (
    <div className="rounded-xl border border-strong bg-surface-elevated p-6 space-y-5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium",
          isCompleted && "bg-success-light text-success",
          isFailed && "bg-critical-light text-critical",
          !isCompleted && !isFailed && "bg-info-light text-info"
        )}
      >
        {isCompleted && <CheckCircle2 className="h-5 w-5" />}
        {isFailed && <XCircle className="h-5 w-5" />}
        <span>
          {isCompleted && "Treatment completed successfully"}
          {isFailed && "Treatment failed"}
          {!isCompleted && !isFailed && `Status: ${treatment.status}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-text-muted text-xs">Files Changed</span>
          <p className="text-text-primary font-medium">{treatment.patches.length}</p>
        </div>
        <div className="space-y-1">
          <span className="text-text-muted text-xs">Completed</span>
          <p className="text-text-primary font-medium">
            {treatment.completedAt ? formatDate(treatment.completedAt) : "—"}
          </p>
        </div>
      </div>

      {(treatment.scoreBefore != null || treatment.scoreAfter != null) && (
        <div className="rounded-lg bg-surface p-4 space-y-3">
          <span className="text-xs font-medium text-text-muted">Score</span>
          <div className="flex items-baseline gap-3">
            {treatment.scoreBefore != null && (
              <span className="text-2xl font-semibold text-text-muted">{treatment.scoreBefore}</span>
            )}
            {scoreDelta !== null && (
              <span className={cn("inline-flex items-center gap-1 text-sm font-medium", scoreDelta > 0 ? "text-success" : scoreDelta < 0 ? "text-critical" : "text-text-muted")}>
                {scoreDelta > 0 ? <ArrowUpRight className="h-4 w-4" /> : scoreDelta < 0 ? <ArrowDownRight className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {scoreDelta > 0 ? "+" : ""}{scoreDelta}
              </span>
            )}
            {treatment.scoreAfter != null && (
              <span className="text-2xl font-semibold text-text-primary">{treatment.scoreAfter}</span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xs font-medium text-text-muted">Verification</span>
        <div className="flex flex-wrap gap-2">
          {treatment.verification.steps.map((step, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                step.status === "passed" && "bg-success-light text-success",
                step.status === "failed" && "bg-critical-light text-critical",
                step.status === "running" && "bg-info-light text-info",
                step.status === "pending" && "bg-surface text-text-muted",
                step.status === "unavailable" && "bg-surface-elevated text-text-muted"
              )}
            >
              {step.status === "passed" && <CheckCircle2 className="h-3 w-3" />}
              {step.status === "failed" && <XCircle className="h-3 w-3" />}
              {step.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onDownload && (
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            <Download className="h-4 w-4" />
            Download Repaired Copy
          </button>
        )}
        {onRollback && treatment.status === "completed" && (
          <button
            onClick={onRollback}
            className="inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated"
          >
            <RotateCcw className="h-4 w-4" />
            Rollback
          </button>
        )}
        {onNewExamination && (
          <button
            onClick={onNewExamination}
            className="inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated"
          >
            <Plus className="h-4 w-4" />
            New Examination
          </button>
        )}
      </div>
    </div>
  );
}
