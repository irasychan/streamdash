import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

const tokenCookieOptions = {
  httpOnly: true,
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

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ ok: false, error: "Missing YouTube credentials" });
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("youtube_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.json({ ok: false, error: "Invalid OAuth state" });
  }

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: `${url.origin}/api/youtube/callback`,
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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

  response.cookies.set("youtube_access_token", tokenPayload.access_token, {
    ...tokenCookieOptions,
    maxAge: tokenPayload.expires_in,
  });

  if (tokenPayload.refresh_token) {
    response.cookies.set("youtube_refresh_token", tokenPayload.refresh_token, {
      ...tokenCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  response.cookies.set("youtube_token_expires", expiresAt.toString(), {
    ...tokenCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("youtube_oauth_state", "", {
    ...tokenCookieOptions,
    maxAge: 0,
  });

  return response;
}
