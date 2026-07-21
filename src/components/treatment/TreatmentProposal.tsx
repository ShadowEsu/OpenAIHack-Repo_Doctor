"use client";

import { ShieldCheck, FileWarning, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreatmentProposal as TreatmentProposalType, Diagnosis } from "@/lib/types";

interface TreatmentProposalProps {
  proposal: TreatmentProposalType;
  diagnosis?: Diagnosis;
  onApprove?: () => void;
  onCancel?: () => void;
  isApproving?: boolean;
}

const riskConfig = {
  low: { label: "Low Risk", icon: ShieldCheck, color: "text-success", bg: "bg-success-light" },
  medium: { label: "Medium Risk", icon: AlertTriangle, color: "text-warning", bg: "bg-warning-light" },
  high: { label: "High Risk", icon: FileWarning, color: "text-critical", bg: "bg-critical-light" },
};

export function TreatmentProposal({ proposal, diagnosis, onApprove, onCancel, isApproving = false }: TreatmentProposalProps) {
  const risk = riskConfig[proposal.risk];
  const RiskIcon = risk.icon;

  return (
    <div className="rounded-xl border border-strong bg-surface-elevated p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">Treatment Proposal</h3>
          {diagnosis && (
            <p className="text-sm text-text-secondary">{diagnosis.title}</p>
          )}
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", risk.bg, risk.color)}>
          <RiskIcon className="h-3.5 w-3.5" />
          {risk.label}
        </span>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{proposal.summary}</p>

      <div className="flex items-center gap-3 text-sm text-text-muted">
        <span className="font-medium text-text-primary">
          {proposal.affectedFiles.length} {proposal.affectedFiles.length === 1 ? "file" : "files"} affected
        </span>
      </div>

      {proposal.verificationPlan.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-primary">Verification Plan</h4>
          <ul className="space-y-2">
            {proposal.verificationPlan.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-strong bg-surface text-xs font-medium text-text-muted">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg bg-info-light px-4 py-3 text-sm text-info">
        Your original repository remains unchanged.
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onApprove && (
          <button
            onClick={onApprove}
            disabled={isApproving}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
              "bg-accent text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isApproving ? "Applying and verifying..." : "Approve and Run Verification"}
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
