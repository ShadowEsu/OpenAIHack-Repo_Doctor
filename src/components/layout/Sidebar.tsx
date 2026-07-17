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
  { label: "Overview", icon: LayoutDashboard, href: "/app/repos" },
  { label: "Diagnoses", icon: Stethoscope, href: "/app/repos/diagnoses" },
  { label: "Treatments", icon: Wrench, href: "/app/repos/treatments" },
  { label: "History", icon: Clock, href: "/app/repos/history" },
  { label: "Settings", icon: Settings2, href: "/app/repos/settings" },
];

export function Sidebar({ collapsed = false, repositoryId }: SidebarProps) {
  const pathname = usePathname();

  const basePath = repositoryId ? `/app/repos/${repositoryId}` : "/app/repos";

  return (
    <nav
      className={cn(
        "flex h-screen flex-col border-r border-border bg-surface",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Main navigation"
    >
      {/* Navigation links */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const href = repositoryId
            ? `${basePath}/${item.href.split("/").pop()}`
            : item.href;
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-accent" : "text-text-muted group-hover:text-text-primary"
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
            "flex items-center gap-2",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <Activity
            className="h-5 w-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          {!collapsed && (
            <span className="text-sm font-semibold text-text-primary">
              Repo Doctor
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
