"use client";

import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosisFilterValues {
  severity?: string;
  category?: string;
  status?: string;
  repairable?: boolean;
}

interface DiagnosisFiltersProps {
  filters: DiagnosisFilterValues;
  onChange: (filters: DiagnosisFilterValues) => void;
}

const severities = ["critical", "high", "medium", "low"];
const statuses = ["open", "resolved", "dismissed"];

export function DiagnosisFilters({ filters, onChange }: DiagnosisFiltersProps) {
  const hasFilters =
    filters.severity || filters.category || filters.status || filters.repairable !== undefined;

  function clearFilters() {
    onChange({ severity: undefined, category: undefined, status: undefined, repairable: undefined });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-text-muted" aria-hidden="true" />

      <select
        aria-label="Filter by severity"
        value={filters.severity ?? ""}
        onChange={(e) =>
          onChange({ ...filters, severity: e.target.value || undefined })
        }
        className={cn(
          "rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary",
          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
        )}
      >
        <option value="">Severity</option>
        {severities.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by status"
        value={filters.status ?? ""}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value || undefined })
        }
        className={cn(
          "rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary",
          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
        )}
      >
        <option value="">Status</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by repairability"
        value={filters.repairable === undefined ? "" : String(filters.repairable)}
        onChange={(e) =>
          onChange({
            ...filters,
            repairable: e.target.value === "" ? undefined : e.target.value === "true",
          })
        }
        className={cn(
          "rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary",
          "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
        )}
      >
        <option value="">Repairable</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
}
