export type EmoteSource = "bttv" | "ffz" | "7tv";

export type ThirdPartyEmote = {
  id: string;
  name: string;
  url: string;
  source: EmoteSource;
};
