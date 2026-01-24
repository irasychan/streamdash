import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("twitch_access_token")?.value;
  const userLogin = cookieStore.get("twitch_user_login")?.value;

  return NextResponse.json({
    ok: true,
    connected: Boolean(accessToken),
    user: userLogin ?? null,
  });
}
