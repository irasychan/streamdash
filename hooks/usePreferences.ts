"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { 
  UserPreferences, 
  PartialPreferences, 
  ThemePreset,
  ThemeColors,
} from "@/lib/types/preferences";
import { 
  DEFAULT_PREFERENCES, 
  THEME_PRESETS,
} from "@/lib/types/preferences";

const STORAGE_KEY = "streamdash-preferences";

type PreferencesState = {
  preferences: UserPreferences;
  loading: boolean;
};

type PreferencesStore = PreferencesState & {
  listeners: Set<() => void>;
};

// Global store for cross-component sync
const store: PreferencesStore = {
  preferences: DEFAULT_PREFERENCES,
  loading: true,
  listeners: new Set(),
};

// Cached snapshot to avoid infinite loops with useSyncExternalStore
let cachedSnapshot: PreferencesState = {
  preferences: store.preferences,
  loading: store.loading,
};

// Static server snapshot (never changes)
const serverSnapshot: PreferencesState = {
  preferences: DEFAULT_PREFERENCES,
  loading: true,
};

function emitChange() {
  cachedSnapshot = {
    preferences: store.preferences,
    loading: store.loading,
  };
  for (const listener of store.listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

function getSnapshot(): PreferencesState {
  return cachedSnapshot;
}

function getServerSnapshot(): PreferencesState {
  return serverSnapshot;
}

/**
 * Deep merge preferences with defaults
 */
function mergeWithDefaults(partial: Partial<UserPreferences>): UserPreferences {
  return {
    chat: { ...DEFAULT_PREFERENCES.chat, ...partial.chat },
    theme: { ...DEFAULT_PREFERENCES.theme, ...partial.theme },
    version: partial.version ?? DEFAULT_PREFERENCES.version,
  };
}

/**
 * Load preferences from localStorage
 */
function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Merge with defaults to handle missing fields from older versions
      return mergeWithDefaults(parsed);
    }
  } catch {
    // Ignore localStorage errors
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save preferences to localStorage
 */
function savePreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
}

/**
 * Apply theme CSS variables to document root
 */
function applyTheme(preset: ThemePreset, opacity: number): void {
  if (typeof document === "undefined") return;

  const theme = THEME_PRESETS[preset];
  if (!theme) return;

  const root = document.documentElement;
  const { colors } = theme;

  // Apply shadcn CSS variables
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-foreground", colors.cardForeground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--border", colors.border);
  
  // Apply neon colors
  root.style.setProperty("--neon-pink", colors.neonPink);
  root.style.setProperty("--neon-cyan", colors.neonCyan);
  root.style.setProperty("--neon-violet", colors.neonViolet);
  root.style.setProperty("--neon-gold", colors.neonGold);
  root.style.setProperty("--neon-green", colors.neonGreen);

  // Apply background opacity for OBS overlays
  root.style.setProperty("--bg-opacity", `${opacity / 100}`);
}

// Initialize store from localStorage on client (no DOM mutation here)
let storeInitialized = false;

function initializeStore() {
  if (storeInitialized || typeof window === "undefined") return;
  storeInitialized = true;

  store.preferences = loadPreferences();
  store.loading = false;
  
  // Update cached snapshot (no theme application yet - that happens in useEffect)
  cachedSnapshot = {
    preferences: store.preferences,
    loading: store.loading,
  };
}

// Load preferences at module init (client-side only, no DOM changes)
if (typeof window !== "undefined") {
  initializeStore();
}

/**
 * Hook to access and update user preferences.
 * Preferences are stored in localStorage and synced across components.
 */
export function usePreferences() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Initialize store and apply theme after hydration (avoids SSR mismatch)
  useEffect(() => {
    initializeStore();
    // Apply theme only after hydration is complete
    applyTheme(store.preferences.theme.preset, store.preferences.theme.backgroundOpacity);
    emitChange();
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          store.preferences = mergeWithDefaults(JSON.parse(event.newValue));
          applyTheme(
            store.preferences.theme.preset, 
            store.preferences.theme.backgroundOpacity
          );
          emitChange();
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const update = useCallback((partial: PartialPreferences) => {
    store.preferences = {
      ...store.preferences,
      chat: { ...store.preferences.chat, ...partial.chat },
      theme: { ...store.preferences.theme, ...partial.theme },
    };
    
    savePreferences(store.preferences);
    
    // Apply theme if it changed
    if (partial.theme?.preset !== undefined || partial.theme?.backgroundOpacity !== undefined) {
      applyTheme(
        store.preferences.theme.preset, 
        store.preferences.theme.backgroundOpacity
      );
    }
    
    emitChange();
  }, []);

  const reset = useCallback(() => {
    store.preferences = DEFAULT_PREFERENCES;
    savePreferences(store.preferences);
    applyTheme(
      store.preferences.theme.preset, 
      store.preferences.theme.backgroundOpacity
    );
    emitChange();
  }, []);

  const setTheme = useCallback((preset: ThemePreset) => {
    update({ theme: { preset } });
  }, [update]);

  return {
    preferences: state.preferences,
    loading: state.loading,
    update,
    reset,
    setTheme,
    /** Get colors for current theme */
    themeColors: THEME_PRESETS[state.preferences.theme.preset]?.colors as ThemeColors,
    /** All available theme presets */
    themePresets: THEME_PRESETS,
  };
}
