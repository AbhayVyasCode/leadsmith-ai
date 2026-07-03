"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  History,
  Settings,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "leadsmith-sidebar-collapsed";

type NavItem = {
  label: string;
  icon: typeof Compass;
  href?: string;
  soon?: boolean;
};

export const APP_NAV: NavItem[] = [
  { label: "Discover", icon: Compass, href: "/app" },
  { label: "Memory", icon: Brain, href: "/app/memory" },
  { label: "Runs", icon: History, href: "/app/runs" },
  { label: "Settings", icon: Settings, soon: true },
];

function SidebarNavItem({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  if (item.soon) {
    return (
      <span
        aria-disabled
        className={cn(
          "group flex items-center gap-3 rounded-lg text-sm text-muted-foreground/50",
          collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="size-[18px] shrink-0" aria-hidden />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <span className="rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/40">
              Soon
            </span>
          </>
        )}
      </span>
    );
  }

  return (
    <Link
      href={item.href!}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg text-sm outline-none transition-all duration-150",
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden
      />
      {!collapsed && <span className="flex-1 truncate font-medium">{item.label}</span>}
      {!collapsed && isActive && (
        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </Link>
  );
}

export function SidebarNav({
  collapsed,
  className,
}: {
  collapsed: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex flex-1 flex-col gap-1 px-3 py-4", className)}
      aria-label="Workspace"
    >
      {!collapsed && (
        <span className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50">
          Workspace
        </span>
      )}
      {APP_NAV.map((item) => {
        // match exact for /app so /app/memory doesn't also highlight it
        const isActive = item.href === "/app" ? pathname === "/app" : pathname?.startsWith(item.href || "");
        return (
          <SidebarNavItem key={item.label} item={item} collapsed={collapsed} isActive={isActive} />
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    }
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh z-[1010] hidden flex-col border-r border-border bg-surface transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex shrink-0",
        collapsed ? "w-[68px]" : "w-[260px]",
      )}
      data-collapsed={collapsed}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-[56px] shrink-0 items-center border-b border-border transition-all duration-200",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        {collapsed ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 mx-auto text-muted-foreground/50 hover:text-foreground"
            onClick={toggle}
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="size-4" />
          </Button>
        ) : (
          <div className="flex flex-1 items-center justify-between">
            <Brand href="/" size="sm" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground/50 hover:text-foreground"
              onClick={toggle}
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <SidebarNav collapsed={collapsed} />

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 border-t border-border transition-all duration-200",
          collapsed ? "px-2 py-3" : "px-3 py-4",
        )}
      >
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-border/40 bg-muted/30 p-3.5">
            <p className="text-[13px] font-medium text-foreground">
              Evidence workspace
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/60">
              Research, inspect, and draft from one place.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {!collapsed ? (
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground/60 outline-none transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to website
            </Link>
          ) : (
            <Link
              href="/"
              title="Back to website"
              className="mx-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
