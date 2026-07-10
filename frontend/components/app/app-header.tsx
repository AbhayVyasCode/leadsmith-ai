"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/app/app-sidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-[1000] flex h-[56px] items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-[18px]" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-border bg-surface px-0">
          <div className="px-5">
            <SheetTitle>
              <Brand />
            </SheetTitle>
          </div>
          <div className="mt-2">
            <SidebarNav collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden min-w-0 flex-1 lg:block">
        <h1 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
          Discover
        </h1>
        <p className="text-[12px] text-muted-foreground/50">
          Research accounts with evidence attached
        </p>
      </div>

      <div className="flex-1 lg:hidden" />

      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
