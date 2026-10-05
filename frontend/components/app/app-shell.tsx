"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpLeft, Brain, Compass, History, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { describeEngine, EngineDot, EngineProvider, EngineStatusCard, useEngine } from "@/components/app/engine";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/cn";

/** Fired when the user asks for a fresh search while already on /app. */
export const NEW_SEARCH_EVENT = "leadsmith:new-search";

const NAV = [
  { href: "/app", label: "Discover", icon: Compass },
  { href: "/app/runs", label: "Runs", icon: History },
  { href: "/app/memory", label: "Memory", icon: Brain },
] as const;

const isActive = (pathname: string, href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

function useNewSearch() {
  const pathname = usePathname();
  const router = useRouter();
  return () => {
    if (pathname === "/app") window.dispatchEvent(new Event(NEW_SEARCH_EVENT));
    router.push("/app");
  };
}

function MobileEngineDot() {
  const { health } = useEngine();
  const { tone, label } = describeEngine(health);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-xs text-ink-2" title={label}>
      <EngineDot tone={tone} />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const newSearch = useNewSearch();
  const title = NAV.find((n) => isActive(pathname, n.href))?.label ?? "Workspace";

  return (
    <EngineProvider>
      <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-panel px-4 pb-4 pt-5 lg:flex">
          <Logo className="px-2" />
          <button
            type="button"
            onClick={newSearch}
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ember font-medium text-on-ember shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_10px_24px_-12px_var(--ember)] transition-[background-color,transform] duration-200 hover:bg-[color-mix(in_oklab,var(--ember)_86%,white)] active:translate-y-px"
          >
            <Plus className="size-4" aria-hidden />
            New search
          </button>
          <nav aria-label="Workspace" className="mt-6 grid grid-cols-1 gap-1">
            <p className="eyebrow px-3 pb-2 text-ink-3">Workspace</p>
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] transition-colors duration-200",
                    active ? "bg-panel-2 font-medium text-ink" : "text-ink-2 hover:bg-panel-2/60 hover:text-ink",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-ember transition-transform duration-300 ease-[var(--ease-spring)]",
                      active ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                  <Icon className={cn("size-[18px]", active ? "text-ember-ink" : "text-ink-3 group-hover:text-ink-2")} aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
            <EngineStatusCard />
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-ink-3 transition-colors hover:text-ink">
                <ArrowUpLeft className="size-4" aria-hidden />
                Back to site
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-canvas/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <Logo />
            </div>
            <p className="hidden items-center gap-2 text-sm text-ink-3 lg:flex">
              Workspace <span aria-hidden>/</span> <span className="font-medium text-ink">{title}</span>
            </p>
            <div className="flex items-center gap-2 lg:hidden">
              <MobileEngineDot />
              <ThemeToggle />
              <button
                type="button"
                onClick={newSearch}
                aria-label="New search"
                className="inline-flex size-10 items-center justify-center rounded-full bg-ember text-on-ember"
              >
                <Plus className="size-[18px]" aria-hidden />
              </button>
            </div>
          </header>

          <main id="main" className="flex-1 pb-28 lg:pb-16">
            {children}
          </main>

          {/* Mobile tab bar */}
          <nav
            aria-label="Workspace"
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-canvas/92 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex flex-col items-center gap-1 rounded-xl py-1.5 text-[0.72rem] font-medium", active ? "text-ink" : "text-ink-3")}
                >
                  <Icon className={cn("size-5", active && "text-ember-ink")} aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <Toaster />
    </EngineProvider>
  );
}
