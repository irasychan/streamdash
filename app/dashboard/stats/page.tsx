"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { demoStats } from "@/lib/demoData";

type DashboardStats = typeof demoStats;

export default function StatsPage() {
  const [stats, setStats] = useState<DashboardStats>(demoStats);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const twitchResponse = await fetch("/api/twitch?channel=" + demoStats.channel);
        const youtubeResponse = await fetch(
          "/api/youtube?channelId=" + demoStats.youtubeChannelId
        );

        const twitchData = await twitchResponse.json();
        const youtubeData = await youtubeResponse.json();

        if (twitchData.ok && youtubeData.ok) {
          setStats({
            ...demoStats,
            ...twitchData.data,
            youtube: youtubeData.data,
          });
        }
      } catch {
        // Keep demo data
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Statistics</h2>
        <p className="mt-1 text-muted-foreground">
          Track your streaming metrics across all platforms.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Live Viewers"
          value={stats.viewers.toLocaleString()}
          helper="Current Twitch viewers"
        />
        <StatCard
          label="Twitch Followers"
          value={stats.followers.toLocaleString()}
          helper="Total followers"
        />
        <StatCard
          label="YouTube Subscribers"
          value={stats.youtube.subscribers.toLocaleString()}
          helper="Total subscribers"
        />
        <StatCard
          label="YouTube Views"
          value={stats.youtube.views.toLocaleString()}
          helper="Total channel views"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Twitch Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Channel</dt>
                <dd className="font-medium">{stats.channel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Live Status</dt>
                <dd className="font-medium">{stats.live ? "On Air" : "Offline"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Viewers</dt>
                <dd className="font-medium">{stats.viewers.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Followers</dt>
                <dd className="font-medium">{stats.followers.toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">YouTube Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subscribers</dt>
                <dd className="font-medium">{stats.youtube.subscribers.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Views</dt>
                <dd className="font-medium">{stats.youtube.views.toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
