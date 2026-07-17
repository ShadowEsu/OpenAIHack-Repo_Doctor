"use client";

import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthDimension } from "@/lib/types";

interface HealthDimensionsProps {
  dimensions: HealthDimension[];
}

function scoreBarColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 70) return "bg-accent";
  if (score >= 50) return "bg-warning";
  return "bg-critical";
}

export function HealthDimensions({ dimensions }: HealthDimensionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {dimensions.map((dim, i) => (
        <motion.div
          key={dim.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              {dim.name}
            </h3>
            <span className="font-mono text-sm font-bold text-text-primary">
              {dim.score}
            </span>
          </div>

          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
            <motion.div
              className={cn("h-full rounded-full", scoreBarColor(dim.score))}
              initial={{ width: 0 }}
              animate={{ width: `${dim.score}%` }}
              transition={{ duration: 0.6, delay: i * 0.05 + 0.2 }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {dim.findings} {dim.findings === 1 ? "finding" : "findings"}
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            {dim.summary}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
