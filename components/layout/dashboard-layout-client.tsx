"use client";

import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { useAppStore } from "@/state/appStore";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const startChatStatusPolling = useAppStore(
    (state) => state.startChatStatusPolling
  );
  const stopChatStatusPolling = useAppStore(
    (state) => state.stopChatStatusPolling
  );

  useEffect(() => {
    startChatStatusPolling();
    return () => stopChatStatusPolling();
  }, [startChatStatusPolling, stopChatStatusPolling]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
