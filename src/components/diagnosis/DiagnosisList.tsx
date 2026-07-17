"use client";

import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/types";
import { DiagnosisCard } from "./DiagnosisCard";

interface DiagnosisListProps {
  diagnoses: Diagnosis[];
  onSelect?: (id: string) => void;
  className?: string;
}

export function DiagnosisList({ diagnoses, onSelect, className }: DiagnosisListProps) {
  if (diagnoses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm text-text-muted">No diagnoses found.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 overflow-y-auto",
        className
      )}
    >
      {diagnoses.map((diagnosis) => (
        <DiagnosisCard
          key={diagnosis.id}
          diagnosis={diagnosis}
          onClick={onSelect ? () => onSelect(diagnosis.id) : undefined}
        />
      ))}
    </div>
  );
}
