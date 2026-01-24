import { NextResponse } from "next/server";
import { connectionManager } from "@/services/chat/ConnectionManager";
import type { ChatPlatform } from "@/features/chat/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DisconnectRequest = {
  platform: ChatPlatform;
};

export async function POST(request: Request) {
  try {
    const body: DisconnectRequest = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { ok: false, error: "Platform is required" },
        { status: 400 }
      );
    }

    switch (platform) {
      case "twitch":
        connectionManager.disconnectTwitch();
        break;
      case "youtube":
        connectionManager.disconnectYouTube();
        break;
      case "discord":
        connectionManager.disconnectDiscord();
        break;
      default:
        return NextResponse.json(
          { ok: false, error: "Invalid platform" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ok: true,
      data: { platform, connected: false },
    });
  } catch (error) {
    console.error("[Chat Disconnect] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to disconnect",
      },
      { status: 500 }
    );
  }
}
