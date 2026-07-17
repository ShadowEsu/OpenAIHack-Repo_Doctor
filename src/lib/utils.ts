import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { HealthGrade, DiagnosisSeverity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function healthGradeLabel(grade: HealthGrade): string {
  const labels: Record<HealthGrade, string> = {
    excellent: "Excellent",
    good: "Good",
    needs_attention: "Needs Attention",
    critical: "Critical",
  };
  return labels[grade];
}

export function healthGradeColor(grade: HealthGrade): string {
  const colors: Record<HealthGrade, string> = {
    excellent: "text-success",
    good: "text-accent",
    needs_attention: "text-warning",
    critical: "text-critical",
  };
  return colors[grade];
}

export function severityColor(severity: DiagnosisSeverity): string {
  const colors: Record<DiagnosisSeverity, string> = {
    critical: "text-critical",
    high: "text-warning",
    medium: "text-info",
    low: "text-text-muted",
  };
  return colors[severity];
}

export function severityBg(severity: DiagnosisSeverity): string {
  const bgs: Record<DiagnosisSeverity, string> = {
    critical: "bg-critical-light",
    high: "bg-warning-light",
    medium: "bg-info-light",
    low: "bg-surface-elevated",
  };
  return bgs[severity];
}

export function scoreToGrade(score: number): HealthGrade {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "needs_attention";
  return "critical";
}

export function verificationStatusColor(
  status: string
): { dot: string; text: string } {
  switch (status) {
    case "passed":
      return { dot: "bg-success", text: "text-success" };
    case "failed":
      return { dot: "bg-critical", text: "text-critical" };
    case "running":
      return { dot: "bg-accent animate-pulse", text: "text-accent" };
    case "unavailable":
      return { dot: "bg-text-muted", text: "text-text-muted" };
    case "timeout":
      return { dot: "bg-warning", text: "text-warning" };
    default:
      return { dot: "bg-border-strong", text: "text-text-muted" };
  }
}
