"use client";

import { cn } from "@/lib/utils";

interface HealthTrendProps {
  scores: { score: number; date: string }[];
  className?: string;
}

export function HealthTrend({ scores, className }: HealthTrendProps) {
  if (scores.length < 2) {
    return (
      <div className={cn("text-sm text-text-muted", className)}>
        Not enough data for trend analysis
      </div>
    );
  }

  const maxScore = 100;
  const minScore = 0;
  const width = 200;
  const height = 60;
  const padding = 4;

  const points = scores.map((s, i) => ({
    x: padding + (i / (scores.length - 1)) * (width - padding * 2),
    y: padding + ((maxScore - s.score) / (maxScore - minScore)) * (height - padding * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const lastScore = scores[scores.length - 1].score;
  const prevScore = scores[scores.length - 2].score;
  const delta = lastScore - prevScore;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <svg width={width} height={height} className="shrink-0">
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={i === points.length - 1 ? "var(--accent)" : "var(--surface)"}
            stroke="var(--accent)"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="text-sm">
        <span className="font-mono font-medium text-text-primary">{lastScore}</span>
        <span
          className={cn(
            "ml-2 font-mono text-xs",
            delta > 0 && "text-success",
            delta < 0 && "text-critical",
            delta === 0 && "text-text-muted"
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      </div>
    </div>
  );
}
