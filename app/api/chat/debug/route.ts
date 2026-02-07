import { NextResponse } from "next/server";
import { connectionManager } from "@/services/chat/ConnectionManager";
import { getUsernameColor } from "@/lib/chat/usernameColor";
import type { ChatPlatform, ChatMessage } from "@/features/chat/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PLATFORM_USERNAMES: Record<ChatPlatform, { name: string; displayName: string }[]> = {
  twitch: [
    { name: "nightbot", displayName: "Nightbot" },
    { name: "streamfan42", displayName: "StreamFan42" },
    { name: "pogchamp_lover", displayName: "PogChamp_Lover" },
  ],
  youtube: [
    { name: "cozy viewer", displayName: "Cozy Viewer" },
    { name: "yt_enthusiast", displayName: "YT_Enthusiast" },
    { name: "live chat pro", displayName: "Live Chat Pro" },
  ],
  discord: [
    { name: "moderator_mike", displayName: "Moderator Mike" },
    { name: "server_regular", displayName: "server_regular" },
    { name: "newbie_2026", displayName: "Newbie 2026" },
  ],
};

const VALID_PLATFORMS: ChatPlatform[] = ["twitch", "youtube", "discord"];

type DebugRequest = {
  platform: ChatPlatform;
  content: string;
};

/**
 * DELETE /api/chat/debug - Clear all debug messages from buffer and connected clients
 */
export async function DELETE() {
  try {
    connectionManager.clearDebugMessages();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Chat Debug] Flush error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to flush debug messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/debug - Inject a fake chat message for testing
 * Broadcasts through SSE so it appears in dashboard AND OBS widgets.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DebugRequest;
    const { platform, content } = body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { ok: false, error: "Invalid platform. Must be twitch, youtube, or discord." },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing or empty message content." },
        { status: 400 }
      );
    }

    const users = PLATFORM_USERNAMES[platform];
    const user = users[Math.floor(Math.random() * users.length)];

    const message: ChatMessage = {
      id: `${platform}-debug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      platform,
      timestamp: Date.now(),
      author: {
        id: `debug-${user.name}`,
        name: user.name,
        displayName: user.displayName,
        color: getUsernameColor(user.name),
      },
      content: content.trim(),
    };

    connectionManager.broadcast(message);

    return NextResponse.json({ ok: true, data: { id: message.id } });
  } catch (error) {
    console.error("[Chat Debug] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send debug message" },
      { status: 500 }
    );
  }
}
