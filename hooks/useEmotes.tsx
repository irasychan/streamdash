"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type EmoteSource = "bttv" | "ffz" | "7tv";

export type ThirdPartyEmote = {
  id: string;
  name: string;
  url: string;
  source: EmoteSource;
};

type EmoteContextType = {
  emotes: Map<string, ThirdPartyEmote>;
  isLoading: boolean;
  loadEmotes: (twitchUserId: string) => Promise<void>;
  getEmote: (name: string) => ThirdPartyEmote | undefined;
};

const EmoteContext = createContext<EmoteContextType | null>(null);

// BTTV API
const BTTV_GLOBAL_URL = "https://api.betterttv.net/3/cached/emotes/global";
const BTTV_CHANNEL_URL = (id: string) =>
  `https://api.betterttv.net/3/cached/users/twitch/${id}`;

// FFZ API
const FFZ_GLOBAL_URL = "https://api.frankerfacez.com/v1/set/global";
const FFZ_CHANNEL_URL = (id: string) =>
  `https://api.frankerfacez.com/v1/room/id/${id}`;

// 7TV API
const SEVENTV_GLOBAL_URL = "https://7tv.io/v3/emote-sets/global";
const SEVENTV_CHANNEL_URL = (id: string) =>
  `https://7tv.io/v3/users/twitch/${id}`;

async function fetchBTTVGlobal(): Promise<ThirdPartyEmote[]> {
  try {
    const res = await fetch(BTTV_GLOBAL_URL);
    if (!res.ok) return [];

    const data = await res.json();
    return data.map((emote: { id: string; code: string }) => ({
      id: emote.id,
      name: emote.code,
      url: `https://cdn.betterttv.net/emote/${emote.id}/2x`,
      source: "bttv" as EmoteSource,
    }));
  } catch {
    console.error("[EmoteProvider] Failed to fetch BTTV global");
    return [];
  }
}

async function fetchBTTVChannel(
  channelId: string
): Promise<ThirdPartyEmote[]> {
  try {
    const res = await fetch(BTTV_CHANNEL_URL(channelId));
    if (!res.ok) return [];

    const data = await res.json();
    const emotes: ThirdPartyEmote[] = [];

    for (const emote of data.channelEmotes || []) {
      emotes.push({
        id: emote.id,
        name: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/2x`,
        source: "bttv",
      });
    }

    for (const emote of data.sharedEmotes || []) {
      emotes.push({
        id: emote.id,
        name: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/2x`,
        source: "bttv",
      });
    }

    return emotes;
  } catch {
    console.error("[EmoteProvider] Failed to fetch BTTV channel");
    return [];
  }
}

async function fetchFFZGlobal(): Promise<ThirdPartyEmote[]> {
  try {
    const res = await fetch(FFZ_GLOBAL_URL);
    if (!res.ok) return [];

    const data = await res.json();
    const emotes: ThirdPartyEmote[] = [];

    for (const setId of data.default_sets || []) {
      const set = data.sets?.[setId];
      if (!set?.emoticons) continue;

      for (const emote of set.emoticons) {
        const url = emote.urls?.["2"] || emote.urls?.["1"];
        if (!url) continue;

        emotes.push({
          id: String(emote.id),
          name: emote.name,
          url: url.startsWith("//") ? `https:${url}` : url,
          source: "ffz",
        });
      }
    }

    return emotes;
  } catch {
    console.error("[EmoteProvider] Failed to fetch FFZ global");
    return [];
  }
}

async function fetchFFZChannel(channelId: string): Promise<ThirdPartyEmote[]> {
  try {
    const res = await fetch(FFZ_CHANNEL_URL(channelId));
    if (!res.ok) return [];

    const data = await res.json();
    const emotes: ThirdPartyEmote[] = [];

    const setId = data.room?.set;
    const set = data.sets?.[setId];
    if (set?.emoticons) {
      for (const emote of set.emoticons) {
        const url = emote.urls?.["2"] || emote.urls?.["1"];
        if (!url) continue;

        emotes.push({
          id: String(emote.id),
          name: emote.name,
          url: url.startsWith("//") ? `https:${url}` : url,
          source: "ffz",
        });
      }
    }

    return emotes;
  } catch {
    console.error("[EmoteProvider] Failed to fetch FFZ channel");
    return [];
  }
}

async function fetch7TVGlobal(): Promise<ThirdPartyEmote[]> {
  try {
    const res = await fetch(SEVENTV_GLOBAL_URL);
    if (!res.ok) return [];

    const data = await res.json();
    const emotes: ThirdPartyEmote[] = [];

    for (const emote of data.emotes || []) {
      const file =
        emote.data?.host?.files?.find(
          (f: { name: string }) => f.name === "2x.webp"
        ) || emote.data?.host?.files?.[0];
      if (!file || !emote.data?.host?.url) continue;

      emotes.push({
        id: emote.id,
        name: emote.name,
        url: `https:${emote.data.host.url}/${file.name}`,
        source: "7tv",
      });
    }

    return emotes;
  } catch {
    console.error("[EmoteProvider] Failed to fetch 7TV global");
    return [];
  }
}

async function fetch7TVChannel(channelId: string): Promise<ThirdPartyEmote[]> {
  try {
    const res = await fetch(SEVENTV_CHANNEL_URL(channelId));
    if (!res.ok) return [];

    const data = await res.json();
    const emotes: ThirdPartyEmote[] = [];

    const emoteSet = data.emote_set;
    if (emoteSet?.emotes) {
      for (const emote of emoteSet.emotes) {
        const file =
          emote.data?.host?.files?.find(
            (f: { name: string }) => f.name === "2x.webp"
          ) || emote.data?.host?.files?.[0];
        if (!file || !emote.data?.host?.url) continue;

        emotes.push({
          id: emote.id,
          name: emote.name,
          url: `https:${emote.data.host.url}/${file.name}`,
          source: "7tv",
        });
      }
    }

    return emotes;
  } catch {
    console.error("[EmoteProvider] Failed to fetch 7TV channel");
    return [];
  }
}

export function EmoteProvider({ children }: { children: ReactNode }) {
  const [emotes, setEmotes] = useState<Map<string, ThirdPartyEmote>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [loadedChannelId, setLoadedChannelId] = useState<string | null>(null);

  const loadEmotes = useCallback(async (twitchUserId: string) => {
    // Skip if already loaded for this channel
    if (loadedChannelId === twitchUserId) return;

    setIsLoading(true);

    try {
      const results = await Promise.all([
        fetchBTTVGlobal(),
        fetchBTTVChannel(twitchUserId),
        fetchFFZGlobal(),
        fetchFFZChannel(twitchUserId),
        fetch7TVGlobal(),
        fetch7TVChannel(twitchUserId),
      ]);

      const newEmotes = new Map<string, ThirdPartyEmote>();

      // Add all emotes to map (later ones override earlier - channel > global)
      for (const emoteList of results) {
        for (const emote of emoteList) {
          newEmotes.set(emote.name, emote);
        }
      }

      setEmotes(newEmotes);
      setLoadedChannelId(twitchUserId);
      console.log(
        `[EmoteProvider] Loaded ${newEmotes.size} third-party emotes for channel ${twitchUserId}`
      );
    } catch (error) {
      console.error("[EmoteProvider] Failed to load emotes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadedChannelId]);

  const getEmote = useCallback(
    (name: string) => emotes.get(name),
    [emotes]
  );

  return (
    <EmoteContext.Provider value={{ emotes, isLoading, loadEmotes, getEmote }}>
      {children}
    </EmoteContext.Provider>
  );
}

export function useEmotes() {
  const context = useContext(EmoteContext);
  // Return null-safe defaults if not wrapped in provider
  if (!context) {
    return {
      emotes: new Map<string, ThirdPartyEmote>(),
      isLoading: false,
      loadEmotes: async () => {},
      getEmote: () => undefined,
    };
  }
  return context;
}

/**
 * Hook to auto-load emotes when Twitch channel changes
 */
export function useAutoLoadEmotes(twitchUserId: string | undefined) {
  const { loadEmotes } = useEmotes();

  useEffect(() => {
    if (twitchUserId) {
      loadEmotes(twitchUserId);
    }
  }, [twitchUserId, loadEmotes]);
}
