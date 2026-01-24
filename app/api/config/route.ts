import { NextResponse } from "next/server";
import { loadConfig, saveConfig, resetConfig } from "@/lib/config/configStore";
import type { PartialConfig } from "@/lib/types/config";

/**
 * GET /api/config - Load current configuration
 */
export async function GET() {
  try {
    const config = await loadConfig();
    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load config";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
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
    const message = error instanceof Error ? error.message : "Failed to save config";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
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
    const message = error instanceof Error ? error.message : "Failed to reset config";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
