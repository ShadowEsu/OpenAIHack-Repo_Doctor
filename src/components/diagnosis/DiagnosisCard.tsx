"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { Diagnosis } from "@/lib/types";

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  onClick?: () => void;
}

export function DiagnosisCard({ diagnosis, onClick }: DiagnosisCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group w-full text-left rounded-2xl border border-border bg-surface p-5",
        "transition-all duration-300",
        "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      )}
    >
      {/* Top row: badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={diagnosis.severity} />
        <ConfidenceBadge confidence={diagnosis.confidence} />
        {diagnosis.repairable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Repairable
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1.5 text-base font-semibold text-text-primary transition-colors group-hover:text-accent">
        {diagnosis.title}
      </h3>

      {/* Summary */}
      <p className="mb-3 text-sm leading-relaxed text-text-secondary line-clamp-2">
        {diagnosis.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <FileText className="h-3.5 w-3.5" />
        {diagnosis.affectedFiles.length} file{diagnosis.affectedFiles.length !== 1 ? "s" : ""} affected
      </div>
    </motion.button>
  );
}
