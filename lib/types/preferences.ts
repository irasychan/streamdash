/**
 * User preferences schema for StreamDash.
 * Persisted to localStorage (browser-specific, no server sync).
 * 
 * These are visual/UX preferences that may vary per device/browser,
 * as opposed to StreamDashConfig which syncs across sessions.
 */

// --- Chat Display Preferences ---

export type FontSize = "small" | "medium" | "large";
export type MessageDensity = "compact" | "comfortable" | "spacious";
export type TimestampFormat = "hidden" | "relative" | "absolute";
export type UsernameColorMode = "platform" | "theme" | "custom";

export type ChatDisplayPreferences = {
  /** Font size for chat messages */
  fontSize: FontSize;
  /** Spacing between messages */
  messageDensity: MessageDensity;
  /** Font family override (empty = system default) */
  fontFamily: string;
  /** Show/hide message timestamps */
  timestampFormat: TimestampFormat;
  /** How username colors are determined */
  usernameColorMode: UsernameColorMode;
  /** Show subscriber/mod badges */
  showBadges: boolean;
  /** Show user avatars */
  showAvatars: boolean;
};

// --- Theme Preferences ---

export type ThemePreset = 
  | "tokyo-night"   // Current default - dark with neon accents
  | "midnight"      // Deep black, minimal color
  | "cyberpunk"     // High contrast neon
  | "forest"        // Dark green tones
  | "sunset"        // Warm orange/pink
  | "monochrome";   // Grayscale

export type ThemePreferences = {
  /** Active theme preset */
  preset: ThemePreset;
  /** Background opacity (0-100) for OBS overlays */
  backgroundOpacity: number;
};

// --- Root Preferences ---

export type UserPreferences = {
  chat: ChatDisplayPreferences;
  theme: ThemePreferences;
  /** Schema version for migrations */
  version: number;
};

// --- Defaults ---

export const DEFAULT_CHAT_PREFERENCES: ChatDisplayPreferences = {
  fontSize: "medium",
  messageDensity: "comfortable",
  fontFamily: "",
  timestampFormat: "hidden",
  usernameColorMode: "platform",
  showBadges: true,
  showAvatars: true,
};

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  preset: "tokyo-night",
  backgroundOpacity: 100,
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  chat: DEFAULT_CHAT_PREFERENCES,
  theme: DEFAULT_THEME_PREFERENCES,
  version: 1,
};

// --- Theme Preset Definitions ---

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  border: string;
  neonPink: string;
  neonCyan: string;
  neonViolet: string;
  neonGold: string;
  neonGreen: string;
};

export const THEME_PRESETS: Record<ThemePreset, { name: string; description: string; colors: ThemeColors }> = {
  "tokyo-night": {
    name: "Tokyo Night",
    description: "Dark theme with vibrant neon accents",
    colors: {
      background: "225 27% 8%",
      foreground: "223 46% 87%",
      card: "228 25% 11%",
      cardForeground: "223 46% 87%",
      primary: "349 89% 72%",
      secondary: "230 23% 16%",
      muted: "230 23% 16%",
      mutedForeground: "226 18% 60%",
      accent: "199 89% 66%",
      border: "232 20% 18%",
      neonPink: "#f7768e",
      neonCyan: "#7dcfff",
      neonViolet: "#bb9af7",
      neonGold: "#e0af68",
      neonGreen: "#9ece6a",
    },
  },
  "midnight": {
    name: "Midnight",
    description: "Deep black with subtle accents",
    colors: {
      background: "0 0% 4%",
      foreground: "0 0% 90%",
      card: "0 0% 7%",
      cardForeground: "0 0% 90%",
      primary: "210 100% 60%",
      secondary: "0 0% 12%",
      muted: "0 0% 12%",
      mutedForeground: "0 0% 50%",
      accent: "210 100% 60%",
      border: "0 0% 15%",
      neonPink: "#ff6b9d",
      neonCyan: "#6bb3ff",
      neonViolet: "#a78bfa",
      neonGold: "#fbbf24",
      neonGreen: "#4ade80",
    },
  },
  "cyberpunk": {
    name: "Cyberpunk",
    description: "High contrast with electric colors",
    colors: {
      background: "270 50% 5%",
      foreground: "60 100% 95%",
      card: "270 40% 8%",
      cardForeground: "60 100% 95%",
      primary: "320 100% 60%",
      secondary: "270 30% 15%",
      muted: "270 30% 15%",
      mutedForeground: "270 20% 55%",
      accent: "180 100% 50%",
      border: "270 30% 20%",
      neonPink: "#ff00ff",
      neonCyan: "#00ffff",
      neonViolet: "#bf00ff",
      neonGold: "#ffff00",
      neonGreen: "#00ff00",
    },
  },
  "forest": {
    name: "Forest",
    description: "Dark green natural tones",
    colors: {
      background: "150 30% 6%",
      foreground: "120 20% 85%",
      card: "150 25% 10%",
      cardForeground: "120 20% 85%",
      primary: "142 70% 50%",
      secondary: "150 20% 15%",
      muted: "150 20% 15%",
      mutedForeground: "150 15% 50%",
      accent: "142 70% 50%",
      border: "150 20% 18%",
      neonPink: "#f472b6",
      neonCyan: "#34d399",
      neonViolet: "#a78bfa",
      neonGold: "#fcd34d",
      neonGreen: "#4ade80",
    },
  },
  "sunset": {
    name: "Sunset",
    description: "Warm orange and pink tones",
    colors: {
      background: "20 40% 7%",
      foreground: "30 30% 90%",
      card: "20 35% 11%",
      cardForeground: "30 30% 90%",
      primary: "350 90% 65%",
      secondary: "20 30% 16%",
      muted: "20 30% 16%",
      mutedForeground: "20 20% 55%",
      accent: "30 100% 60%",
      border: "20 25% 20%",
      neonPink: "#fb7185",
      neonCyan: "#fdba74",
      neonViolet: "#f472b6",
      neonGold: "#fbbf24",
      neonGreen: "#a3e635",
    },
  },
  "monochrome": {
    name: "Monochrome",
    description: "Clean grayscale aesthetic",
    colors: {
      background: "0 0% 6%",
      foreground: "0 0% 88%",
      card: "0 0% 10%",
      cardForeground: "0 0% 88%",
      primary: "0 0% 80%",
      secondary: "0 0% 14%",
      muted: "0 0% 14%",
      mutedForeground: "0 0% 50%",
      accent: "0 0% 70%",
      border: "0 0% 18%",
      neonPink: "#d4d4d4",
      neonCyan: "#a3a3a3",
      neonViolet: "#c4c4c4",
      neonGold: "#e5e5e5",
      neonGreen: "#b4b4b4",
    },
  },
};

// --- Partial type for updates ---

export type PartialPreferences = {
  chat?: Partial<ChatDisplayPreferences>;
  theme?: Partial<ThemePreferences>;
};
