import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectionManager } from "@/services/chat/ConnectionManager";
import type { ChatPlatform } from "@/features/chat/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ConnectRequest = {
  platform: ChatPlatform;
  channel?: string;
  videoId?: string; // For YouTube - accepts video ID or URL
  channelId?: string; // For Discord
};

export async function POST(request: Request) {
  try {
    const body: ConnectRequest = await request.json();
    const { platform, channel, videoId, channelId } = body;

    const validPlatforms = ["twitch", "youtube", "discord"] as const;
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { ok: false, error: "Invalid platform" },
        { status: 400 }
      );
    }

    switch (platform) {
      case "twitch": {
        if (!channel) {
          return NextResponse.json(
            { ok: false, error: "Channel is required for Twitch" },
            { status: 400 }
          );
        }

        // Get access token from cookies if available
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("twitch_access_token")?.value;
        const username = cookieStore.get("twitch_user_login")?.value;

        await connectionManager.connectTwitch(channel, accessToken, username);

        return NextResponse.json({
          ok: true,
          data: { platform: "twitch", channel, connected: true },
        });
      }

      case "youtube": {
        if (!videoId) {
          return NextResponse.json(
            { ok: false, error: "videoId is required for YouTube" },
            { status: 400 }
          );
        }

        // masterchat doesn't require OAuth - it uses YouTube's internal protocol
        await connectionManager.connectYouTube(videoId);

        const metadata = connectionManager.getYouTubeMetadata();

        return NextResponse.json({
          ok: true,
          data: {
            platform: "youtube",
            videoId,
            connected: true,
            title: metadata?.title,
            channelName: metadata?.channelName,
          },
        });
      }

      case "discord": {
        if (!channelId) {
          return NextResponse.json(
            { ok: false, error: "channelId is required for Discord" },
            { status: 400 }
          );
        }

        if (!process.env.DISCORD_BOT_TOKEN) {
          return NextResponse.json(
            { ok: false, error: "Discord bot not configured" },
            { status: 500 }
          );
        }

        await connectionManager.connectDiscord(channelId);

        return NextResponse.json({
          ok: true,
          data: { platform: "discord", channelId, connected: true },
        });
      }

      default: {
        // TypeScript exhaustiveness check - should never reach here
        const _exhaustive: never = platform;
        return NextResponse.json(
          { ok: false, error: "Invalid platform" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("[Chat Connect] Error:", error);

    // Check if it's a YouTube-specific error
    const youtubeError = connectionManager.getYouTubeError();
    if (youtubeError) {
      return NextResponse.json(
        { ok: false, error: youtubeError.message, code: youtubeError.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to connect" },
      { status: 500 }
    );
  }
}
