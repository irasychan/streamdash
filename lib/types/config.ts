/**
 * User configuration schema for StreamDash.
 * Persisted to .data/user-config.json
 */

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
};
