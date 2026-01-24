import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
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

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ ok: false, error: "Missing Twitch credentials" });
  }

  const response = NextResponse.redirect(`${url.origin}/dashboard`);
  const cookieStore = await cookies();
  const storedState = cookieStore.get("twitch_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.json({ ok: false, error: "Invalid OAuth state" });
  }

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: `${url.origin}/api/twitch/callback`,
  });

  const tokenResponse = await fetch(
    `https://id.twitch.tv/oauth2/token?${tokenParams.toString()}`,
    { method: "POST" }
  );

  if (!tokenResponse.ok) {
    return NextResponse.json({ ok: false, error: "Failed to exchange code" });
  }

  const tokenPayload = (await tokenResponse.json()) as TokenResponse;
  const expiresAt = Date.now() + tokenPayload.expires_in * 1000;

  response.cookies.set("twitch_access_token", tokenPayload.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: tokenPayload.expires_in,
  });

  response.cookies.set("twitch_refresh_token", tokenPayload.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("twitch_token_expires", expiresAt.toString(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("twitch_oauth_state", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  const validateResponse = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `OAuth ${tokenPayload.access_token}`,
    },
  });

  if (validateResponse.ok) {
    const validatePayload = await validateResponse.json();
    response.cookies.set("twitch_user_id", validatePayload.user_id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("twitch_user_login", validatePayload.login, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
