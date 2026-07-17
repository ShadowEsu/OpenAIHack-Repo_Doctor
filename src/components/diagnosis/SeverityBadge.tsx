"use client";

import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { severityColor, severityBg } from "@/lib/utils";
import type { DiagnosisSeverity } from "@/lib/types";

interface SeverityBadgeProps {
  severity: DiagnosisSeverity;
}

const severityConfig: Record<
  DiagnosisSeverity,
  { icon: typeof AlertTriangle; label: string }
> = {
  critical: { icon: AlertTriangle, label: "Critical" },
  high: { icon: ArrowUp, label: "High" },
  medium: { icon: Minus, label: "Medium" },
  low: { icon: ArrowDown, label: "Low" },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { icon: Icon, label } = severityConfig[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        severityBg(severity),
        severityColor(severity)
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
