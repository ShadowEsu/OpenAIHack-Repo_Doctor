"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagnosisList } from "@/components/diagnosis/DiagnosisList";
import { DiagnosisFilters } from "@/components/diagnosis/DiagnosisFilters";
import { getRepository, getDiagnoses } from "@/lib/api";
import type { Repository, Diagnosis } from "@/lib/types";

export default function DiagnosesPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params.repoId as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    severity?: string;
    category?: string;
    status?: string;
    repairable?: boolean;
  }>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [repo, diags] = await Promise.all([
          getRepository(repoId),
          getDiagnoses(repoId),
        ]);
        setRepository(repo);
        setDiagnoses(diags);
      } catch (err) {
        console.error("Failed to fetch diagnoses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [repoId]);

  const filteredDiagnoses = diagnoses.filter((d) => {
    if (filters.severity && d.severity !== filters.severity) return false;
    if (filters.category && d.category !== filters.category) return false;
    if (filters.status && d.status !== filters.status) return false;
    if (filters.repairable !== undefined && d.repairable !== filters.repairable)
      return false;
    return true;
  });

  const handleSelectDiagnosis = (id: string) => {
    router.push(`/app/repos/${repoId}/diagnoses/${id}`);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Diagnoses</h1>
            <p className="text-sm text-text-muted">
              {filteredDiagnoses.length}{" "}
              {filteredDiagnoses.length === 1 ? "finding" : "findings"} detected
            </p>
          </div>
        </div>

        {/* Filters */}
        <DiagnosisFilters filters={filters} onChange={setFilters} />

        {/* Diagnosis List */}
        {filteredDiagnoses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-strong bg-surface py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-text-muted" />
            <h3 className="mb-2 text-sm font-semibold text-text-primary">
              No diagnoses found
            </h3>
            <p className="text-xs text-text-secondary">
              {diagnoses.length === 0
                ? "Run an examination to detect issues"
                : "No diagnoses match your current filters"}
            </p>
          </div>
        ) : (
          <DiagnosisList
            diagnoses={filteredDiagnoses}
            onSelect={handleSelectDiagnosis}
          />
        )}
      </div>
  );
}
