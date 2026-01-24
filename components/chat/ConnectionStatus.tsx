"use client";

import { useEffect, useState } from "react";
import type { ChatConnectionStatus } from "@/lib/types/chat";
import { PlatformBadge } from "./PlatformBadge";
import { cn } from "@/lib/utils";

type ConnectionStatusProps = {
  className?: string;
};

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ChatConnectionStatus[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/chat/status");
        const data = await response.json();
        if (data.ok) {
          setStatus(data.data.platforms);
        }
      } catch {
        // Ignore errors
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {status.map((s) => (
        <div
          key={s.platform}
          className="flex items-center gap-1"
          title={`${s.platform}: ${s.connected ? `Connected to ${s.channel}` : "Disconnected"}`}
        >
          <PlatformBadge platform={s.platform} />
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              s.connected ? "bg-emerald-500" : "bg-muted-foreground/50"
            )}
          />
        </div>
      ))}
    </div>
  );
}
