import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { demoStats } from "@/lib/demoData";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") ?? demoStats.channel;

  const clientId = process.env.TWITCH_CLIENT_ID;
  const token = process.env.TWITCH_APP_ACCESS_TOKEN;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId) {
    return NextResponse.json({ ok: false, error: "Missing Twitch credentials" });
  }

  try {
    const cookieStore = await cookies();
    const authToken = await getUserToken(cookieStore, clientId, clientSecret);
    const appToken = token ?? (await getAppToken(clientId, clientSecret));
    if (!appToken) {
      return NextResponse.json({ ok: false, error: "Missing Twitch credentials" });
    }
    const headers = {
      "Client-Id": clientId,
      Authorization: `Bearer ${authToken.accessToken ?? appToken}`,
    };

    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`,
      {
        headers,
        next: { revalidate: 60 },
      }
    );

    const userPayload = await userResponse.json();
    const user = userPayload.data?.[0];

    const streamQuery = user?.id
      ? `user_id=${encodeURIComponent(user.id)}`
      : `user_login=${encodeURIComponent(channel)}`;

    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?${streamQuery}`,
      {
        headers,
        next: { revalidate: 15 },
      }
    );

    const streamPayload = await streamResponse.json();
    const stream = streamPayload.data?.[0];

    const live = Boolean(stream);
    const viewers = stream?.viewer_count ?? 0;

    let followers = demoStats.followers;
    const broadcasterId = authToken.userId ?? user?.id;

    if (authToken.accessToken && broadcasterId) {
      const followersResponse = await fetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(
          broadcasterId
        )}&moderator_id=${encodeURIComponent(broadcasterId)}`,
        {
          headers: {
            "Client-Id": clientId,
            Authorization: `Bearer ${authToken.accessToken}`,
          },
          next: { revalidate: 120 },
        }
      );

      if (followersResponse.ok) {
        const followersPayload = await followersResponse.json();
        followers = followersPayload.total ?? demoStats.followers;
      }
    }

    const response = NextResponse.json({
      ok: true,
      data: {
        channel: user?.login ?? channel,
        live,
        viewers,
        followers,
        subs: demoStats.subs,
        goal: demoStats.goal,
      },
    });

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
    return NextResponse.json({ ok: false, error: "Twitch request failed" });
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

type AppTokenCache = {
  token: string;
  expiresAt: number;
};

const appTokenCache: { current?: AppTokenCache } = {};

async function getAppToken(clientId: string, clientSecret?: string) {
  if (appTokenCache.current && Date.now() < appTokenCache.current.expiresAt - 60_000) {
    return appTokenCache.current.token;
  }

  if (!clientSecret) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const expiresAt = Date.now() + payload.expires_in * 1000;
  appTokenCache.current = { token: payload.access_token, expiresAt };
  return payload.access_token as string;
}

async function getUserToken(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  clientId: string,
  clientSecret?: string
) {
  const accessToken = cookieStore.get("twitch_access_token")?.value;
  const refreshToken = cookieStore.get("twitch_refresh_token")?.value;
  const expiresAt = cookieStore.get("twitch_token_expires")?.value;
  const userId = cookieStore.get("twitch_user_id")?.value;

  if (!accessToken || !refreshToken || !expiresAt) {
    return { accessToken: null, userId, updatedToken: null };
  }

  const expiry = Number(expiresAt);
  if (Number.isNaN(expiry) || Date.now() < expiry - 60_000) {
    return { accessToken, userId, updatedToken: null };
  }

  const refreshed = await refreshUserToken(refreshToken, clientId, clientSecret);
  if (!refreshed) {
    return { accessToken, userId, updatedToken: null };
  }

  return { accessToken: refreshed.accessToken, userId, updatedToken: refreshed };
}
