"use client";

import Link from "next/link";
import { ArrowLeft, Brain, Compass, History, Settings } from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: typeof Compass;
  href?: string;
  active?: boolean;
  soon?: boolean;
};

export const APP_NAV: NavItem[] = [
  { label: "Discover", icon: Compass, href: "/app", active: true },
  { label: "Memory", icon: Brain, soon: true },
  { label: "Runs", icon: History, soon: true },
  { label: "Settings", icon: Settings, soon: true },
];

export function SidebarNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex flex-1 flex-col gap-1 p-3", className)} aria-label="Workspace">
      <span className="px-3 pb-2 pt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Workspace
      </span>
      {APP_NAV.map((item) => {
        const Icon = item.icon;
        if (item.soon) {
          return (
            <span
              key={item.label}
              aria-disabled
              className="flex min-h-11 cursor-not-allowed items-center justify-between gap-2 rounded-xl px-3 text-sm text-muted-foreground/60"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4" aria-hidden />
                {item.label}
              </span>
              <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              item.active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-[1010] hidden w-[272px] flex-col border-r border-border bg-surface/92 backdrop-blur-xl lg:flex">
      <div className="flex h-[64px] shrink-0 items-center border-b border-border px-5">
        <Brand href="/" size="sm" />
      </div>
      <SidebarNav />
      <div className="flex flex-col gap-3 border-t border-border p-4">
        <div className="premium-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-foreground">Evidence workspace</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Research companies, inspect fit evidence, and draft the first message from one place.
          </p>
        </div>
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to website
        </Link>
      </div>
    </aside>
  );
}
