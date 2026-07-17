"use client";

import { motion } from "framer-motion";
import {
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  healthGradeLabel,
  healthGradeColor,
  formatRelativeTime,
} from "@/lib/utils";
import type { HealthGrade } from "@/lib/types";
import { ScoreTrend } from "./ScoreTrend";

interface HealthScoreProps {
  score: number;
  grade: HealthGrade;
  previousScore?: number | null;
  summary: string;
  examinedAt: string;
}

function gradeToBorder(grade: HealthGrade): string {
  const map: Record<HealthGrade, string> = {
    excellent: "border-success/30",
    good: "border-accent/30",
    needs_attention: "border-warning/30",
    critical: "border-critical/30",
  };
  return map[grade];
}

function gradeToGlow(grade: HealthGrade): string {
  const map: Record<HealthGrade, string> = {
    excellent: "from-success/10",
    good: "from-accent/10",
    needs_attention: "from-warning/10",
    critical: "from-critical/10",
  };
  return map[grade];
}

export function HealthScore({
  score,
  grade,
  previousScore,
  summary,
  examinedAt,
}: HealthScoreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br to-transparent p-8",
        gradeToBorder(grade),
        gradeToGlow(grade)
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-surface-elevated p-3">
          <HeartPulse
            className={cn("h-6 w-6", healthGradeColor(grade))}
            aria-hidden="true"
          />
        </div>

        <motion.div
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-1 font-mono text-6xl font-bold tracking-tight text-text-primary"
        >
          {score}
        </motion.div>

        <span
          className={cn(
            "mb-4 text-sm font-semibold uppercase tracking-wide",
            healthGradeColor(grade)
          )}
        >
          {healthGradeLabel(grade)}
        </span>

        {previousScore !== undefined && previousScore !== null && (
          <div className="mb-4">
            <ScoreTrend current={score} previous={previousScore} />
          </div>
        )}

        <p className="mb-4 max-w-md text-sm leading-relaxed text-text-secondary">
          {summary}
        </p>

        <time className="text-xs text-text-muted">
          Examined {formatRelativeTime(examinedAt)}
        </time>
      </div>
    </motion.div>
  );
}
