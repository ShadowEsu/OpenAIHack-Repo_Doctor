"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { HealthScore } from "@/components/health/HealthScore";
import { HealthDimensions } from "@/components/health/HealthDimensions";
import { DiagnosisList } from "@/components/diagnosis/DiagnosisList";
import { TreatmentSummary } from "@/components/treatment/TreatmentSummary";
import { MOCK_HEALTH, MOCK_DIAGNOSES, MOCK_TREATMENTS } from "@/lib/api";

export default function SamplePage() {
  return (
    <AppShell repositoryName="sample-project">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* CTA Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-strong bg-surface-elevated p-5"
        >
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Sample Health Report
            </h2>
            <p className="text-sm text-text-muted">
              Explore what a full examination looks like
            </p>
          </div>
          <Link
            href="/connect"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-accent-hover"
            )}
          >
            Connect Your Repository
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Health Score */}
        <HealthScore
          score={MOCK_HEALTH.score}
          grade={MOCK_HEALTH.grade}
          previousScore={MOCK_HEALTH.previousScore}
          summary={MOCK_HEALTH.summary}
          examinedAt={MOCK_HEALTH.examinedAt}
        />

        {/* Health Dimensions */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Health Dimensions
          </h3>
          <HealthDimensions dimensions={MOCK_HEALTH.dimensions} />
        </div>

        {/* Diagnoses */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              Diagnoses ({MOCK_DIAGNOSES.length})
            </h3>
            <Link
              href="/app/repos"
              className="text-xs text-accent hover:text-accent-hover"
            >
              View all
            </Link>
          </div>
          <DiagnosisList diagnoses={MOCK_DIAGNOSES.slice(0, 3)} />
        </div>

        {/* Recent Treatments */}
        {MOCK_TREATMENTS.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              Recent Treatments
            </h3>
            <div className="space-y-3">
              {MOCK_TREATMENTS.map((treatment) => (
                <TreatmentSummary key={treatment.id} treatment={treatment} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-strong bg-surface p-8 text-center"
        >
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            Ready to examine your own repository?
          </h3>
          <p className="mb-4 text-sm text-text-secondary">
            Connect a GitHub repository to get a personalized health report
          </p>
          <Link
            href="/connect"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white",
              "transition-colors hover:bg-accent-hover"
            )}
          >
            Connect Repository
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}
