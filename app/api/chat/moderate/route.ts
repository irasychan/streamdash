import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectionManager } from "@/services/chat/ConnectionManager";
import type { ChatModerationAction, ChatPlatform } from "@/features/chat/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ModerationRequest = {
  platform: ChatPlatform;
  action: ChatModerationAction;
  targetUserId: string;
  durationSeconds?: number;
  reason?: string;
  channel?: string;
};

type TwitchToken = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const tokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ModerationRequest;
    const { platform, action, targetUserId, durationSeconds, reason, channel } = body;

    if (platform !== "twitch") {
      return NextResponse.json(
        { ok: false, error: "Moderation only supported for Twitch right now" },
        { status: 400 }
      );
    }

    if (!targetUserId) {
      return NextResponse.json(
        { ok: false, error: "Missing target user" },
        { status: 400 }
      );
    }

    const allowedActions: ChatModerationAction[] = ["timeout", "ban"];
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { ok: false, error: "Invalid moderation action" },
        { status: 400 }
      );
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId) {
      return NextResponse.json({ ok: false, error: "Missing Twitch client id" }, { status: 500 });
    }

    const cookieStore = await cookies();
    const authToken = await getUserToken(cookieStore, clientId, clientSecret);

    if (!authToken.accessToken) {
      return NextResponse.json(
        { ok: false, error: "Twitch OAuth required" },
        { status: 401 }
      );
    }

    const moderatorId = cookieStore.get("twitch_user_id")?.value;
    if (!moderatorId) {
      return NextResponse.json(
        { ok: false, error: "Missing Twitch moderator id" },
        { status: 400 }
      );
    }

    const connectedChannel = connectionManager
      .getStatus()
      .find((status) => status.platform === "twitch")?.channel;
    const channelLogin = channel ?? connectedChannel ?? cookieStore.get("twitch_user_login")?.value;

    if (!channelLogin) {
      return NextResponse.json(
        { ok: false, error: "Missing Twitch channel" },
        { status: 400 }
      );
    }

    const headers = {
      "Client-Id": clientId,
      Authorization: `Bearer ${authToken.accessToken}`,
    };

    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(channelLogin)}`,
      { headers }
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to resolve channel id" },
        { status: 502 }
      );
    }

    const userPayload = await userResponse.json();
    const broadcasterId = userPayload.data?.[0]?.id as string | undefined;

    if (!broadcasterId) {
      return NextResponse.json(
        { ok: false, error: "Invalid Twitch channel" },
        { status: 400 }
      );
    }

    const duration = action === "timeout" ? Math.floor(durationSeconds ?? 600) : null;
    if (action === "timeout") {
      if (duration === null || !Number.isFinite(duration) || duration < 1 || duration > 1_209_600) {
        return NextResponse.json(
          { ok: false, error: "Timeout duration must be between 1 and 1209600 seconds" },
          { status: 400 }
        );
      }
    }

    const moderationBody = {
      data: {
        user_id: targetUserId,
        ...(duration ? { duration } : {}),
        ...(reason ? { reason } : {}),
      },
    };

    const moderateResponse = await fetch(
      `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${encodeURIComponent(
        broadcasterId
      )}&moderator_id=${encodeURIComponent(moderatorId)}`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moderationBody),
      }
    );

    if (!moderateResponse.ok) {
      const errorPayload = await moderateResponse.json().catch(() => null);
      return NextResponse.json(
        { ok: false, error: errorPayload?.message ?? "Moderation request failed" },
        { status: moderateResponse.status }
      );
    }

    const response = NextResponse.json({ ok: true });

    if (authToken.updatedToken) {
      const accessMaxAge = Math.max(
        0,
        Math.round((authToken.updatedToken.expiresAt - Date.now()) / 1000)
      );
      response.cookies.set("twitch_access_token", authToken.updatedToken.accessToken, {
        ...tokenCookieOptions,
        maxAge: accessMaxAge,
      });
      response.cookies.set("twitch_refresh_token", authToken.updatedToken.refreshToken, {
        ...tokenCookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
      response.cookies.set("twitch_token_expires", authToken.updatedToken.expiresAt.toString(), {
        ...tokenCookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error("[Chat Moderation] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Moderation request failed" },
      { status: 500 }
    );
  }
}

async function refreshUserToken(
  refreshToken: string,
  clientId: string,
  clientSecret?: string
): Promise<TwitchToken | null> {
  if (!clientSecret) {
    return null;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };
}

async function getUserToken(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  clientId: string,
  clientSecret?: string
) {
  const accessToken = cookieStore.get("twitch_access_token")?.value;
  const refreshToken = cookieStore.get("twitch_refresh_token")?.value;
  const expiresAt = cookieStore.get("twitch_token_expires")?.value;

  if (!accessToken || !refreshToken || !expiresAt) {
    return { accessToken: null, updatedToken: null };
  }

  const expiry = Number(expiresAt);
  if (Number.isNaN(expiry) || Date.now() < expiry - 60_000) {
    return { accessToken, updatedToken: null };
  }

  const refreshed = await refreshUserToken(refreshToken, clientId, clientSecret);
  if (!refreshed) {
    return { accessToken, updatedToken: null };
  }

  return { accessToken: refreshed.accessToken, updatedToken: refreshed };
}
