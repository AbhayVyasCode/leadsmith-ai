import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        <AppSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col transition-all duration-200">
          <AppHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
