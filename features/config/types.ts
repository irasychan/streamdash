/**
 * User configuration schema for StreamDash.
 * Persisted to .data/user-config.json
 */

import type { ChatPlatform } from "@/features/chat/types/chat";

// ============================================================================
// Widget Configurations
// ============================================================================

export type ChatWidgetConfig = {
  /** Maximum messages to display */
  maxMessages: number;
  /** Platforms to show messages from */
  platforms: ChatPlatform[];
  /** Show platform badge on each message */
  showPlatformBadge: boolean;
  /** Transparent background for OBS overlay */
  transparent: boolean;
  /** Auto-connect to Twitch channel */
  twitchChannel: string;
  /** Auto-connect to YouTube live chat */
  liveChatId: string;
  /** Auto-connect to Discord channel */
  discordChannelId: string;
  /** Font size: small, medium, large */
  fontSize: "small" | "medium" | "large";
  /** Show user avatars */
  showAvatars: boolean;
  /** Show badges (mod, sub, etc.) */
  showBadges: boolean;
  /** Message animation style */
  animation: "none" | "fade" | "slide";
};

export type GoalWidgetConfig = {
  /** Twitch channel for follower count */
  channel: string;
  /** Title text above the progress bar */
  title: string;
  /** Show percentage */
  showPercentage: boolean;
  /** Show current/target numbers */
  showNumbers: boolean;
  /** Progress bar color (CSS color) */
  barColor: string;
  /** Transparent background */
  transparent: boolean;
};

export type StatsWidgetConfig = {
  /** Twitch channel name */
  channel: string;
  /** YouTube channel ID or handle */
  youtubeChannelId: string;
  youtubeHandle: string;
  /** Which stats to show */
  showViewers: boolean;
  showSubs: boolean;
  showYoutubeSubs: boolean;
  /** Transparent background */
  transparent: boolean;
};

export type WidgetsConfig = {
  chat: ChatWidgetConfig;
  goal: GoalWidgetConfig;
  stats: StatsWidgetConfig;
};

// ============================================================================
// Platform Configurations
// ============================================================================

export type PlatformConfig = {
  twitch: {
    defaultChannel: string;
  };
  youtube: {
    defaultChannelId: string;
    defaultLiveChatId: string;
  };
  discord: {
    defaultGuildId: string;
    defaultChannelId: string;
  };
};

export type GoalConfig = {
  followerTarget: number;
};

export type UIConfig = {
  chatMaxMessages: number;
  showDemoData: boolean;
};

export type StreamDashConfig = {
  platforms: PlatformConfig;
  goals: GoalConfig;
  ui: UIConfig;
  widgets: WidgetsConfig;
};

export const DEFAULT_CHAT_WIDGET_CONFIG: ChatWidgetConfig = {
  maxMessages: 50,
  platforms: ["twitch", "youtube", "discord"],
  showPlatformBadge: true,
  transparent: false,
  twitchChannel: "",
  liveChatId: "",
  discordChannelId: "",
  fontSize: "medium",
  showAvatars: false,
  showBadges: true,
  animation: "fade",
};

export const DEFAULT_GOAL_WIDGET_CONFIG: GoalWidgetConfig = {
  channel: "",
  title: "Follower sprint",
  showPercentage: true,
  showNumbers: true,
  barColor: "",
  transparent: false,
};

export const DEFAULT_STATS_WIDGET_CONFIG: StatsWidgetConfig = {
  channel: "",
  youtubeChannelId: "",
  youtubeHandle: "",
  showViewers: true,
  showSubs: true,
  showYoutubeSubs: true,
  transparent: false,
};

export const DEFAULT_CONFIG: StreamDashConfig = {
  platforms: {
    twitch: {
      defaultChannel: "",
    },
    youtube: {
      defaultChannelId: "",
      defaultLiveChatId: "",
    },
    discord: {
      defaultGuildId: "",
      defaultChannelId: "",
    },
  },
  goals: {
    followerTarget: 15000,
  },
  ui: {
    chatMaxMessages: 100,
    showDemoData: true,
  },
  widgets: {
    chat: DEFAULT_CHAT_WIDGET_CONFIG,
    goal: DEFAULT_GOAL_WIDGET_CONFIG,
    stats: DEFAULT_STATS_WIDGET_CONFIG,
  },
};

/**
 * Deep partial type for config updates
 */
export type PartialConfig = {
  platforms?: {
    twitch?: Partial<PlatformConfig["twitch"]>;
    youtube?: Partial<PlatformConfig["youtube"]>;
    discord?: Partial<PlatformConfig["discord"]>;
  };
  goals?: Partial<GoalConfig>;
  ui?: Partial<UIConfig>;
  widgets?: {
    chat?: Partial<ChatWidgetConfig>;
    goal?: Partial<GoalWidgetConfig>;
    stats?: Partial<StatsWidgetConfig>;
  };
};
