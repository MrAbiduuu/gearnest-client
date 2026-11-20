import React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "../component/DashboardSidebar";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider className="min-h-0! h-[calc(100svh-4rem)] overflow-hidden sm:h-[calc(100svh-5rem)]">
      <DashboardSidebar />

      <SidebarInset className="h-full overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
          <SidebarTrigger />
          <span className="text-sm font-semibold text-foreground">Dashboard</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashBoardLayout;
