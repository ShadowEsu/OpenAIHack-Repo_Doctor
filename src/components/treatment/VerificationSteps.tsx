"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MinusCircle,
  Circle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStep } from "@/lib/types";

interface VerificationStepsProps {
  steps: VerificationStep[];
}

const statusIcon: Record<string, { icon: typeof Circle; color: string }> = {
  pending: { icon: Circle, color: "text-text-muted" },
  running: { icon: Loader2, color: "text-accent" },
  passed: { icon: CheckCircle2, color: "text-success" },
  failed: { icon: XCircle, color: "text-critical" },
  unavailable: { icon: MinusCircle, color: "text-text-muted" },
  timeout: { icon: XCircle, color: "text-warning" },
};

export function VerificationSteps({ steps }: VerificationStepsProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const s = statusIcon[step.status] ?? statusIcon.pending;
        const Icon = s.icon;
        const isExpanded = expanded.has(index);
        const hasOutput = step.output && step.output.trim().length > 0;

        return (
          <div key={index} className="rounded-lg border border-strong overflow-hidden">
            <button
              onClick={() => hasOutput && toggle(index)}
              aria-expanded={isExpanded}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface",
                isExpanded && "bg-surface"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  s.color,
                  step.status === "running" && "animate-spin"
                )}
              />
              <span className="flex-1 text-sm text-text-primary font-medium">{step.name}</span>
              {step.command && (
                <span className="text-xs text-text-muted font-mono truncate max-w-[200px]">
                  {step.command}
                </span>
              )}
              {step.duration != null && (
                <span className="text-xs text-text-muted">{step.duration}ms</span>
              )}
              {hasOutput && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-text-muted transition-transform",
                    !isExpanded && "-rotate-90"
                  )}
                />
              )}
            </button>
            {isExpanded && hasOutput && (
              <div className="border-t border-strong bg-surface px-4 py-3">
                <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                  {step.output}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
