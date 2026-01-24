"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/features/chat/components/PlatformBadge";
import { cn } from "@/lib/ui/cn";
import { useDashboardStatus } from "@/features/dashboard/hooks/useDashboardStatus";
import { useChatStatus } from "@/features/chat/hooks/useChatStatus";

const pathNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/chat": "Chat",
  "/dashboard/stats": "Stats",
  "/dashboard/widgets": "OBS Widgets",
  "/dashboard/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const title = pathNames[pathname] || "Dashboard";
  const { status, isLive } = useDashboardStatus();
  const { status: connectionStatus } = useChatStatus();

  const connectedPlatforms = connectionStatus.filter(s => s.connected);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-medium">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Platform Connection Status */}
          {connectionStatus.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              {connectionStatus.map((s) => (
                <div
                  key={s.platform}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all",
                    s.connected 
                      ? "bg-emerald-500/10" 
                      : "bg-muted/20 opacity-50"
                  )}
                  title={s.connected ? `${s.platform}: ${s.channel}` : `${s.platform}: Disconnected`}
                >
                  <PlatformBadge platform={s.platform} size="sm" />
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      s.connected 
                        ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" 
                        : "bg-muted-foreground/30"
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          {/* Status Text */}
          <span className="text-xs text-muted-foreground hidden md:block">{status}</span>
          
          {/* Live Badge */}
          <Badge
            variant={isLive ? "default" : "secondary"}
            className={cn(
              "text-xs font-medium",
              isLive 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                : "bg-muted/50 text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "mr-1.5 h-1.5 w-1.5 rounded-full",
                isLive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"
              )}
            />
            {isLive ? "Live" : "Offline"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
