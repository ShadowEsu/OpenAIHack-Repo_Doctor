"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreatmentSummary } from "@/components/treatment/TreatmentSummary";
import { getRepository, getTreatments } from "@/lib/api";
import type { Repository, Treatment } from "@/lib/types";

export default function TreatmentsPage() {
  const params = useParams();
  const router = useRouter();
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
        console.error("Failed to fetch treatments:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [repoId]);

  const handleSelectTreatment = (id: string) => {
    router.push(`/app/repos/${repoId}/treatments/${id}`);
  };

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
          <h1 className="text-xl font-bold text-text-primary">Treatments</h1>
          <p className="text-sm text-text-muted">
            {treatments.length} {treatments.length === 1 ? "treatment" : "treatments"} applied
          </p>
        </div>

        {/* Treatment List */}
        {treatments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-strong bg-surface py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-text-muted" />
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              No treatments yet
            </h3>
            <p className="text-xs text-text-secondary">
              Treatments will appear here once you approve and apply fixes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <button
                key={treatment.id}
                onClick={() => handleSelectTreatment(treatment.id)}
                className="w-full text-left"
              >
                <TreatmentSummary treatment={treatment} />
              </button>
            ))}
          </div>
        )}
      </div>
  );
}
