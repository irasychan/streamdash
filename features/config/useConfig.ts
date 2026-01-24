"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { StreamDashConfig, PartialConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";

const STORAGE_KEY = "streamdash-config";

type ConfigState = {
  config: StreamDashConfig;
  loading: boolean;
  error: string | null;
};

type ConfigStore = ConfigState & {
  listeners: Set<() => void>;
};

// Global store for cross-component sync
const store: ConfigStore = {
  config: DEFAULT_CONFIG,
  loading: true,
  error: null,
  listeners: new Set(),
};

// Cached snapshot to avoid infinite loops with useSyncExternalStore
let cachedSnapshot: ConfigState = {
  config: store.config,
  loading: store.loading,
  error: store.error,
};

// Static server snapshot (never changes)
const serverSnapshot: ConfigState = {
  config: DEFAULT_CONFIG,
  loading: true,
  error: null,
};

function emitChange() {
  // Update cached snapshot when store changes
  cachedSnapshot = {
    config: store.config,
    loading: store.loading,
    error: store.error,
  };
  for (const listener of store.listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

function getSnapshot(): ConfigState {
  return cachedSnapshot;
}

function getServerSnapshot(): ConfigState {
  return serverSnapshot;
}

// Try to load from localStorage on client init
if (typeof window !== "undefined") {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      store.config = { ...DEFAULT_CONFIG, ...JSON.parse(cached) };
      // Update cached snapshot
      cachedSnapshot = {
        config: store.config,
        loading: store.loading,
        error: store.error,
      };
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Fetch config from server and update store
 */
async function fetchConfig(): Promise<StreamDashConfig> {
  store.loading = true;
  store.error = null;
  emitChange();

  try {
    const response = await fetch("/api/config");
    const data = await response.json();

    if (data.ok) {
      store.config = data.data;
      store.loading = false;
      store.error = null;

      // Cache in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        } catch {
          // Ignore localStorage errors
        }
      }

      emitChange();
      return data.data;
    } else {
      throw new Error(data.error || "Failed to load config");
    }
  } catch (error) {
    store.loading = false;
    store.error = error instanceof Error ? error.message : "Failed to load config";
    emitChange();
    throw error;
  }
}

/**
 * Save partial config to server and update store
 */
async function updateConfig(update: PartialConfig): Promise<StreamDashConfig> {
  try {
    const response = await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    const data = await response.json();

    if (data.ok) {
      store.config = data.data;
      store.error = null;

      // Cache in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        } catch {
          // Ignore localStorage errors
        }
      }

      emitChange();
      return data.data;
    } else {
      throw new Error(data.error || "Failed to save config");
    }
  } catch (error) {
    store.error = error instanceof Error ? error.message : "Failed to save config";
    emitChange();
    throw error;
  }
}

/**
 * Reset config to defaults
 */
async function resetConfig(): Promise<StreamDashConfig> {
  try {
    const response = await fetch("/api/config", { method: "DELETE" });
    const data = await response.json();

    if (data.ok) {
      store.config = data.data;
      store.error = null;

      // Clear localStorage cache
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore localStorage errors
        }
      }

      emitChange();
      return data.data;
    } else {
      throw new Error(data.error || "Failed to reset config");
    }
  } catch (error) {
    store.error = error instanceof Error ? error.message : "Failed to reset config";
    emitChange();
    throw error;
  }
}

// Track if initial fetch has been done
let initialFetchDone = false;

/**
 * Hook to access and update persistent configuration.
 * Config is synced across components via external store.
 */
export function useConfig() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [saving, setSaving] = useState(false);

  // Initial fetch from server
  useEffect(() => {
    if (!initialFetchDone) {
      initialFetchDone = true;
      fetchConfig().catch(() => {
        // Error already stored in state
      });
    }
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          store.config = JSON.parse(event.newValue);
          emitChange();
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const update = useCallback(async (partial: PartialConfig) => {
    setSaving(true);
    try {
      return await updateConfig(partial);
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(async () => {
    setSaving(true);
    try {
      return await resetConfig();
    } finally {
      setSaving(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    return await fetchConfig();
  }, []);

  return {
    config: state.config,
    loading: state.loading,
    saving,
    error: state.error,
    update,
    reset,
    refresh,
  };
}
