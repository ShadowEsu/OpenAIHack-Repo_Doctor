"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthDimension } from "@/lib/types";

interface HealthDimensionsProps {
  dimensions: HealthDimension[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-accent";
  if (score >= 40) return "bg-warning";
  return "bg-critical";
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-accent";
  if (score >= 40) return "text-warning";
  return "text-critical";
}

export function HealthDimensions({ dimensions }: HealthDimensionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {dimensions.map((dimension, i) => (
        <motion.div
          key={dimension.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="group overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-accent/20 hover:shadow-md"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary">
              {dimension.name}
            </h4>
            <span
              className={cn(
                "font-mono text-lg font-bold",
                getScoreTextColor(dimension.score)
              )}
            >
              {dimension.score}
            </span>
          </div>

          {/* Animated progress bar */}
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dimension.score}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn("h-full rounded-full", getScoreColor(dimension.score))}
            />
          </div>

          {/* Findings */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <FileText className="h-3.5 w-3.5" />
            {dimension.findings} finding{dimension.findings !== 1 ? "s" : ""}
          </div>

          {/* Summary */}
          <p className="mt-2 text-xs leading-relaxed text-text-secondary line-clamp-2">
            {dimension.summary}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
