import { NextResponse } from "next/server";
import { connectionManager } from "@/services/chat/ConnectionManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HideRequest = {
  messageId: string;
};

/**
 * POST /api/chat/hide - Hide a message locally (won't show in OBS widget)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HideRequest;
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { ok: false, error: "Missing message ID" },
        { status: 400 }
      );
    }

    connectionManager.hideMessage(messageId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Chat Hide] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to hide message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/hide - Unhide a previously hidden message
 */
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as HideRequest;
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { ok: false, error: "Missing message ID" },
        { status: 400 }
      );
    }

    connectionManager.unhideMessage(messageId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Chat Unhide] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to unhide message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/hide - Get list of hidden message IDs
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    data: connectionManager.getHiddenMessageIds(),
  });
}
