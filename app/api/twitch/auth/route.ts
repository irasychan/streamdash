import { NextResponse } from "next/server";

const scopes = ["moderator:read:followers"].join(" ");

export async function GET(request: Request) {
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ ok: false, error: "Missing Twitch client id" });
  }

  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/twitch/callback`;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
  });

  const response = NextResponse.redirect(
    `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
  );
  response.cookies.set("twitch_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
