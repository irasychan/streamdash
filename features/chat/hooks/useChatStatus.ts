"use client";

import { useMemo } from "react";
import { useAppStore } from "@/state/appStore";

export function useChatStatus() {
  const status = useAppStore((state) => state.chatStatus);
  const isLoading = useAppStore((state) => state.chatStatusLoading);
  const refresh = useAppStore((state) => state.refreshChatStatus);
  const twitchUserId = useAppStore((state) => state.twitchUserId);

  const twitchChannel = useMemo(() => {
    const twitch = status.find((s) => s.platform === "twitch");
    return twitch?.connected ? twitch.channel : undefined;
  }, [status]);

  return {
    status,
    isLoading,
    refresh,
    twitchUserId,
    twitchChannel,
  };
}
