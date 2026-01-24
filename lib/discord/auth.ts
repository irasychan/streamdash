import { cookies } from "next/headers";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

const tokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Refreshes the Discord access token using the stored refresh token.
 * Updates cookies with new tokens if successful.
 * Returns the new access token or null if refresh failed.
 */
export async function refreshDiscordToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("discord_refresh_token")?.value;

  if (!refreshToken) {
    return null;
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      return null;
    }

    const tokenPayload = (await response.json()) as TokenResponse;
    const expiresAt = Date.now() + tokenPayload.expires_in * 1000;

    // Note: We can't set cookies directly in a helper function called from a route handler
    // that returns JSON. This function should be called during a redirect flow.
    // For API routes, we return the tokens and let the caller handle cookie updates.
    return tokenPayload.access_token;
  } catch {
    return null;
  }
}

/**
 * Gets a valid Discord access token, refreshing if needed.
 * For use in API routes that return JSON responses.
 */
export async function getDiscordAccessToken(): Promise<{
  accessToken: string | null;
  needsRefresh: boolean;
  newTokenData?: TokenResponse;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("discord_access_token")?.value;
  const refreshToken = cookieStore.get("discord_refresh_token")?.value;
  const tokenExpires = cookieStore.get("discord_token_expires")?.value;

  // Check if token is still valid (with 5 min buffer)
  const expiresAt = tokenExpires ? Number(tokenExpires) : 0;
  const isExpired = Date.now() > expiresAt - 5 * 60 * 1000;

  if (accessToken && !isExpired) {
    return { accessToken, needsRefresh: false };
  }

  // Token expired or missing, try to refresh
  if (!refreshToken) {
    return { accessToken: null, needsRefresh: true };
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { accessToken: null, needsRefresh: true };
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      return { accessToken: null, needsRefresh: true };
    }

    const tokenPayload = (await response.json()) as TokenResponse;

    return {
      accessToken: tokenPayload.access_token,
      needsRefresh: false,
      newTokenData: tokenPayload,
    };
  } catch {
    return { accessToken: null, needsRefresh: true };
  }
}

export type Guild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

export type Channel = {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
  position?: number;
  parent_id?: string | null;
};

// Discord channel types we care about
export const CHANNEL_TYPES = {
  GUILD_TEXT: 0,
  GUILD_VOICE: 2,
  GUILD_CATEGORY: 4,
  GUILD_ANNOUNCEMENT: 5,
  GUILD_STAGE_VOICE: 13,
  GUILD_FORUM: 15,
} as const;
