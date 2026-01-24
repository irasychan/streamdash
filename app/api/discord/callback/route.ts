import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type UserResponse = {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator: string;
  avatar?: string | null;
};

const tokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const returnedError = url.searchParams.get("error");

  if (returnedError) {
    return NextResponse.json({ ok: false, error: returnedError });
  }

  if (!code || !state) {
    return NextResponse.json({ ok: false, error: "Missing authorization code" });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ ok: false, error: "Missing Discord credentials" });
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("discord_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.json({ ok: false, error: "Invalid OAuth state" });
  }

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: `${url.origin}/api/discord/callback`,
  });

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ ok: false, error: "Failed to exchange code" });
  }

  const tokenPayload = (await tokenResponse.json()) as TokenResponse;
  const expiresAt = Date.now() + tokenPayload.expires_in * 1000;
  const response = NextResponse.redirect(`${url.origin}/dashboard`);

  response.cookies.set("discord_access_token", tokenPayload.access_token, {
    ...tokenCookieOptions,
    maxAge: tokenPayload.expires_in,
  });

  if (tokenPayload.refresh_token) {
    response.cookies.set("discord_refresh_token", tokenPayload.refresh_token, {
      ...tokenCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  response.cookies.set("discord_token_expires", expiresAt.toString(), {
    ...tokenCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("discord_oauth_state", "", {
    ...tokenCookieOptions,
    maxAge: 0,
  });

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  });

  if (userResponse.ok) {
    const userPayload = (await userResponse.json()) as UserResponse;
    const username = userPayload.global_name || userPayload.username;

    response.cookies.set("discord_user_id", userPayload.id, {
      ...tokenCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("discord_user_name", username, {
      ...tokenCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
