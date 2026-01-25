import { NextResponse } from "next/server";
import { connectionManager } from "@/services/chat/ConnectionManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const status = connectionManager.getStatus();
  const clientCount = connectionManager.getClientCount();
  const youtubeMetadata = connectionManager.getYouTubeMetadata();
  const youtubeError = connectionManager.getYouTubeError();

  return NextResponse.json({
    ok: true,
    data: {
      platforms: status,
      connectedClients: clientCount,
      youtube: youtubeMetadata
        ? {
            title: youtubeMetadata.title,
            channelName: youtubeMetadata.channelName,
          }
        : null,
      youtubeError: youtubeError
        ? {
            code: youtubeError.code,
            message: youtubeError.message,
          }
        : null,
    },
  });
}
