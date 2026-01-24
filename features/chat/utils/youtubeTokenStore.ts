import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredYouTubeToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

const DEFAULT_TOKEN_PATH = path.join(process.cwd(), ".data", "youtube-token.json");

export async function loadYouTubeToken(): Promise<StoredYouTubeToken | null> {
  try {
    const payload = await readFile(DEFAULT_TOKEN_PATH, "utf-8");
    const parsed = JSON.parse(payload) as StoredYouTubeToken;
    if (!parsed.accessToken || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveYouTubeToken(token: StoredYouTubeToken): Promise<void> {
  const directory = path.dirname(DEFAULT_TOKEN_PATH);
  await mkdir(directory, { recursive: true });
  await writeFile(DEFAULT_TOKEN_PATH, JSON.stringify(token, null, 2));
}
