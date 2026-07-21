"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  XCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EvidencePanel } from "./EvidencePanel";
import { AffectedFiles } from "./AffectedFiles";

interface DiagnosisDetailProps {
  diagnosis: Diagnosis;
  onGenerateTreatment?: () => void;
  onDismiss?: () => void;
  onMarkResolved?: () => void;
}

function SeverityGlyph({ severity, className }: { severity: Diagnosis["severity"]; className: string }) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className={className} aria-hidden="true" />;
    case "high":
      return <ArrowUp className={className} aria-hidden="true" />;
    case "medium":
      return <Minus className={className} aria-hidden="true" />;
    case "low":
      return <ArrowDown className={className} aria-hidden="true" />;
  }
}

function RiskGlyph({ risk, className }: { risk: string; className: string }) {
  return risk === "low" ? <ShieldCheck className={className} aria-hidden="true" /> : <ShieldAlert className={className} aria-hidden="true" />;
}

function effortLabel(effort: string): string {
  switch (effort) {
    case "quick":
      return "Quick fix";
    case "moderate":
      return "Moderate effort";
    case "significant":
      return "Significant effort";
    default:
      return effort;
  }
}

export function DiagnosisDetail({
  diagnosis,
  onGenerateTreatment,
  onDismiss,
  onMarkResolved,
}: DiagnosisDetailProps) {
  const {
    title,
    summary,
    description,
    severity,
    confidence,
    category,
    affectedFiles,
    evidence,
    repairable,
    repairRisk,
    repairEffort,
    status,
  } = diagnosis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="rounded-lg bg-surface-elevated p-2.5">
          <SeverityGlyph severity={severity} className={cn(
              "h-6 w-6",
              severity === "critical" && "text-critical",
              severity === "high" && "text-warning",
              severity === "medium" && "text-info",
              severity === "low" && "text-text-muted"
            )} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={severity} />
            <ConfidenceBadge confidence={confidence} />
            <span className="inline-flex items-center rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-text-secondary">
              {category}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                status === "open" && "bg-info-light text-info",
                status === "resolved" && "bg-success-light text-success",
                status === "dismissed" && "bg-surface-elevated text-text-muted"
              )}
            >
              {status === "open" && <Info className="h-3 w-3" aria-hidden="true" />}
              {status === "resolved" && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
              {status === "dismissed" && <XCircle className="h-3 w-3" aria-hidden="true" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary & Description */}
      <div className="space-y-3">
        <div>
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Summary</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{summary}</p>
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-text-primary">Why It Matters</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        </div>
      </div>

      {/* Evidence */}
      {evidence.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Evidence</h3>
          <EvidencePanel evidence={evidence} />
        </div>
      )}

      {/* Affected Files */}
      {affectedFiles.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Affected Files</h3>
          <AffectedFiles files={affectedFiles} />
        </div>
      )}

      {/* Recommended Treatment */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Recommended Treatment
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{effortLabel(repairEffort)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RiskGlyph risk={repairRisk} className={cn(
                "h-4 w-4",
                repairRisk === "low" ? "text-success" : "text-warning"
              )} />
            <span>
              {repairRisk.charAt(0).toUpperCase() + repairRisk.slice(1)} risk
            </span>
          </div>
          <div
            className={cn(
              "text-xs font-medium",
              repairable ? "text-success" : "text-text-muted"
            )}
          >
            {repairable ? "Automatically repairable" : "Manual repair required"}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {repairable && onGenerateTreatment && (
          <button
            type="button"
            onClick={onGenerateTreatment}
            className={cn(
              "inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-accent-hover",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            <Wrench className="h-4 w-4" aria-hidden="true" />
            Generate Treatment
          </button>
        )}
        {status === "open" && onMarkResolved && (
          <button
            type="button"
            onClick={onMarkResolved}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary",
              "transition-colors hover:bg-surface-elevated",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            Mark Resolved
          </button>
        )}
        {status === "open" && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary",
              "transition-colors hover:bg-surface-elevated hover:text-text-primary",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  );
}
