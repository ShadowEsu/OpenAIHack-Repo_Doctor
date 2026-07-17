"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw, Inbox, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { getRepository, getTreatments } from "@/lib/api";
import type { Repository, Treatment, TreatmentStatus } from "@/lib/types";

const statusConfig: Record<TreatmentStatus, { label: string; bg: string; text: string }> = {
  proposed: { label: "Proposed", bg: "bg-info-light", text: "text-info" },
  approved: { label: "Approved", bg: "bg-accent-light", text: "text-accent" },
  applying: { label: "Applying", bg: "bg-warning-light", text: "text-warning" },
  verifying: { label: "Verifying", bg: "bg-info-light", text: "text-info" },
  completed: { label: "Completed", bg: "bg-success-light", text: "text-success" },
  failed: { label: "Failed", bg: "bg-critical-light", text: "text-critical" },
  rolled_back: { label: "Rolled Back", bg: "bg-surface-elevated", text: "text-text-muted" },
};

export default function TreatmentHistoryPage() {
  const params = useParams();
  const repoId = params.repoId as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [repo, treats] = await Promise.all([
          getRepository(repoId),
          getTreatments(repoId),
        ]);
        setRepository(repo);
        setTreatments(treats);
      } catch (err) {
        console.error("Failed to fetch treatment history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [repoId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-text-primary">Treatment History</h1>
          <p className="text-sm text-text-muted">
            {treatments.length} {treatments.length === 1 ? "treatment" : "treatments"} applied
          </p>
        </div>

        {/* Treatment Table/Cards */}
        {treatments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-strong bg-surface py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-text-muted" />
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              No treatment history
            </h3>
            <p className="text-xs text-text-secondary">
              Treatment history will appear here once you apply fixes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {treatments.map((treatment) => {
              const status = statusConfig[treatment.status];
              const scoreDelta =
                treatment.scoreBefore != null && treatment.scoreAfter != null
                  ? treatment.scoreAfter - treatment.scoreBefore
                  : null;

              return (
                <Link
                  key={treatment.id}
                  href={`/app/repos/${repoId}/treatments/${treatment.id}`}
                  className="block rounded-xl border border-strong bg-surface-elevated p-5 transition-colors hover:bg-surface"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            status.bg,
                            status.text
                          )}
                        >
                          {status.label}
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatDate(treatment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary truncate">
                        {treatment.proposal.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>
                          {treatment.patches.length}{" "}
                          {treatment.patches.length === 1 ? "file" : "files"} changed
                        </span>
                        {scoreDelta !== null && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-medium",
                              scoreDelta > 0
                                ? "text-success"
                                : scoreDelta < 0
                                  ? "text-critical"
                                  : "text-text-muted"
                            )}
                          >
                            {scoreDelta > 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : scoreDelta < 0 ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            {scoreDelta > 0 ? "+" : ""}
                            {scoreDelta} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
  );
}
