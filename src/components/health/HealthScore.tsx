"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus, Clock } from "lucide-react";
import { cn, healthGradeLabel, healthGradeColor, formatRelativeTime } from "@/lib/utils";
import type { HealthGrade } from "@/lib/types";

interface HealthScoreProps {
  score: number;
  grade: HealthGrade;
  previousScore?: number | null;
  summary: string;
  examinedAt: string;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export function HealthScore({
  score,
  grade,
  previousScore,
  summary,
  examinedAt,
}: HealthScoreProps) {
  const delta = previousScore !== null && previousScore !== undefined
    ? score - previousScore
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-all duration-500 hover:shadow-lg"
    >
      {/* Ambient glow */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Repository Health
          </h2>

          {/* Animated score */}
          <div className="mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-7xl font-bold tracking-tight text-text-primary"
            >
              <AnimatedNumber value={score} />
              <span className="text-3xl text-text-muted">/100</span>
            </motion.div>
          </div>

          {/* Grade badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold",
                healthGradeColor(grade),
                grade === "critical" && "bg-critical-light",
                grade === "needs_attention" && "bg-warning-light",
                grade === "good" && "bg-accent-light",
                grade === "excellent" && "bg-success-light"
              )}
            >
              {healthGradeLabel(grade)}
            </span>
          </motion.div>
        </div>

        {/* Delta indicator */}
        {delta !== null && delta !== 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
                delta > 0 && "bg-success-light text-success",
                delta < 0 && "bg-critical-light text-critical"
              )}
            >
              {delta > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : delta < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {delta > 0 ? "+" : ""}
              {delta} from previous
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-4 text-center text-sm leading-relaxed text-text-secondary"
        >
          {summary}
        </motion.p>

        {/* Timestamp */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <Clock className="h-3 w-3" />
          Examined {formatRelativeTime(examinedAt)}
        </div>
      </div>
    </motion.div>
  );
}
