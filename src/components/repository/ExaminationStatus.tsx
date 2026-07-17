"use client";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  FileSearch,
  Network,
  Scan,
  Stethoscope,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExaminationStatus as ExaminationStatusType } from "@/lib/types";

interface ExaminationStatusProps {
  status: ExaminationStatusType;
  progress?: number;
}

const statusConfig: Record<ExaminationStatusType, { label: string; icon: typeof Loader2; color: string }> = {
  queued: { label: "Queued", icon: Clock, color: "text-text-muted" },
  validating: { label: "Validating", icon: Settings, color: "text-info" },
  extracting: { label: "Extracting", icon: FileSearch, color: "text-info" },
  mapping: { label: "Mapping", icon: Network, color: "text-info" },
  scanning: { label: "Scanning", icon: Scan, color: "text-accent" },
  diagnosing: { label: "Diagnosing", icon: Stethoscope, color: "text-accent" },
  scoring: { label: "Scoring", icon: BarChart3, color: "text-accent" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success" },
  failed: { label: "Failed", icon: XCircle, color: "text-critical" },
};

export function ExaminationStatus({ status, progress }: ExaminationStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isRunning = !["completed", "failed"].includes(status);

  return (
    <div className="inline-flex items-center gap-2">
      <Icon className={cn("h-4 w-4", config.color, isRunning && "animate-spin")} />
      <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
      {progress != null && (
        <span className="text-xs text-text-muted">{Math.round(progress)}%</span>
      )}
    </div>
  );
}
