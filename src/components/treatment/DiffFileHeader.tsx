"use client";

import { ChevronDown, Plus, Minus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilePatch } from "@/lib/types";

interface DiffFileHeaderProps {
  patch: FilePatch;
  expanded: boolean;
  onToggle: () => void;
}

const operationConfig = {
  add: { label: "Add", icon: Plus, bg: "bg-success-light", text: "text-success" },
  modify: { label: "Modify", icon: Pencil, bg: "bg-info-light", text: "text-info" },
  delete: { label: "Delete", icon: Minus, bg: "bg-critical-light", text: "text-critical" },
};

export function DiffFileHeader({ patch, expanded, onToggle }: DiffFileHeaderProps) {
  const op = operationConfig[patch.operation];
  const OpIcon = op.icon;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface",
        expanded && "bg-surface"
      )}
    >
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-text-muted transition-transform",
          !expanded && "-rotate-90"
        )}
      />

      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
          op.bg,
          op.text
        )}
      >
        <OpIcon className="h-3 w-3" />
        {op.label}
      </span>

      <span className="flex-1 truncate font-mono text-sm text-text-primary">{patch.path}</span>

      <span className="flex items-center gap-2 text-xs">
        <span className="text-success">+{patch.additions}</span>
        <span className="text-critical">-{patch.deletions}</span>
      </span>
    </button>
  );
}
