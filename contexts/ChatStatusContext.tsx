"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { ChatConnectionStatus } from "@/lib/types/chat";

type ChatStatusContextType = {
  status: ChatConnectionStatus[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  getTwitchChannel: () => string | undefined;
  getTwitchUserId: () => string | undefined;
};

const ChatStatusContext = createContext<ChatStatusContextType | null>(null);

const POLL_INTERVAL = 10000; // 10 seconds instead of 5

export function ChatStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ChatConnectionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [twitchUserId, setTwitchUserId] = useState<string | undefined>();
  const [lastTwitchChannel, setLastTwitchChannel] = useState<string | undefined>();

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/status");
      const data = await response.json();
      if (data.ok) {
        setStatus(data.data.platforms);
        
        // Check if Twitch channel changed
        const twitchStatus = data.data.platforms.find(
          (p: ChatConnectionStatus) => p.platform === "twitch"
        );
        
        if (twitchStatus?.connected && twitchStatus?.channel !== lastTwitchChannel) {
          setLastTwitchChannel(twitchStatus.channel);
          // Look up user ID for the new channel
          lookupTwitchUserId(twitchStatus.channel);
        } else if (!twitchStatus?.connected && lastTwitchChannel) {
          setLastTwitchChannel(undefined);
          setTwitchUserId(undefined);
        }
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, [lastTwitchChannel]);

  const lookupTwitchUserId = async (channel: string) => {
    try {
      const response = await fetch(`/api/twitch/user?username=${encodeURIComponent(channel)}`);
      const data = await response.json();
      if (data.ok && data.data?.id) {
        setTwitchUserId(data.data.id);
      }
    } catch {
      // Ignore errors
    }
  };

  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  const getTwitchChannel = useCallback(() => {
    const twitch = status.find((s) => s.platform === "twitch");
    return twitch?.connected ? twitch.channel : undefined;
  }, [status]);

  const getTwitchUserId = useCallback(() => twitchUserId, [twitchUserId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <ChatStatusContext.Provider
      value={{ status, isLoading, refresh, getTwitchChannel, getTwitchUserId }}
    >
      {children}
    </ChatStatusContext.Provider>
  );
}

export function useChatStatus() {
  const context = useContext(ChatStatusContext);
  if (!context) {
    // Return safe defaults if not wrapped in provider
    return {
      status: [] as ChatConnectionStatus[],
      isLoading: false,
      refresh: async () => {},
      getTwitchChannel: () => undefined,
      getTwitchUserId: () => undefined,
    };
  }
  return context;
}
