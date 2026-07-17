"use client";

import { motion } from "framer-motion";
import { FileSearch, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
  onClick?: () => void;
}

export function DiagnosisCard({ diagnosis, onClick }: DiagnosisCardProps) {
  const { title, summary, severity, confidence, affectedFiles, repairable } =
    diagnosis;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        "w-full rounded-lg border border-border bg-surface p-5 text-left",
        "transition-colors hover:border-border-strong hover:bg-surface-elevated",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        onClick && "cursor-pointer"
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={severity} />
        <ConfidenceBadge confidence={confidence} />
        {repairable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-xs font-medium text-success">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Repairable
          </span>
        )}
      </div>

      <h3 className="mb-1.5 text-sm font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-text-secondary">
        {summary}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          {affectedFiles.length}{" "}
          {affectedFiles.length === 1 ? "file" : "files"} affected
        </span>
      </div>
    </motion.button>
  );
}
