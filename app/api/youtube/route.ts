import { NextResponse } from "next/server";
import { demoStats } from "@/lib/demoData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  const handleParam = searchParams.get("handle") ?? searchParams.get("youtubeHandle");
  const handle = handleParam?.replace(/^@/, "");

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing YouTube API key" });
  }

  if (!channelId && !handle) {
    return NextResponse.json({ ok: false, error: "Missing YouTube channel id or handle" });
  }

  try {
    const queryParam = channelId
      ? `id=${encodeURIComponent(channelId)}`
      : `forHandle=${encodeURIComponent(handle ?? "")}`;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&${queryParam}&key=${apiKey}`,
      { next: { revalidate: 30 } }
    );

    const payload = await response.json();
    const stats = payload.items?.[0]?.statistics;

    if (!stats) {
      return NextResponse.json({
        ok: false,
        error: "No YouTube stats found",
        detail: handle ? "Invalid handle" : "Invalid channel id",
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        subscribers: Number(stats.subscriberCount ?? demoStats.youtube.subscribers),
        views: Number(stats.viewCount ?? demoStats.youtube.views),
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "YouTube request failed" });
  }
}
