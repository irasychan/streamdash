// Bridges (classes)
export { connectionManager } from "./ConnectionManager";
export { TwitchIRC } from "./bridges/TwitchIRC";
export { YouTubePoller } from "./bridges/YouTubePoller";
export type { YouTubeTokenState, YouTubeTokenUpdate } from "./bridges/YouTubePoller";
export { DiscordBridge } from "./bridges/DiscordBridge";

// Utils (functions)
export {
  parseMessageSegments,
  parseThirdPartyEmotes,
  renderMessageWithEmotes,
} from "./utils/emoteRenderer";
export {
  loadYouTubeToken,
  saveYouTubeToken,
  type StoredYouTubeToken,
} from "./utils/youtubeTokenStore";
