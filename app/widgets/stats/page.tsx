"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { demoStats } from "@/lib/demoData";

type WidgetStats = typeof demoStats;

function StatsWidgetContent() {
  const [stats, setStats] = useState<WidgetStats>(demoStats);
  const searchParams = useSearchParams();
  const channel = useMemo(
    () => searchParams.get("channel") ?? demoStats.channel,
    [searchParams]
  );
  const youtubeChannelId = useMemo(
    () => searchParams.get("youtubeChannelId") ?? demoStats.youtubeChannelId,
    [searchParams]
  );
  const youtubeHandle = useMemo(
    () => searchParams.get("youtubeHandle") ?? searchParams.get("handle") ?? "",
    [searchParams]
  );

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const twitchResponse = await fetch("/api/twitch?channel=" + channel);
        const youtubeResponse = await fetch(
          youtubeHandle
            ? "/api/youtube?handle=" + youtubeHandle
            : "/api/youtube?channelId=" + youtubeChannelId
        );
        const twitchData = await twitchResponse.json();
        const youtubeData = await youtubeResponse.json();

        if (!twitchData.ok || !youtubeData.ok) {
          return;
        }

        if (isMounted) {
          setStats({
            ...demoStats,
            ...twitchData.data,
            youtube: youtubeData.data,
          });
        }
      } catch (error) {
        return;
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [channel, youtubeChannelId, youtubeHandle]);

  return (
    <Card className="border-primary/25 bg-background/75 shadow-[0_0_0_1px_rgba(246,183,91,0.2),0_10px_30px_rgba(246,183,91,0.15)]">
      <CardContent className="pt-5 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Stream pulse
        </p>
        <div className="mt-3 flex justify-between gap-4">
          <div>
            <p className="font-display text-4xl text-foreground">
              {stats.viewers.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Live viewers</p>
          </div>
          <Separator orientation="vertical" className="h-auto bg-primary/20" />
          <div>
            <p className="font-display text-4xl text-foreground">
              {stats.subs.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Active subs</p>
          </div>
          <Separator orientation="vertical" className="h-auto bg-primary/20" />
          <div>
            <p className="font-display text-4xl text-foreground">
              {stats.youtube.subscribers.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">YouTube subs</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Channel: {stats.channel}
        </p>
      </CardContent>
    </Card>
  );
}

function StatsWidgetSkeleton() {
  return (
    <Card className="border-primary/25 bg-background/75">
      <CardContent className="pt-5 pb-4">
        <Skeleton className="h-3 w-24" />
        <div className="mt-3 flex justify-between gap-4">
          <div>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="mt-1 h-4 w-16" />
          </div>
          <div>
            <Skeleton className="h-10 w-16" />
            <Skeleton className="mt-1 h-4 w-16" />
          </div>
          <div>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="mt-1 h-4 w-16" />
          </div>
        </div>
        <Skeleton className="mt-3 h-4 w-32" />
      </CardContent>
    </Card>
  );
}

export default function StatsWidget() {
  return (
    <main className="p-6">
      <Suspense fallback={<StatsWidgetSkeleton />}>
        <StatsWidgetContent />
      </Suspense>
    </main>
  );
}
