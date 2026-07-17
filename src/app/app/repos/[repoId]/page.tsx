"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, ArrowRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { RepositoryIdentity } from "@/components/repository/RepositoryIdentity";
import { HealthScore } from "@/components/health/HealthScore";
import { HealthDimensions } from "@/components/health/HealthDimensions";
import { DiagnosisCard } from "@/components/diagnosis/DiagnosisCard";
import { TreatmentSummary } from "@/components/treatment/TreatmentSummary";
import {
  getRepository,
  getHealthRecord,
  getDiagnoses,
  getTreatments,
} from "@/lib/api";
import type {
  Repository,
  HealthRecord,
  Diagnosis,
  Treatment,
} from "@/lib/types";

export default function RepoOverviewPage() {
  const params = useParams();
  const repoId = params.repoId as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [health, setHealth] = useState<HealthRecord | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [repo, healthRecord, diags, treats] = await Promise.all([
          getRepository(repoId),
          getHealthRecord(repoId),
          getDiagnoses(repoId),
          getTreatments(repoId),
        ]);
        setRepository(repo);
        setHealth(healthRecord);
        setDiagnoses(diags);
        setTreatments(treats);
      } catch (err) {
        console.error("Failed to fetch repository data:", err);
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

  if (!repository) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Inbox className="mb-4 h-12 w-12 text-text-muted" />
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          Repository not found
        </h2>
        <p className="text-sm text-text-secondary">
          This repository may have been deleted or is not accessible.
        </p>
        <Link
          href="/app/repos"
          className="mt-4 text-sm text-accent hover:text-accent-hover"
        >
          Back to repositories
        </Link>
      </div>
    );
  }

  const topDiagnosis = diagnoses
    .filter((d) => d.status === "open")
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })[0];

  return (
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Repository Identity */}
        <RepositoryIdentity repository={repository} />

        {/* Health Score */}
        {health && (
          <HealthScore
            score={health.score}
            grade={health.grade}
            previousScore={health.previousScore}
            summary={health.summary}
            examinedAt={health.examinedAt}
          />
        )}

        {/* Health Dimensions */}
        {health && (
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Health Dimensions
            </h3>
            <HealthDimensions dimensions={health.dimensions} />
          </div>
        )}

        {/* Top Priority Diagnosis */}
        {topDiagnosis && (
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Top Priority
            </h3>
            <Link href={`/app/repos/${repoId}/diagnoses/${topDiagnosis.id}`}>
              <DiagnosisCard diagnosis={topDiagnosis} />
            </Link>
          </div>
        )}

        {/* Recent Treatments */}
        {treatments.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Recent Treatments
            </h3>
            <div className="space-y-3">
              {treatments.slice(0, 3).map((treatment) => (
                <TreatmentSummary key={treatment.id} treatment={treatment} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/app/repos/${repoId}/diagnoses`}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-primary",
              "transition-colors hover:bg-surface-elevated"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            View All Diagnoses
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/exam/${repoId}/progress`}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-primary",
              "transition-colors hover:bg-surface-elevated"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Re-examine
          </Link>
        </div>
      </div>
  );
}
