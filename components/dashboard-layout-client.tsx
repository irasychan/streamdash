"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  status?: string;
  isLive?: boolean;
}

export function DashboardLayoutClient({ 
  children, 
  status = "Demo mode", 
  isLive = false 
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader status={status} isLive={isLive} />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
