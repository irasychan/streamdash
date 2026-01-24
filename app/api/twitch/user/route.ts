import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Look up Twitch user ID from username
 * Used for loading third-party emotes (BTTV, FFZ, 7TV)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { ok: false, error: "Username is required" },
      { status: 400 }
    );
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { ok: false, error: "Twitch credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // Get app access token
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to get Twitch token" },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Look up user
    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();
    const user = userData.data?.[0];

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: user.id,
        login: user.login,
        displayName: user.display_name,
      },
    });
  } catch (error) {
    console.error("[Twitch User Lookup] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to look up user" },
      { status: 500 }
    );
  }
}
