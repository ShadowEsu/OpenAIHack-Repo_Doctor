"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreTrendProps {
  current: number;
  previous: number | null;
}

export function ScoreTrend({ current, previous }: ScoreTrendProps) {
  if (previous === null || previous === undefined) {
    return null;
  }

  const delta = current - previous;
  const absDelta = Math.abs(delta);

  if (delta > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-medium text-success">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
        <span>+{absDelta}</span>
      </div>
    );
  }

  if (delta < 0) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-critical-light px-3 py-1 text-xs font-medium text-critical">
        <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
        <span>-{absDelta}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium text-text-muted">
      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      <span>No change</span>
    </div>
  );
}
