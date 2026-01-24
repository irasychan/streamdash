import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { Guild } from "@/lib/discord/auth";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("discord_access_token")?.value;
  const tokenExpires = cookieStore.get("discord_token_expires")?.value;

  if (!accessToken) {
    return NextResponse.json({
      ok: false,
      error: "Not authenticated with Discord",
      needsAuth: true,
    });
  }

  // Check if token is expired
  const isExpired = tokenExpires ? Date.now() > Number(tokenExpires) : false;
  if (isExpired) {
    return NextResponse.json({
      ok: false,
      error: "Discord token expired",
      needsRefresh: true,
    });
  }

  try {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({
          ok: false,
          error: "Discord token invalid",
          needsRefresh: true,
        });
      }
      return NextResponse.json({
        ok: false,
        error: `Discord API error: ${response.status}`,
      });
    }

    const guilds = (await response.json()) as Guild[];

    // Sort guilds by name
    guilds.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      ok: true,
      data: guilds.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
          : null,
        owner: g.owner,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch guilds",
    });
  }
}
