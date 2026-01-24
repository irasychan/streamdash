"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/state/appStore";
import type { EmoteSource, ThirdPartyEmote } from "../types/emotes";

export type { EmoteSource, ThirdPartyEmote };

type EmoteHookResult = {
  emotes: Map<string, ThirdPartyEmote>;
  isLoading: boolean;
  loadEmotes: (twitchUserId: string) => Promise<void>;
  getEmote: (name: string) => ThirdPartyEmote | undefined;
};

export function useEmotes(): EmoteHookResult {
  const emotesByName = useAppStore((state) => state.emotesByName);
  const isLoading = useAppStore((state) => state.emotesLoading);
  const loadEmotes = useAppStore((state) => state.loadEmotes);
  const getEmote = useAppStore((state) => state.getEmote);

  const emotes = useMemo(
    () => new Map(Object.entries(emotesByName)),
    [emotesByName]
  );

  return { emotes, isLoading, loadEmotes, getEmote };
}

/**
 * Hook to auto-load emotes when Twitch channel changes
 */
export function useAutoLoadEmotes(twitchUserId: string | undefined) {
  const loadEmotes = useAppStore((state) => state.loadEmotes);

  useEffect(() => {
    if (twitchUserId) {
      loadEmotes(twitchUserId);
    }
  }, [twitchUserId, loadEmotes]);
}
