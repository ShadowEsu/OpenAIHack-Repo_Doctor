"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle, X, AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { startExamination } from "@/lib/api";
import type { ExaminationStage, ExaminationStatus } from "@/lib/types";

const STAGES: ExaminationStage[] = [
  { name: "Validating source", status: "pending", startedAt: null, completedAt: null },
  { name: "Extracting files", status: "pending", startedAt: null, completedAt: null },
  { name: "Mapping project structure", status: "pending", startedAt: null, completedAt: null },
  { name: "Detecting technologies", status: "pending", startedAt: null, completedAt: null },
  { name: "Inspecting imports", status: "pending", startedAt: null, completedAt: null },
  { name: "Reviewing dependencies", status: "pending", startedAt: null, completedAt: null },
  { name: "Examining tests", status: "pending", startedAt: null, completedAt: null },
  { name: "Reviewing documentation", status: "pending", startedAt: null, completedAt: null },
  { name: "Generating diagnoses", status: "pending", startedAt: null, completedAt: null },
  { name: "Calculating health score", status: "pending", startedAt: null, completedAt: null },
];

export default function ExamProgressPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [stages, setStages] = useState<ExaminationStage[]>(STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [status, setStatus] = useState<ExaminationStatus>("queued");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate examination progress
  useEffect(() => {
    if (isCancelled || error) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 100);

      setStages((prev) => {
        const next = [...prev];
        const idx = currentStageIndex;

        if (idx >= next.length) {
          clearInterval(interval);
          setStatus("completed");
          setTimeout(() => {
            router.push(`/app/repos/${examId}`);
          }, 1500);
          return next;
        }

        // Mark current stage as running if pending
        if (next[idx].status === "pending") {
          next[idx] = {
            ...next[idx],
            status: "running",
            startedAt: new Date().toISOString(),
          };
          setStatus("scanning");
        }

        // Complete current stage after random delay
        const shouldComplete = Math.random() > 0.6;
        if (shouldComplete && next[idx].status === "running") {
          next[idx] = {
            ...next[idx],
            status: "completed",
            completedAt: new Date().toISOString(),
          };
          setCurrentStageIndex((prev) => prev + 1);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStageIndex, examId, isCancelled, error, router]);

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progress = (completedCount / stages.length) * 100;

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    setIsCancelled(true);
    router.push("/connect");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-24">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              Examining Repository
            </h1>
            <p className="text-sm text-text-muted">
              Analyzing codebase structure and patterns
            </p>
          </div>

          {/* Progress Card */}
          <div className="rounded-xl border border-strong bg-surface p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-text-primary">
                  {status === "completed" ? "Complete" : "In Progress"}
                </span>
                <span className="text-text-muted">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Stage Checklist */}
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <div
                  key={stage.name}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    stage.status === "running" && "bg-accent-light",
                    stage.status === "completed" && "bg-success-light"
                  )}
                >
                  {stage.status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  )}
                  {stage.status === "running" && (
                    <Loader2 className="h-4 w-4 shrink-0 text-accent animate-spin" />
                  )}
                  {stage.status === "pending" && (
                    <Circle className="h-4 w-4 shrink-0 text-text-muted" />
                  )}
                  <span
                    className={cn(
                      "flex-1",
                      stage.status === "completed" && "text-success",
                      stage.status === "running" && "text-accent font-medium",
                      stage.status === "pending" && "text-text-muted"
                    )}
                  >
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Elapsed Time */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-text-muted">Elapsed time</span>
              <span className="font-mono text-sm text-text-primary">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          {/* Cancel Button */}
          {!isCancelled && status !== "completed" && (
            <div className="text-center">
              <button
                onClick={handleCancel}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary",
                  "transition-colors hover:bg-surface-elevated"
                )}
              >
                <X className="h-4 w-4" />
                Cancel Examination
              </button>
            </div>
          )}

          {/* Completion Message */}
          {status === "completed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg bg-success-light p-4 text-center"
            >
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
              <p className="text-sm font-medium text-success">
                Examination complete! Redirecting to dashboard...
              </p>
            </motion.div>
          )}

          {/* Failure Message */}
          {status === "failed" && error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg bg-critical-light p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-critical" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-critical">
                    Examination Failed
                  </p>
                  <p className="mt-1 text-sm text-critical/80">{error}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setStatus("queued");
                    setCurrentStageIndex(0);
                    setStages(STAGES);
                    setElapsedTime(0);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white",
                    "transition-colors hover:bg-accent-hover"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </button>
                <button
                  onClick={() => router.push("/connect")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary",
                    "transition-colors hover:bg-surface-elevated"
                  )}
                >
                  Try Different Repository
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
