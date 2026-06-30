"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Search,
  SunMoon,
  Home,
  Play,
  CornerDownLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EXAMPLE_QUERIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  // Global Cmd/Ctrl+K toggle.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Helper so every item closes consistently, then runs its action.
  const runAction = React.useCallback((action?: () => void) => {
    setOpen(false);
    action?.();
  }, []);

  const itemClass =
    "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground outline-none aria-selected:bg-muted cursor-pointer data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";
  const iconClass = "size-4 shrink-0 text-muted-foreground";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="hidden w-56 justify-start gap-2 px-2.5 text-muted-foreground font-normal sm:inline-flex"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="truncate">Search…</span>
        <kbd className="ml-auto inline-flex h-5 items-center rounded border border-border px-1.5 text-[10px] font-medium text-muted-foreground tnum font-mono">
          ⌘K
        </kbd>
      </Button>

      {/* Compact trigger for small viewports. */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="sm:hidden"
      >
        <Search aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showClose={false}
          className="max-w-xl gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">Command menu</DialogTitle>
          <Command
            loop
            className="bg-surface-2 text-foreground"
            // cmdk filters items by the input value; keep default fuzzy match.
          >
            <div className="flex items-center gap-2.5 border-b border-border px-3.5">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <Command.Input
                autoFocus
                placeholder="Type a command or search…"
                className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <Command.List className="max-h-[min(60vh,360px)] overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="px-2 py-6 text-center text-sm text-muted-foreground">
                No results.
              </Command.Empty>

              <Command.Group
                heading="Actions"
                className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                <Command.Item
                  value="Run a search"
                  onSelect={() => runAction()}
                  className={itemClass}
                >
                  <Play className={iconClass} aria-hidden />
                  <span>Run a search</span>
                </Command.Item>

                <Command.Item
                  value="Toggle theme"
                  onSelect={() =>
                    runAction(() =>
                      setTheme(resolvedTheme === "dark" ? "light" : "dark"),
                    )
                  }
                  className={itemClass}
                >
                  <SunMoon className={iconClass} aria-hidden />
                  <span>Toggle theme</span>
                </Command.Item>

                <Command.Item
                  value="Go to landing page"
                  onSelect={() => runAction(() => router.push("/"))}
                  className={itemClass}
                >
                  <Home className={iconClass} aria-hidden />
                  <span>Go to landing page</span>
                </Command.Item>
              </Command.Group>

              <Command.Group
                heading="Try a search"
                className="mt-1 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {EXAMPLE_QUERIES.map((query) => (
                  <Command.Item
                    key={query}
                    value={query}
                    onSelect={() => runAction()}
                    className={cn(itemClass, "text-muted-foreground")}
                  >
                    <CornerDownLeft className={iconClass} aria-hidden />
                    <span className="truncate text-foreground">{query}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
