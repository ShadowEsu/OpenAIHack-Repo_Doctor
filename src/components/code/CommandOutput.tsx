"use client";

import { cn } from "@/lib/utils";

interface CommandOutputProps {
  command: string;
  output: string;
  status: "passed" | "failed" | "running";
}

const statusStyles = {
  passed: "text-success",
  failed: "text-critical",
  running: "text-info",
};

export function CommandOutput({ command, output, status }: CommandOutputProps) {
  return (
    <div className="rounded-xl border border-strong bg-surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-strong px-4 py-2.5 bg-surface-elevated">
        <span className="text-xs font-medium text-text-muted">$</span>
        <code className="flex-1 text-xs font-mono text-text-primary truncate">{command}</code>
        <span className={cn("text-[10px] font-medium uppercase", statusStyles[status])}>
          {status}
        </span>
      </div>
      <pre className="px-4 py-3 text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
        {output || <span className="text-text-muted italic">No output</span>}
      </pre>
    </div>
  );
}
