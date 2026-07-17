"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw, AlertTriangle, Trash2, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { getRepository } from "@/lib/api";
import type { Repository } from "@/lib/types";

export default function SettingsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retentionDays, setRetentionDays] = useState("30");
  const [aiModel, setAiModel] = useState("gpt-4");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const repo = await getRepository(repoId);
        setRepository(repo);
      } catch (err) {
        console.error("Failed to fetch repository:", err);
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
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-muted">
            Configure repository preferences and data retention
          </p>
        </div>

        {/* Repository Retention */}
        <section className="rounded-xl border border-strong bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Repository Retention
          </h2>
          <p className="text-xs text-text-secondary">
            Control how long examination data is stored for this repository
          </p>
          <div className="space-y-2">
            <label
              htmlFor="retention"
              className="text-xs font-medium text-text-primary"
            >
              Retention period (days)
            </label>
            <select
              id="retention"
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-strong bg-surface px-3 py-2 text-sm text-text-primary",
                "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
              )}
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
              <option value="forever">Forever</option>
            </select>
          </div>
        </section>

        {/* AI Preferences */}
        <section className="rounded-xl border border-strong bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">
            AI Preferences
          </h2>
          <p className="text-xs text-text-secondary">
            Configure how the AI analyzes your codebase
          </p>
          <div className="space-y-2">
            <label
              htmlFor="ai-model"
              className="text-xs font-medium text-text-primary"
            >
              Analysis model
            </label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-strong bg-surface px-3 py-2 text-sm text-text-primary",
                "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent"
              )}
            >
              <option value="gpt-4">GPT-4 (Recommended)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
            </select>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-xl border border-strong bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">
              Choose your preferred theme
            </p>
            <div className="flex gap-2">
              {([
                { value: "light" as const, label: "Light", icon: Sun },
                { value: "dark" as const, label: "Dark", icon: Moon },
                { value: "system" as const, label: "System", icon: Monitor },
              ]).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    theme === option.value
                      ? "border-accent bg-accent-light text-accent"
                      : "border-strong bg-surface text-text-secondary hover:bg-surface-elevated"
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted">
              Current theme: {resolvedTheme === "dark" ? "Dark" : "Light"}
            </p>
          </div>
        </section>

        {/* Privacy Info */}
        <section className="rounded-xl border border-strong bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Privacy</h2>
          <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
            <p>
              Your repository contents are analyzed in a secure environment and are
              never stored beyond the examination session.
            </p>
            <p>
              No changes are made to your repository without explicit approval.
              All treatments are reversible via rollback.
            </p>
            <p>
              Examination data is encrypted at rest and in transit. You can delete
              all data at any time using the option below.
            </p>
          </div>
        </section>

        {/* Delete Repository */}
        <section className="rounded-xl border border-critical/30 bg-critical-light/30 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-critical" />
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-critical">
                Danger Zone
              </h2>
              <p className="text-xs text-text-secondary">
                Deleting this repository will remove all examination data, diagnoses,
                and treatment history. This action cannot be undone.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-critical bg-surface px-4 py-2 text-sm font-medium text-critical",
                "transition-colors hover:bg-critical-light"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete Repository Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-critical font-medium">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={cn(
                    "rounded-lg border border-strong bg-surface px-4 py-2 text-sm font-medium text-text-secondary",
                    "transition-colors hover:bg-surface-elevated"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Delete would go here
                    setShowDeleteConfirm(false);
                  }}
                  className={cn(
                    "rounded-lg bg-critical px-4 py-2 text-sm font-medium text-white",
                    "transition-colors hover:bg-critical/90"
                  )}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
  );
}
