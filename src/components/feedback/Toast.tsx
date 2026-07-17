"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  variant: "success" | "error" | "info";
  onClose: () => void;
}

const variantStyles = {
  success: {
    container: "border-success bg-success-light",
    icon: "text-success",
  },
  error: {
    container: "border-critical bg-critical-light",
    icon: "text-critical",
  },
  info: {
    container: "border-info bg-info-light",
    icon: "text-info",
  },
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

export function Toast({ message, variant, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = variantStyles[variant];
  const Icon = icons[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto fixed bottom-20 right-4 z-50 flex items-start gap-3 rounded-md border px-4 py-3 shadow-md",
        "max-w-sm",
        styles.container
      )}
    >
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", styles.icon)}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm text-text-primary">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text-primary"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
