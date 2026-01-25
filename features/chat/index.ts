// Chat feature barrel export

// Types
export * from "./types/chat";

// Services (from top-level services/)
export { connectionManager } from "@/services/chat/ConnectionManager";
export { TwitchIRC } from "@/services/chat/bridges/TwitchIRC";
export { YouTubeMasterchat } from "@/services/chat/bridges/YouTubeMasterchat";
export { DiscordBridge } from "@/services/chat/bridges/DiscordBridge";

// Hooks
export { useChatStatus } from "./hooks/useChatStatus";

// Utils
export { renderMessageWithEmotes, parseMessageSegments, parseThirdPartyEmotes } from "./utils/emoteRenderer";

// UI Components
export { ChatContainer, ChatMessage, ConnectionStatus, PlatformBadge } from "./components";
