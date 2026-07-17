"use client";

import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineAlertProps {
  variant: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
}

const variantStyles = {
  info: {
    container: "border-info bg-info-light",
    icon: "text-info",
    title: "text-info",
    text: "text-text-primary",
  },
  success: {
    container: "border-success bg-success-light",
    icon: "text-success",
    title: "text-success",
    text: "text-text-primary",
  },
  warning: {
    container: "border-warning bg-warning-light",
    icon: "text-warning",
    title: "text-warning",
    text: "text-text-primary",
  },
  error: {
    container: "border-critical bg-critical-light",
    icon: "text-critical",
    title: "text-critical",
    text: "text-text-primary",
  },
};

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export function InlineAlert({ variant, title, children }: InlineAlertProps) {
  const styles = variantStyles[variant];
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-4 py-3",
        styles.container
      )}
    >
      <div className="flex gap-3">
        <Icon
          className={cn("mt-0.5 h-5 w-5 shrink-0", styles.icon)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className={cn("mb-1 text-sm font-semibold", styles.title)}>
              {title}
            </h4>
          )}
          <div className={cn("text-sm", styles.text)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
