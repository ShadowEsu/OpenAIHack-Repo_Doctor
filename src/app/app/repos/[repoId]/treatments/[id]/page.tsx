"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreatmentProposal } from "@/components/treatment/TreatmentProposal";
import { DiffViewer } from "@/components/treatment/DiffViewer";
import { VerificationSteps } from "@/components/treatment/VerificationSteps";
import { TreatmentResult } from "@/components/treatment/TreatmentResult";
import { RollbackPanel } from "@/components/treatment/RollbackPanel";
import {
  getRepository,
  getTreatment,
  getDiagnosis,
  approveTreatment,
  rollbackTreatment,
} from "@/lib/api";
import type { Repository, Treatment, Diagnosis } from "@/lib/types";

export default function TreatmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.repoId as string;
  const treatmentId = params.id as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [repo, treat] = await Promise.all([
          getRepository(repoId),
          getTreatment(repoId, treatmentId),
        ]);
        setRepository(repo);
        if (treat) {
          setTreatment(treat);
          const diag = await getDiagnosis(repoId, treat.diagnosisId);
          if (diag) setDiagnosis(diag);
        }
      } catch (err) {
        console.error("Failed to fetch treatment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [repoId, treatmentId]);

  const handleApprove = async () => {
    if (!treatment) return;
    setIsApproving(true);
    try {
      const updated = await approveTreatment(repoId, treatment.id);
      setTreatment(updated);
    } catch (err) {
      console.error("Failed to approve treatment:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRollback = async () => {
    if (!treatment) return;
    setIsRollingBack(true);
    try {
      const updated = await rollbackTreatment(repoId, treatment.id);
      setTreatment(updated);
    } catch (err) {
      console.error("Failed to rollback treatment:", err);
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleCancel = () => {
    router.push(`/app/repos/${repoId}/treatments`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 text-text-muted animate-spin" />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          Treatment not found
        </h2>
        <button
          onClick={() => router.push(`/app/repos/${repoId}/treatments`)}
          className="mt-4 text-sm text-accent hover:text-accent-hover"
        >
          Back to treatments
        </button>
      </div>
    );
  }

  return (
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/app/repos/${repoId}/treatments`)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary",
            "transition-colors hover:bg-surface-elevated"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to treatments
        </button>

        {/* Treatment Proposal */}
        {(treatment.status === "proposed" || treatment.status === "approved") && (
          <TreatmentProposal
            proposal={treatment.proposal}
            diagnosis={diagnosis ?? undefined}
            onApprove={treatment.status === "proposed" ? handleApprove : undefined}
            onCancel={handleCancel}
          />
        )}

        {/* Diff Viewer */}
        {treatment.patches.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Changes
            </h3>
            <DiffViewer patches={treatment.patches} />
          </div>
        )}

        {/* Verification Steps */}
        {(treatment.status === "verifying" ||
          treatment.status === "completed" ||
          treatment.status === "failed") && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Verification
            </h3>
            <VerificationSteps steps={treatment.verification.steps} />
          </div>
        )}

        {/* Treatment Result */}
        {(treatment.status === "completed" || treatment.status === "failed") && (
          <TreatmentResult
            treatment={treatment}
            onRollback={
              treatment.status === "completed" ? handleRollback : undefined
            }
          />
        )}

        {/* Rollback Panel */}
        {treatment.status === "completed" && (
          <RollbackPanel onRollback={handleRollback} disabled={isRollingBack} />
        )}
      </div>
  );
}
