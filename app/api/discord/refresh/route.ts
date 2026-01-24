import { NextResponse } from "next/server";
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

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("discord_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({
      ok: false,
      error: "No refresh token available",
    });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      ok: false,
      error: "Missing Discord credentials",
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json({
        ok: false,
        error: "Failed to refresh token",
        details: errorText,
      });
    }

    const tokenPayload = (await tokenResponse.json()) as TokenResponse;
    const expiresAt = Date.now() + tokenPayload.expires_in * 1000;

    const response = NextResponse.json({ ok: true });

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

    return response;
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Token refresh request failed",
    });
  }
}
