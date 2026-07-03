"use client";

import { Menu, Github } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandMenu } from "@/components/app/command-menu";
import { SidebarNav } from "@/components/app/app-sidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-[1000] flex h-[64px] items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 px-0">
          <div className="px-6">
            <SheetTitle>
              <Brand />
            </SheetTitle>
          </div>
          <div className="mt-2">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          Discover
        </h1>
        <p className="text-xs text-muted-foreground/70">
          Research accounts with evidence attached
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <CommandMenu />
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="View on GitHub"
          className="text-muted-foreground/60 hover:text-foreground"
        >
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Github aria-hidden />
          </a>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
