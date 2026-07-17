"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      {message && (
        <p className="text-sm text-text-secondary">{message}</p>
      )}
    </div>
  );
}
