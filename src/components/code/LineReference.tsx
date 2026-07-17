"use client";

import { cn } from "@/lib/utils";

interface LineReferenceProps {
  file: string;
  lines: [number, number];
}

export function LineReference({ file, lines }: LineReferenceProps) {
  const [start, end] = lines;
  const label = start === end ? `${file}:${start}` : `${file}:${start}-${end}`;

  return (
    <span className="inline-flex items-center font-mono text-xs text-text-muted">
      {label}
    </span>
  );
}
