import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing YouTube API key" });
  }

  if (!videoId) {
    return NextResponse.json({ ok: false, error: "Missing videoId" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${encodeURIComponent(
        videoId
      )}&key=${apiKey}`,
      { next: { revalidate: 30 } } as RequestInit
    );

    const payload = await response.json();
    const liveChatId = payload.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

    if (!liveChatId) {
      return NextResponse.json({
        ok: false,
        error: "No active live chat found",
      });
    }

    return NextResponse.json({ ok: true, data: { liveChatId } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "YouTube request failed" });
  }
}
