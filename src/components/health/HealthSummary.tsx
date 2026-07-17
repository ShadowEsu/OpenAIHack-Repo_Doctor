"use client";

import { motion } from "framer-motion";
import { HeartPulse, AlertTriangle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  healthGradeLabel,
  healthGradeColor,
} from "@/lib/utils";
import type { HealthGrade, HealthDimension } from "@/lib/types";

interface HealthSummaryProps {
  score: number;
  grade: HealthGrade;
  dimensions: HealthDimension[];
  diagnosisCount: number;
  treatmentCount: number;
}

export function HealthSummary({
  score,
  grade,
  dimensions,
  diagnosisCount,
  treatmentCount,
}: HealthSummaryProps) {
  const totalFindings = dimensions.reduce((sum, d) => sum + d.findings, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-surface px-6 py-4"
    >
      <div className="flex items-center gap-3">
        <HeartPulse className={cn("h-5 w-5", healthGradeColor(grade))} aria-hidden="true" />
        <div>
          <span className="font-mono text-2xl font-bold text-text-primary">{score}</span>
          <span
            className={cn(
              "ml-2 text-xs font-semibold uppercase tracking-wide",
              healthGradeColor(grade)
            )}
          >
            {healthGradeLabel(grade)}
          </span>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
        <span>
          <strong className="font-medium text-text-primary">{diagnosisCount}</strong>{" "}
          {diagnosisCount === 1 ? "diagnosis" : "diagnoses"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
        <span>
          <strong className="font-medium text-text-primary">{treatmentCount}</strong>{" "}
          {treatmentCount === 1 ? "treatment" : "treatments"}
        </span>
      </div>

      <div className="text-xs text-text-muted">
        {totalFindings} total {totalFindings === 1 ? "finding" : "findings"} across{" "}
        {dimensions.length} dimensions
      </div>
    </motion.div>
  );
}
