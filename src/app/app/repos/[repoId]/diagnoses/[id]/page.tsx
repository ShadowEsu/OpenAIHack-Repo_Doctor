"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagnosisDetail } from "@/components/diagnosis/DiagnosisDetail";
import { getRepository, getDiagnosis, updateDiagnosisStatus, createTreatment } from "@/lib/api";
import type { Repository, Diagnosis } from "@/lib/types";

export default function DiagnosisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.repoId as string;
  const diagnosisId = params.id as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [repo, diag] = await Promise.all([
          getRepository(repoId),
          getDiagnosis(repoId, diagnosisId),
        ]);
        setRepository(repo);
        if (diag) setDiagnosis(diag);
      } catch (err) {
        console.error("Failed to fetch diagnosis:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [repoId, diagnosisId]);

  const handleGenerateTreatment = async () => {
    if (!diagnosis) return;
    try {
      await createTreatment(repoId, diagnosis.id);
      router.push(`/app/repos/${repoId}/treatments`);
    } catch (err) {
      console.error("Failed to create treatment:", err);
    }
  };

  const handleDismiss = async () => {
    if (!diagnosis) return;
    try {
      const updated = await updateDiagnosisStatus(repoId, diagnosis.id, "dismissed");
      if (updated) setDiagnosis(updated);
    } catch (err) {
      console.error("Failed to dismiss diagnosis:", err);
    }
  };

  const handleMarkResolved = async () => {
    if (!diagnosis) return;
    try {
      const updated = await updateDiagnosisStatus(repoId, diagnosis.id, "resolved");
      if (updated) setDiagnosis(updated);
    } catch (err) {
      console.error("Failed to mark resolved:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          Diagnosis not found
        </h2>
        <button
          onClick={() => router.push(`/app/repos/${repoId}/diagnoses`)}
          className="mt-4 text-sm text-accent hover:text-accent-hover"
        >
          Back to diagnoses
        </button>
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/app/repos/${repoId}/diagnoses`)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary",
            "transition-colors hover:bg-surface-elevated"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to diagnoses
        </button>

        {/* Diagnosis Detail */}
        <DiagnosisDetail
          diagnosis={diagnosis}
          onGenerateTreatment={diagnosis.repairable ? handleGenerateTreatment : undefined}
          onDismiss={diagnosis.status === "open" ? handleDismiss : undefined}
          onMarkResolved={diagnosis.status === "open" ? handleMarkResolved : undefined}
        />
      </div>
  );
}
