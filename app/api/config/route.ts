import { NextResponse } from "next/server";
import { loadConfig, saveConfig, resetConfig } from "@/server/config";
import type { PartialConfig } from "@/features/config/types";

/**
 * GET /api/config - Load current configuration
 */
export async function GET() {
  try {
    const config = await loadConfig();
    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    console.error("[Config] GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load config" }, { status: 500 });
  }
}

/**
 * PATCH /api/config - Update configuration (partial merge)
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as PartialConfig;
    const config = await saveConfig(body);
    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    console.error("[Config] PATCH error:", error);
    return NextResponse.json({ ok: false, error: "Failed to save config" }, { status: 500 });
  }
}

/**
 * DELETE /api/config - Reset configuration to defaults
 */
export async function DELETE() {
  try {
    const config = await resetConfig();
    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    console.error("[Config] DELETE error:", error);
    return NextResponse.json({ ok: false, error: "Failed to reset config" }, { status: 500 });
  }
}
