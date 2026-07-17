"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  Clock,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  repositoryId?: string;
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard, segment: "" },
  { label: "Diagnoses", icon: Stethoscope, segment: "diagnoses" },
  { label: "Treatments", icon: Wrench, segment: "treatments" },
  { label: "History", icon: Clock, segment: "history" },
  { label: "Settings", icon: Settings2, segment: "settings" },
];

export function MobileNav({ repositoryId }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-14 items-center justify-around border-t border-border bg-surface">
      {navItems.map((item) => {
        const href = repositoryId
          ? `/app/repos/${repositoryId}${item.segment ? "/" + item.segment : ""}`
          : `/app/repos${item.segment ? "/" + item.segment : ""}`;
        const isActive =
          pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={item.segment}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
              isActive
                ? "text-accent"
                : "text-text-muted hover:text-text-secondary"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                isActive && "text-accent"
              )}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
