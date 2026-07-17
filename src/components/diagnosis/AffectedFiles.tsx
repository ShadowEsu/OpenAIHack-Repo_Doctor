"use client";

import { FileCode } from "lucide-react";
import type { AffectedFile } from "@/lib/types";

interface AffectedFilesProps {
  files: AffectedFile[];
}

function formatLineRanges(lines: [number, number][]): string {
  return lines
    .map(([start, end]) => (start === end ? `${start}` : `${start}–${end}`))
    .join(", ");
}

export function AffectedFiles({ files }: AffectedFilesProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {files.map((file, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3"
        >
          <FileCode
            className="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <code className="truncate text-xs font-medium text-text-primary">
                {file.path}
              </code>
              {file.lines.length > 0 && (
                <span className="shrink-0 font-mono text-xs text-text-muted">
                  L{formatLineRanges(file.lines)}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              {file.relevance}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
