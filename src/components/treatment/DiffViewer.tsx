"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FilePatch } from "@/lib/types";
import { DiffFileHeader } from "./DiffFileHeader";

interface DiffViewerProps {
  patches: FilePatch[];
}

function DiffLine({ line }: { line: string }) {
  const trimmed = line.replace(/^diff --git.*$/, "");
  if (!trimmed || trimmed.startsWith("index ") || trimmed.startsWith("---") || trimmed.startsWith("+++") || trimmed.startsWith("@@")) {
    return (
      <span className="block px-4 py-0.5 text-xs text-text-muted bg-surface">
        {line}
      </span>
    );
  }

  if (trimmed.startsWith("+")) {
    return (
      <span className="block px-4 py-0.5 text-xs bg-success-light text-success font-mono whitespace-pre-wrap">
        {line}
      </span>
    );
  }

  if (trimmed.startsWith("-")) {
    return (
      <span className="block px-4 py-0.5 text-xs bg-critical-light text-critical font-mono whitespace-pre-wrap">
        {line}
      </span>
    );
  }

  return (
    <span className="block px-4 py-0.5 text-xs text-text-secondary font-mono whitespace-pre-wrap">
      {line}
    </span>
  );
}

export function DiffViewer({ patches }: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());

  const toggleFile = (index: number) => {
    setExpandedFiles((prev) => {
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
    <div className="space-y-2">
      {patches.map((patch, index) => (
        <div key={patch.path} className="rounded-xl border border-strong overflow-hidden">
          <DiffFileHeader
            patch={patch}
            expanded={expandedFiles.has(index)}
            onToggle={() => toggleFile(index)}
          />
          {expandedFiles.has(index) && (
            <div className="border-t border-strong">
              {patch.diff.split("\n").map((line, i) => (
                <DiffLine key={i} line={line} />
              ))}
              {patch.explanation && (
                <div className="px-4 py-3 bg-surface border-t border-strong text-xs text-text-secondary">
                  {patch.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
