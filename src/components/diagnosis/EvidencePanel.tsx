"use client";

import { Code, FileText, Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Evidence } from "@/lib/types";

interface EvidencePanelProps {
  evidence: Evidence[];
}

const evidenceTypeConfig: Record<
  Evidence["type"],
  { icon: typeof Code; label: string; color: string }
> = {
  code: { icon: Code, label: "Code", color: "text-info" },
  config: { icon: FileText, label: "Config", color: "text-warning" },
  dependency: { icon: Package, label: "Dependency", color: "text-accent" },
  pattern: { icon: Layers, label: "Pattern", color: "text-text-muted" },
};

function formatLines(lines: [number, number][]): string {
  return lines
    .map(([start, end]) => (start === end ? `${start}` : `${start}–${end}`))
    .join(", ");
}

export function EvidencePanel({ evidence }: EvidencePanelProps) {
  if (evidence.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {evidence.map((item, i) => {
        const config = evidenceTypeConfig[item.type];
        const Icon = config.icon;

        return (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium",
                  config.color
                )}
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                {config.label}
              </span>

              {item.filePath && (
                <span className="truncate font-mono text-xs text-text-muted">
                  {item.filePath}
                </span>
              )}

              {item.lines && item.lines.length > 0 && (
                <span className="font-mono text-xs text-text-muted">
                  L{formatLines(item.lines)}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-text-secondary">
              {item.description}
            </p>

            {item.snippet && (
              <pre className="mt-3 overflow-x-auto rounded-md bg-surface-elevated p-3 text-xs leading-relaxed text-text-primary">
                <code className="font-mono">{item.snippet}</code>
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
