"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { demoStats } from "@/lib/demoData";

type DashboardStats = typeof demoStats;

const refreshInterval = 20000;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(demoStats);
  const [status, setStatus] = useState("Demo mode");
  const [twitchStatus, setTwitchStatus] = useState("Checking Twitch auth...");
  const [appTokenStatus, setAppTokenStatus] = useState("App token not tested");
  const [appTokenBusy, setAppTokenBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const twitchResponse = await fetch("/api/twitch?channel=" + demoStats.channel);
        const youtubeResponse = await fetch(
          "/api/youtube?channelId=" + demoStats.youtubeChannelId
        );
        const authResponse = await fetch("/api/twitch/status");

        const twitchData = await twitchResponse.json();
        const youtubeData = await youtubeResponse.json();
        const authData = await authResponse.json();

        if (!twitchData.ok || !youtubeData.ok) {
          setStatus("Demo mode (missing API keys)");
          setTwitchStatus(authData.connected ? "Twitch connected" : "Twitch not connected");
          return;
        }

        if (isMounted) {
          setStats({
            ...demoStats,
            ...twitchData.data,
            youtube: youtubeData.data,
          });
          setStatus("Live data connected");
          setTwitchStatus(authData.connected ? "Twitch connected" : "Twitch not connected");
        }
      } catch (error) {
        setStatus("Demo mode (network error)");
        setTwitchStatus("Twitch not connected");
      }
    };

    loadStats();
    const interval = setInterval(loadStats, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const testAppToken = async () => {
    setAppTokenBusy(true);
    setAppTokenStatus("Testing client credentials...");
    try {
      const response = await fetch("/api/twitch?channel=" + demoStats.channel);
      const payload = await response.json();
      if (payload.ok) {
        setAppTokenStatus("Client credentials OK");
      } else {
        setAppTokenStatus(payload.error ?? "Client credentials failed");
      }
    } catch (error) {
      setAppTokenStatus("Client credentials failed");
    } finally {
      setAppTokenBusy(false);
    }
  };

  const goalPercent = Math.min(
    100,
    Math.round((stats.goal.current / stats.goal.target) * 100)
  );

  return (
    <main className="page">
      <div className="page-inner">
        {/* Header Card */}
        <Card className="border-primary/40 bg-gradient-to-br from-secondary/95 to-card/95 shadow-[0_0_0_1px_rgba(246,183,91,0.2),0_10px_30px_rgba(246,183,91,0.15)]">
          <CardContent className="pt-6">
            <div className="flex justify-between gap-5">
              <div>
                <Badge variant="secondary" className="bg-primary/15 text-foreground">
                  Streaming Dashboard
                </Badge>
                <h1 className="mt-3 mb-2 font-display text-4xl">
                  {stats.channel} live control room
                </h1>
                <p className="text-muted-foreground">Status: {status}</p>
                <p className="mt-1.5 text-muted-foreground">
                  {twitchStatus}.{" "}
                  <Link href="/api/twitch/auth" className="text-primary hover:underline">
                    Connect Twitch
                  </Link>
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testAppToken}
                    disabled={appTokenBusy}
                    className="border-primary/60 bg-primary/15 hover:bg-primary/25"
                  >
                    {appTokenBusy ? "Testing..." : "Test App Token"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {appTokenStatus}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Now Live
                </p>
                <Badge
                  variant={stats.live ? "default" : "secondary"}
                  className={stats.live ? "mt-2 bg-emerald-500/20 text-emerald-400" : "mt-2"}
                >
                  {stats.live ? "On Air" : "Offline"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Viewers"
            value={stats.viewers.toLocaleString()}
            helper="Twitch live viewers"
          />
          <StatCard
            label="Followers"
            value={stats.followers.toLocaleString()}
            helper="Total Twitch followers"
          />
          <StatCard
            label="YouTube Subs"
            value={stats.youtube.subscribers.toLocaleString()}
            helper="Channel subscribers"
          />
        </section>

        {/* Bottom Grid */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Follower Goal */}
          <Card className="border-primary/15 bg-gradient-to-br from-secondary/95 to-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="font-display">Follower goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.goal.current.toLocaleString()} / {stats.goal.target.toLocaleString()}
              </p>
              <Progress value={goalPercent} className="mt-3 h-2.5" />
              <p className="mt-3 text-sm text-muted-foreground">
                {goalPercent}% of monthly target
              </p>
            </CardContent>
          </Card>

          {/* OBS Widgets */}
          <Card className="border-primary/15 bg-gradient-to-br from-secondary/95 to-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="font-display">OBS widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  asChild
                  className="h-auto justify-start border-primary/20 bg-secondary/40 px-4 py-3 hover:border-primary/40 hover:bg-secondary/60"
                >
                  <a href="/widgets/stats" target="_blank" rel="noreferrer">
                    Stream stats widget
                  </a>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto justify-start border-primary/20 bg-secondary/40 px-4 py-3 hover:border-primary/40 hover:bg-secondary/60"
                >
                  <a href="/widgets/goal" target="_blank" rel="noreferrer">
                    Follower goal widget
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Use these URLs in OBS browser sources. Add ?channel=YOURNAME or
                ?youtubeChannelId=YOURID to override defaults.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
