"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardStatusProvider } from "@/contexts/DashboardStatusContext";
import { ChatStatusProvider } from "@/contexts/ChatStatusContext";
import { EmoteProvider } from "@/hooks/useEmotes";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  return (
    <DashboardStatusProvider>
      <ChatStatusProvider>
        <EmoteProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <DashboardHeader />
              <div className="flex-1 overflow-auto">
                <div className="container max-w-7xl p-6">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </EmoteProvider>
      </ChatStatusProvider>
    </DashboardStatusProvider>
  );
}
