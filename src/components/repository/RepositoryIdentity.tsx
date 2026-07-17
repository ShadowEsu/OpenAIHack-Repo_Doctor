"use client";

import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Repository } from "@/lib/types";

interface RepositoryIdentityProps {
  repository: Repository;
}

export function RepositoryIdentity({ repository }: RepositoryIdentityProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-text-primary">{repository.name}</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-muted border border-strong">
          <GitBranch className="h-3 w-3" />
          {repository.branch}
        </span>
      </div>

      <p className="text-sm text-text-muted">{repository.fullName}</p>

      <div className="flex items-center gap-3">
        {repository.language && (
          <span className="text-xs font-medium text-text-secondary">{repository.language}</span>
        )}
      </div>

      {repository.description && (
        <p className="text-sm text-text-secondary leading-relaxed pt-1">{repository.description}</p>
      )}
    </div>
  );
}
