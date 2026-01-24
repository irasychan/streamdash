import { NextResponse } from "next/server";

const scopes = ["identify", "guilds"].join(" ");

export async function GET(request: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ ok: false, error: "Missing Discord client id" });
  }

  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/discord/callback`;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
  });

  const response = NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`
  );
  response.cookies.set("discord_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
