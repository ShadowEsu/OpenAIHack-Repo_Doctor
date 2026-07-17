"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-success";
  if (confidence >= 0.5) return "text-warning";
  return "text-critical";
}

function confidenceBg(confidence: number): string {
  if (confidence >= 0.8) return "bg-success-light";
  if (confidence >= 0.5) return "bg-warning-light";
  return "bg-critical-light";
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-mono",
        confidenceBg(confidence),
        confidenceColor(confidence)
      )}
    >
      {percentage}%
    </span>
  );
}
