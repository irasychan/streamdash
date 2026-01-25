/**
 * Widget URL generator utilities
 * Generates OBS browser source URLs with configured parameters
 */

import type {
  ChatWidgetConfig,
  GoalWidgetConfig,
  StatsWidgetConfig,
  DEFAULT_CHAT_WIDGET_CONFIG,
  DEFAULT_GOAL_WIDGET_CONFIG,
  DEFAULT_STATS_WIDGET_CONFIG,
} from "@/features/config/types";

/**
 * Generate chat widget URL with config parameters
 */
export function generateChatWidgetUrl(
  config: ChatWidgetConfig,
  defaults: typeof DEFAULT_CHAT_WIDGET_CONFIG
): string {
  const params = new URLSearchParams();

  // Only add params that differ from defaults
  if (config.maxMessages !== defaults.maxMessages) {
    params.set("maxMessages", config.maxMessages.toString());
  }

  if (JSON.stringify(config.platforms) !== JSON.stringify(defaults.platforms)) {
    params.set("platforms", config.platforms.join(","));
  }

  if (config.showPlatformBadge !== defaults.showPlatformBadge) {
    params.set("showPlatform", config.showPlatformBadge.toString());
  }

  if (config.transparent) {
    params.set("transparent", "true");
  }

  if (config.twitchChannel) {
    params.set("twitchChannel", config.twitchChannel);
  }

  if (config.youtubeVideoId) {
    params.set("youtubeVideoId", config.youtubeVideoId);
  }

  if (config.discordChannelId) {
    params.set("discordChannelId", config.discordChannelId);
  }

  if (config.fontSize !== defaults.fontSize) {
    params.set("fontSize", config.fontSize);
  }

  if (config.messageDensity !== defaults.messageDensity) {
    params.set("messageDensity", config.messageDensity);
  }

  if (config.showAvatars !== defaults.showAvatars) {
    params.set("showAvatars", config.showAvatars.toString());
  }

  if (config.showBadges !== defaults.showBadges) {
    params.set("showBadges", config.showBadges.toString());
  }

  if (config.animation !== defaults.animation) {
    params.set("animation", config.animation);
  }

  const queryString = params.toString();
  return `/widgets/chat${queryString ? `?${queryString}` : ""}`;
}

/**
 * Generate goal widget URL with config parameters
 */
export function generateGoalWidgetUrl(
  config: GoalWidgetConfig,
  defaults: typeof DEFAULT_GOAL_WIDGET_CONFIG
): string {
  const params = new URLSearchParams();

  if (config.channel) {
    params.set("channel", config.channel);
  }

  if (config.title !== defaults.title) {
    params.set("title", config.title);
  }

  if (config.showPercentage !== defaults.showPercentage) {
    params.set("showPercentage", config.showPercentage.toString());
  }

  if (config.showNumbers !== defaults.showNumbers) {
    params.set("showNumbers", config.showNumbers.toString());
  }

  if (config.barColor) {
    params.set("barColor", config.barColor);
  }

  if (config.transparent) {
    params.set("transparent", "true");
  }

  const queryString = params.toString();
  return `/widgets/goal${queryString ? `?${queryString}` : ""}`;
}

/**
 * Generate stats widget URL with config parameters
 */
export function generateStatsWidgetUrl(
  config: StatsWidgetConfig,
  defaults: typeof DEFAULT_STATS_WIDGET_CONFIG
): string {
  const params = new URLSearchParams();

  if (config.channel) {
    params.set("channel", config.channel);
  }

  if (config.youtubeChannelId) {
    params.set("youtubeChannelId", config.youtubeChannelId);
  }

  if (config.youtubeHandle) {
    params.set("youtubeHandle", config.youtubeHandle);
  }

  if (config.showViewers !== defaults.showViewers) {
    params.set("showViewers", config.showViewers.toString());
  }

  if (config.showSubs !== defaults.showSubs) {
    params.set("showSubs", config.showSubs.toString());
  }

  if (config.showYoutubeSubs !== defaults.showYoutubeSubs) {
    params.set("showYoutubeSubs", config.showYoutubeSubs.toString());
  }

  if (config.transparent) {
    params.set("transparent", "true");
  }

  const queryString = params.toString();
  return `/widgets/stats${queryString ? `?${queryString}` : ""}`;
}
