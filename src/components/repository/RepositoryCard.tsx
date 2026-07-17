"use client";

import { Calendar, BarChart3 } from "lucide-react";
import { cn, formatRelativeTime, formatBytes, healthGradeColor, healthGradeLabel } from "@/lib/utils";
import type { Repository } from "@/lib/types";
import { TechnologyBadge } from "./TechnologyBadge";

interface RepositoryCardProps {
  repository: Repository;
  onClick?: () => void;
}

export function RepositoryCard({ repository, onClick }: RepositoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-strong bg-surface-elevated p-5 text-left transition-colors hover:bg-surface",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">{repository.name}</h3>
          <p className="text-xs text-text-muted truncate">{repository.fullName}</p>
        </div>
        {repository.language && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-secondary border border-strong">
            {repository.language}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          {repository.size ? formatBytes(repository.size) : "—"}
        </span>
        {repository.lastExaminedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatRelativeTime(repository.lastExaminedAt)}
          </span>
        )}
      </div>

      {repository.technologies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {repository.technologies.slice(0, 5).map((tech) => (
            <TechnologyBadge key={tech.name} technology={tech} />
          ))}
          {repository.technologies.length > 5 && (
            <span className="text-[10px] text-text-muted self-center">+{repository.technologies.length - 5}</span>
          )}
        </div>
      )}
    </button>
  );
}
