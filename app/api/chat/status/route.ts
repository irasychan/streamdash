import { NextResponse } from "next/server";
import { connectionManager } from "@/services/chat/ConnectionManager";
import { saveYouTubeToken } from "@/features/chat/utils/youtubeTokenStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const status = connectionManager.getStatus();
  const clientCount = connectionManager.getClientCount();
  const youtubeTokenUpdate = connectionManager.consumeYouTubeTokenUpdate();

  const response = NextResponse.json({
    ok: true,
    data: {
      platforms: status,
      connectedClients: clientCount,
    },
  });

  if (youtubeTokenUpdate) {
    response.cookies.set("youtube_access_token", youtubeTokenUpdate.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: youtubeTokenUpdate.expiresIn,
    });
    response.cookies.set("youtube_token_expires", youtubeTokenUpdate.expiresAt.toString(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    if (youtubeTokenUpdate.refreshToken) {
      response.cookies.set("youtube_refresh_token", youtubeTokenUpdate.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    await saveYouTubeToken({
      accessToken: youtubeTokenUpdate.accessToken,
      refreshToken: youtubeTokenUpdate.refreshToken,
      expiresAt: youtubeTokenUpdate.expiresAt,
    });
  }

  return response;
}
