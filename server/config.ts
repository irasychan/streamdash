import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StreamDashConfig, PartialConfig } from "@/features/config/types";
import { DEFAULT_CONFIG } from "@/features/config/types";

const CONFIG_PATH = path.join(process.cwd(), ".data", "user-config.json");

/**
 * Deep merge config objects, preserving nested values
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Load user configuration from disk.
 * Returns DEFAULT_CONFIG merged with saved values.
 */
export async function loadConfig(): Promise<StreamDashConfig> {
  try {
    const payload = await readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(payload) as PartialConfig;
    return deepMerge(DEFAULT_CONFIG, parsed as Partial<StreamDashConfig>);
  } catch {
    // File doesn't exist or is invalid, return defaults
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save configuration to disk.
 * Merges partial updates with existing config.
 */
export async function saveConfig(update: PartialConfig): Promise<StreamDashConfig> {
  const current = await loadConfig();
  const merged = deepMerge(current, update as Partial<StreamDashConfig>);

  const directory = path.dirname(CONFIG_PATH);
  await mkdir(directory, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2));

  return merged;
}

/**
 * Reset configuration to defaults.
 */
export async function resetConfig(): Promise<StreamDashConfig> {
  const directory = path.dirname(CONFIG_PATH);
  await mkdir(directory, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  return { ...DEFAULT_CONFIG };
}
