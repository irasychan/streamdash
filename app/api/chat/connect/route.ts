import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  connectionManager,
  loadYouTubeToken,
  saveYouTubeToken,
} from "@/lib/chat";
import type { ChatPlatform } from "@/lib/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ConnectRequest = {
  platform: ChatPlatform;
  channel?: string;
  liveChatId?: string;
  channelId?: string;
};

export async function POST(request: Request) {
  try {
    const body: ConnectRequest = await request.json();
    const { platform, channel, liveChatId, channelId } = body;

    const validPlatforms = ["twitch", "youtube", "discord"] as const;
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { ok: false, error: "Invalid platform" },
        { status: 400 }
      );
    }

    switch (platform) {
      case "twitch": {
        if (!channel) {
          return NextResponse.json(
            { ok: false, error: "Channel is required for Twitch" },
            { status: 400 }
          );
        }

        // Get access token from cookies if available
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("twitch_access_token")?.value;
        const username = cookieStore.get("twitch_user_login")?.value;

        await connectionManager.connectTwitch(channel, accessToken, username);

        return NextResponse.json({
          ok: true,
          data: { platform: "twitch", channel, connected: true },
        });
      }

      case "youtube": {
        if (!liveChatId) {
          return NextResponse.json(
            { ok: false, error: "liveChatId is required for YouTube" },
            { status: 400 }
          );
        }

        const cookieStore = await cookies();
        const storedToken = await loadYouTubeToken();
        const accessToken =
          cookieStore.get("youtube_access_token")?.value ?? storedToken?.accessToken;
        const refreshToken =
          cookieStore.get("youtube_refresh_token")?.value ?? storedToken?.refreshToken;
        const expiresAt = cookieStore.get("youtube_token_expires")?.value;
        const storedExpiresAt = storedToken?.expiresAt
          ? storedToken.expiresAt.toString()
          : undefined;

        const { token, updatedToken } = await getYouTubeAccessToken({
          accessToken,
          refreshToken,
          expiresAt: expiresAt ?? storedExpiresAt,
        });

        if (!token) {
          return NextResponse.json(
            { ok: false, error: "YouTube authentication required" },
            { status: 401 }
          );
        }

        const tokenExpiresAt = expiresAt ? Number(expiresAt) : undefined;
        const resolvedExpiresAt =
          updatedToken?.expiresAt ??
          (Number.isNaN(tokenExpiresAt) ? undefined : tokenExpiresAt);
        await connectionManager.connectYouTube(liveChatId, {
          accessToken: token,
          refreshToken: updatedToken?.refreshToken ?? refreshToken,
          expiresAt: resolvedExpiresAt,
        });

        if (resolvedExpiresAt) {
          await saveYouTubeToken({
            accessToken: token,
            refreshToken: updatedToken?.refreshToken ?? refreshToken ?? undefined,
            expiresAt: resolvedExpiresAt,
          });
        }

        const response = NextResponse.json({
          ok: true,
          data: { platform: "youtube", liveChatId, connected: true },
        });

        if (updatedToken) {
          response.cookies.set("youtube_access_token", updatedToken.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: updatedToken.expiresIn,
          });
          response.cookies.set("youtube_token_expires", updatedToken.expiresAt.toString(), {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
          if (updatedToken.refreshToken) {
            response.cookies.set("youtube_refresh_token", updatedToken.refreshToken, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });
          }
        }

        return response;
      }

      case "discord": {
        if (!channelId) {
          return NextResponse.json(
            { ok: false, error: "channelId is required for Discord" },
            { status: 400 }
          );
        }

        if (!process.env.DISCORD_BOT_TOKEN) {
          return NextResponse.json(
            { ok: false, error: "Discord bot not configured" },
            { status: 500 }
          );
        }

        await connectionManager.connectDiscord(channelId);

        return NextResponse.json({
          ok: true,
          data: { platform: "discord", channelId, connected: true },
        });
      }

      default: {
        // TypeScript exhaustiveness check - should never reach here
        const _exhaustive: never = platform;
        return NextResponse.json(
          { ok: false, error: "Invalid platform" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("[Chat Connect] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to connect" },
      { status: 500 }
    );
  }
}

type YouTubeTokenState = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
};

type YouTubeTokenUpdate = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
};

async function getYouTubeAccessToken(state: YouTubeTokenState) {
  if (!state.accessToken) {
    return { token: null, updatedToken: null };
  }

  if (!state.expiresAt) {
    return { token: state.accessToken, updatedToken: null };
  }

  const expiresAt = Number(state.expiresAt);
  if (Number.isNaN(expiresAt) || Date.now() < expiresAt - 60_000) {
    return { token: state.accessToken, updatedToken: null };
  }

  if (!state.refreshToken) {
    return { token: null, updatedToken: null };
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { token: null, updatedToken: null };
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: state.refreshToken,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    return { token: null, updatedToken: null };
  }

  const payload = await response.json();
  const updatedToken: YouTubeTokenUpdate = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };

  return { token: updatedToken.accessToken, updatedToken };
}
