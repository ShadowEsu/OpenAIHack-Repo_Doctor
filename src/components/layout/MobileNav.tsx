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
    <div className="glass-strong flex h-16 items-center justify-around border-t border-border">
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
              "flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition-all duration-200",
              isActive
                ? "text-accent"
                : "text-text-muted hover:text-text-secondary"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                isActive && "bg-accent-light"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive && "text-accent"
                )}
                aria-hidden="true"
              />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
