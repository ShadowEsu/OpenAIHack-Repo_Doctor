"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilePathProps {
  path: string;
  className?: string;
}

export function FilePath({ path, className }: FilePathProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary", className)}>
      <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      {path}
    </span>
  );
}
