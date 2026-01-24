"use client";

import { PlatformBadge } from "./PlatformBadge";
import { cn } from "@/lib/utils";
import { useChatStatus } from "@/contexts/ChatStatusContext";

type ConnectionStatusProps = {
  className?: string;
  showLabels?: boolean;
};

export function ConnectionStatus({ className, showLabels = false }: ConnectionStatusProps) {
  const { status } = useChatStatus();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {status.map((s) => (
        <div
          key={s.platform}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2 py-1 transition-all",
            s.connected 
              ? "bg-emerald-500/10 ring-1 ring-emerald-500/20" 
              : "bg-muted/30"
          )}
          title={`${s.platform}: ${s.connected ? `Connected to ${s.channel}` : "Disconnected"}`}
        >
          <PlatformBadge platform={s.platform} />
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all",
              s.connected 
                ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" 
                : "bg-muted-foreground/40"
            )}
          />
          {showLabels && s.connected && (
            <span className="text-[10px] font-medium text-emerald-400 truncate max-w-[60px]">
              {s.channel}
            </span>
          )}
        </div>
      ))}
      {status.length === 0 && (
        <span className="text-xs text-muted-foreground/60">No platforms</span>
      )}
    </div>
  );
}
