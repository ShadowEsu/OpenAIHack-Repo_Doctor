"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  Clock,
  Settings2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  repositoryId?: string;
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard, segment: "" },
  { label: "Diagnoses", icon: Stethoscope, segment: "diagnoses" },
  { label: "Treatments", icon: Wrench, segment: "treatments" },
  { label: "History", icon: Clock, segment: "history" },
  { label: "Settings", icon: Settings2, segment: "settings" },
];

export function Sidebar({ collapsed = false, repositoryId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "glass-strong flex h-screen flex-col",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Main navigation"
    >
      {/* Navigation links */}
      <div className="flex flex-1 flex-col gap-1 p-3">
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
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-light text-accent shadow-sm shadow-accent/10"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-accent"
                    : "text-text-muted group-hover:text-text-primary"
                )}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Branding footer */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-sm shadow-accent/20">
            <Activity className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-bold tracking-tight text-text-primary">
                Repo Doctor
              </span>
              <span className="ml-1.5 text-[10px] font-medium text-text-muted">
                v1.0
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
