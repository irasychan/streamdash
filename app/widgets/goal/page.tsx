"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { demoStats } from "@/lib/demoData";

type WidgetStats = typeof demoStats;

function GoalWidgetContent() {
  const [stats, setStats] = useState<WidgetStats>(demoStats);
  const searchParams = useSearchParams();
  const channel = useMemo(
    () => searchParams.get("channel") ?? demoStats.channel,
    [searchParams]
  );
  const transparent = useMemo(
    () => searchParams.get("transparent") === "true",
    [searchParams]
  );

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const twitchResponse = await fetch("/api/twitch?channel=" + channel);
        const twitchData = await twitchResponse.json();

        if (!twitchData.ok) {
          return;
        }

        if (isMounted) {
          setStats({
            ...demoStats,
            ...twitchData.data,
          });
        }
      } catch (error) {
        return;
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [channel]);

  const goalPercent = Math.min(
    100,
    Math.round((stats.goal.current / stats.goal.target) * 100)
  );

  return (
    <Card
      className={
        transparent
          ? "border-0 bg-transparent shadow-none"
          : "border-primary/25 bg-background/75 shadow-[0_0_0_1px_rgba(125,207,255,0.22),0_10px_30px_rgba(247,118,142,0.18)]"
      }
    >
      <CardContent className="pt-5 pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Follower sprint
        </p>
        <p className="mt-2 font-display text-4xl text-foreground">
          {goalPercent}%
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.goal.current.toLocaleString()} / {stats.goal.target.toLocaleString()} followers
        </p>
        <Progress value={goalPercent} className="mt-3 h-2.5" />
        <p className="mt-2.5 text-sm text-muted-foreground">
          Keep pushing to the next milestone.
        </p>
      </CardContent>
    </Card>
  );
}

function GoalWidgetSkeleton() {
  return (
    <Card className="border-primary/25 bg-background/75">
      <CardContent className="pt-5 pb-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-10 w-16" />
        <Skeleton className="mt-1 h-4 w-40" />
        <Skeleton className="mt-3 h-2.5 w-full" />
        <Skeleton className="mt-2.5 h-4 w-48" />
      </CardContent>
    </Card>
  );
}

function GoalWidgetWrapper() {
  const searchParams = useSearchParams();
  const transparent = searchParams.get("transparent") === "true";

  return (
    <main className={transparent ? "p-0" : "p-6"}>
      <GoalWidgetContent />
    </main>
  );
}

export default function GoalWidget() {
  return (
    <Suspense fallback={<GoalWidgetSkeleton />}>
      <GoalWidgetWrapper />
    </Suspense>
  );
}
