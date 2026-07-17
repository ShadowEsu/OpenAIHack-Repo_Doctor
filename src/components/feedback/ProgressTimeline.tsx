"use client";

import { Check, Loader2, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
}

interface ProgressTimelineProps {
  stages: Stage[];
  currentStage?: string;
}

const statusStyles = {
  completed: {
    dot: "bg-success text-white",
    line: "bg-success",
    text: "text-text-primary",
  },
  running: {
    dot: "bg-accent text-white",
    line: "bg-border",
    text: "text-text-primary font-medium",
  },
  failed: {
    dot: "bg-critical text-white",
    line: "bg-border",
    text: "text-critical",
  },
  pending: {
    dot: "bg-surface-elevated text-text-muted border border-border",
    line: "bg-border",
    text: "text-text-muted",
  },
};

const statusIcons = {
  completed: Check,
  running: Loader2,
  failed: X,
  pending: Circle,
};

export function ProgressTimeline({ stages, currentStage }: ProgressTimelineProps) {
  return (
    <div className="flex flex-col" role="list" aria-label="Progress timeline">
      {stages.map((stage, index) => {
        const styles = statusStyles[stage.status];
        const Icon = statusIcons[stage.status];
        const isLast = index === stages.length - 1;
        const isRunning = stage.status === "running";

        return (
          <div
            key={stage.name}
            role="listitem"
            className="flex gap-3"
          >
            {/* Dot and connecting line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  styles.dot,
                  isRunning && "animate-pulse"
                )}
                aria-hidden="true"
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    isRunning && "animate-spin"
                  )}
                />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1 my-1",
                    styles.line
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Stage label */}
            <div className={cn("pb-6 min-h-[24px]", isLast && "pb-0")}>
              <span className={cn("text-sm", styles.text)}>
                {stage.name}
              </span>
              {isRunning && currentStage && (
                <span className="ml-2 text-xs text-text-muted">
                  {currentStage}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
