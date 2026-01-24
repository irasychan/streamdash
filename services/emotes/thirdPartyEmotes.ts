import type { EmoteSource, ThirdPartyEmote } from "@/features/emotes/types/emotes";

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
    console.error("[Emotes] Failed to fetch BTTV global");
    return [];
  }
}

async function fetchBTTVChannel(channelId: string): Promise<ThirdPartyEmote[]> {
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
    console.error("[Emotes] Failed to fetch BTTV channel");
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
    console.error("[Emotes] Failed to fetch FFZ global");
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
    console.error("[Emotes] Failed to fetch FFZ channel");
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
    console.error("[Emotes] Failed to fetch 7TV global");
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
    console.error("[Emotes] Failed to fetch 7TV channel");
    return [];
  }
}

export async function fetchThirdPartyEmotes(
  twitchUserId: string
): Promise<ThirdPartyEmote[]> {
  const results = await Promise.all([
    fetchBTTVGlobal(),
    fetchBTTVChannel(twitchUserId),
    fetchFFZGlobal(),
    fetchFFZChannel(twitchUserId),
    fetch7TVGlobal(),
    fetch7TVChannel(twitchUserId),
  ]);

  return results.flat();
}
