"use client";

import { cn } from "@/lib/utils";
import type { Technology } from "@/lib/types";

interface TechnologyBadgeProps {
  technology: Technology;
}

export function TechnologyBadge({ technology }: TechnologyBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated border border-strong px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
      <span>{technology.name}</span>
      {technology.version && (
        <span className="text-text-muted">{technology.version}</span>
      )}
    </span>
  );
}
