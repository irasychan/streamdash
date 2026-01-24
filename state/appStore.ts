"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatConnectionStatus } from "@/features/chat/types/chat";
import type { ThirdPartyEmote } from "@/features/emotes/types/emotes";
import { fetchThirdPartyEmotes } from "@/services/emotes/thirdPartyEmotes";

const CHAT_POLL_INTERVAL = 10000;

let chatPoller: ReturnType<typeof setInterval> | null = null;

type AppStore = {
  dashboardStatus: string;
  isLive: boolean;
  setDashboardStatus: (status: string) => void;
  setIsLive: (isLive: boolean) => void;

  chatStatus: ChatConnectionStatus[];
  chatStatusLoading: boolean;
  twitchUserId?: string;
  lastTwitchChannel?: string;
  refreshChatStatus: () => Promise<void>;
  lookupTwitchUserId: (channel: string) => Promise<void>;
  getTwitchChannel: () => string | undefined;
  getTwitchUserId: () => string | undefined;
  startChatStatusPolling: () => void;
  stopChatStatusPolling: () => void;

  emotesByName: Record<string, ThirdPartyEmote>;
  emotesLoading: boolean;
  emoteChannelId: string | null;
  loadEmotes: (twitchUserId: string) => Promise<void>;
  getEmote: (name: string) => ThirdPartyEmote | undefined;
  clearEmotes: () => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      dashboardStatus: "Connecting...",
      isLive: false,
      setDashboardStatus: (status) => set({ dashboardStatus: status }),
      setIsLive: (isLive) => set({ isLive }),

      chatStatus: [],
      chatStatusLoading: true,
      twitchUserId: undefined,
      lastTwitchChannel: undefined,
      refreshChatStatus: async () => {
        try {
          const response = await fetch("/api/chat/status");
          const data = await response.json();
          if (data.ok) {
            const platforms = data.data.platforms as ChatConnectionStatus[];
            set({ chatStatus: platforms });

            const twitchStatus = platforms.find(
              (p: ChatConnectionStatus) => p.platform === "twitch"
            );

            const lastChannel = get().lastTwitchChannel;
            if (twitchStatus?.connected && twitchStatus.channel && twitchStatus.channel !== lastChannel) {
              set({ lastTwitchChannel: twitchStatus.channel });
              await get().lookupTwitchUserId(twitchStatus.channel);
            } else if (!twitchStatus?.connected && lastChannel) {
              set({ lastTwitchChannel: undefined, twitchUserId: undefined });
            }
          }
        } catch {
          // Ignore errors
        } finally {
          set({ chatStatusLoading: false });
        }
      },
      lookupTwitchUserId: async (channel: string) => {
        try {
          const response = await fetch(
            `/api/twitch/user?username=${encodeURIComponent(channel)}`
          );
          const data = await response.json();
          if (data.ok && data.data?.id) {
            set({ twitchUserId: data.data.id });
          }
        } catch {
          // Ignore errors
        }
      },
      getTwitchChannel: () => {
        const twitch = get().chatStatus.find((s) => s.platform === "twitch");
        return twitch?.connected ? twitch.channel : undefined;
      },
      getTwitchUserId: () => get().twitchUserId,
      startChatStatusPolling: () => {
        if (chatPoller) return;
        get().refreshChatStatus();
        chatPoller = setInterval(() => {
          get().refreshChatStatus();
        }, CHAT_POLL_INTERVAL);
      },
      stopChatStatusPolling: () => {
        if (!chatPoller) return;
        clearInterval(chatPoller);
        chatPoller = null;
      },

      emotesByName: {},
      emotesLoading: false,
      emoteChannelId: null,
      loadEmotes: async (twitchUserId: string) => {
        const { emoteChannelId, emotesByName } = get();
        if (emoteChannelId === twitchUserId && Object.keys(emotesByName).length > 0) {
          return;
        }

        set({ emotesLoading: true });

        try {
          const emotes = await fetchThirdPartyEmotes(twitchUserId);
          const nextEmotes: Record<string, ThirdPartyEmote> = {};

          for (const emote of emotes) {
            nextEmotes[emote.name] = emote;
          }

          set({ emotesByName: nextEmotes, emoteChannelId: twitchUserId });
          console.log(
            `[Emotes] Loaded ${Object.keys(nextEmotes).length} third-party emotes for channel ${twitchUserId}`
          );
        } catch (error) {
          console.error("[Emotes] Failed to load emotes:", error);
        } finally {
          set({ emotesLoading: false });
        }
      },
      getEmote: (name: string) => get().emotesByName[name],
      clearEmotes: () => set({ emotesByName: {}, emoteChannelId: null }),
    }),
    {
      name: "streamdash-emotes",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        emotesByName: state.emotesByName,
        emoteChannelId: state.emoteChannelId,
      }),
    }
  )
);
