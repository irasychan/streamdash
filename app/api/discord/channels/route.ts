import { NextResponse } from "next/server";
import { CHANNEL_TYPES, type Channel } from "@/lib/discord/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const guildId = url.searchParams.get("guildId");

  if (!guildId) {
    return NextResponse.json({
      ok: false,
      error: "Missing guildId parameter",
    });
  }

  // Bot token is required to fetch channels (user OAuth doesn't have guild channel permissions)
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({
      ok: false,
      error: "DISCORD_BOT_TOKEN not configured",
    });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json({
          ok: false,
          error: "Bot does not have access to this server. Make sure the bot is invited.",
        });
      }
      return NextResponse.json({
        ok: false,
        error: `Discord API error: ${response.status}`,
      });
    }

    const channels = (await response.json()) as Channel[];

    // Filter to text-based channels and sort by position
    const textChannels = channels
      .filter(
        (c) =>
          c.type === CHANNEL_TYPES.GUILD_TEXT ||
          c.type === CHANNEL_TYPES.GUILD_ANNOUNCEMENT
      )
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    // Get categories for organizing
    const categories = channels
      .filter((c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY)
      .reduce((acc, c) => {
        acc[c.id] = c.name;
        return acc;
      }, {} as Record<string, string>);

    return NextResponse.json({
      ok: true,
      data: textChannels.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.parent_id ? categories[c.parent_id] ?? null : null,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch channels",
    });
  }
}
