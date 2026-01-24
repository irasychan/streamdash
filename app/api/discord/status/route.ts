import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("discord_access_token")?.value;
  const userId = cookieStore.get("discord_user_id")?.value;
  const userName = cookieStore.get("discord_user_name")?.value;
  const tokenExpires = cookieStore.get("discord_token_expires")?.value;

  const isExpired = tokenExpires ? Date.now() > Number(tokenExpires) : true;
  const connected = Boolean(accessToken) && !isExpired;

  return NextResponse.json({
    ok: true,
    connected,
    expired: isExpired && Boolean(accessToken),
    user: userName ?? null,
    userId: userId ?? null,
  });
}
