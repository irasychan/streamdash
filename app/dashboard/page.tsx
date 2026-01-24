"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { demoStats } from "@/lib/demoData";
import { ChatContainer } from "@/components/chat";
import { PlatformBadge } from "@/components/chat/PlatformBadge";
import { DiscordChannelPicker } from "@/components/DiscordChannelPicker";
import type { ChatPlatform } from "@/lib/types/chat";
import { useConfig } from "@/hooks/useConfig";
import { useDashboardStatus } from "@/contexts/DashboardStatusContext";
import { useChatStatus } from "@/contexts/ChatStatusContext";

type DashboardStats = typeof demoStats;

const refreshInterval = 20000;

export default function DashboardPage() {
  const { config, loading: configLoading } = useConfig();
  const { status, setStatus, setIsLive } = useDashboardStatus();
  const { status: chatStatus, refresh: refreshChatStatus } = useChatStatus();
  const [stats, setStats] = useState<DashboardStats>(demoStats);
  const [twitchStatus, setTwitchStatus] = useState("Checking Twitch auth...");
  const [appTokenStatus, setAppTokenStatus] = useState("App token not tested");
  const [appTokenBusy, setAppTokenBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState<Record<ChatPlatform, boolean>>({
    twitch: false,
    youtube: false,
    discord: false,
  });
  const [chatNotes, setChatNotes] = useState<Record<ChatPlatform, string>>({
    twitch: "",
    youtube: "",
    discord: "",
  });
  // Local input state - initialized from persistent config
  const [twitchChannel, setTwitchChannel] = useState("");
  const [youtubeLiveChatId, setYoutubeLiveChatId] = useState("");
  const [discordChannelId, setDiscordChannelId] = useState("");
  const [configInitialized, setConfigInitialized] = useState(false);

  // Sync local input state with config when config loads
  useEffect(() => {
    if (!configLoading && !configInitialized) {
      setTwitchChannel(config.platforms.twitch.defaultChannel || demoStats.channel);
      setYoutubeLiveChatId(config.platforms.youtube.defaultLiveChatId || "");
      setDiscordChannelId(config.platforms.discord.defaultChannelId || "");
      setConfigInitialized(true);
    }
  }, [config, configLoading, configInitialized]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      // Use config channel if available, fallback to demo
      const channelToFetch = config.platforms.twitch.defaultChannel || demoStats.channel;
      const youtubeChannelToFetch = config.platforms.youtube.defaultChannelId || demoStats.youtubeChannelId;
      
      try {
        const twitchResponse = await fetch("/api/twitch?channel=" + channelToFetch);
        const youtubeResponse = await fetch(
          "/api/youtube?channelId=" + youtubeChannelToFetch
        );
        const authResponse = await fetch("/api/twitch/status");

        const twitchData = await twitchResponse.json();
        const youtubeData = await youtubeResponse.json();
        const authData = await authResponse.json();

        if (isMounted) {
          const twitchOk = twitchData.ok;
          const youtubeOk = youtubeData.ok;

          // Build status based on which APIs succeeded
          if (twitchOk && youtubeOk) {
            setStatus("Live data");
          } else if (twitchOk) {
            setStatus("Twitch live · YouTube demo");
          } else if (youtubeOk) {
            setStatus("Twitch demo · YouTube live");
          } else {
            setStatus("Demo mode");
          }

          setTwitchStatus(authData.connected ? "Twitch auth OK" : "Twitch auth missing");

          const newStats = {
            ...demoStats,
            channel: channelToFetch,
            ...(twitchOk ? twitchData.data : {}),
            youtube: youtubeOk ? youtubeData.data : demoStats.youtube,
          };
          setStats(newStats);
          setIsLive(newStats.live ?? false);
        }
      } catch {
        setStatus("Demo mode (network error)");
        setIsLive(false);
        setTwitchStatus("Twitch not connected");
      }
    };

    // Only load stats once config is ready
    if (!configLoading) {
      loadStats();
      const interval = setInterval(loadStats, refreshInterval);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [config, configLoading]);

  const connectPlatform = async (platform: ChatPlatform) => {
    setChatBusy((prev) => ({ ...prev, [platform]: true }));
    setChatNotes((prev) => ({ ...prev, [platform]: "Connecting..." }));
    try {
      let body: Record<string, string> = { platform };
      if (platform === "twitch") {
        body = { platform, channel: twitchChannel };
      }
      if (platform === "youtube") {
        body = { platform, liveChatId: youtubeLiveChatId };
      }
      if (platform === "discord") {
        body = { platform, channelId: discordChannelId };
      }

      const response = await fetch("/api/chat/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.ok) {
        setChatNotes((prev) => ({ ...prev, [platform]: "Connected" }));
      } else {
        setChatNotes((prev) => ({ ...prev, [platform]: data.error ?? "Failed" }));
      }
    } catch {
      setChatNotes((prev) => ({ ...prev, [platform]: "Request failed" }));
    } finally {
      setChatBusy((prev) => ({ ...prev, [platform]: false }));
      await refreshChatStatus();
    }
  };

  const disconnectPlatform = async (platform: ChatPlatform) => {
    setChatBusy((prev) => ({ ...prev, [platform]: true }));
    setChatNotes((prev) => ({ ...prev, [platform]: "Disconnecting..." }));
    try {
      const response = await fetch("/api/chat/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const data = await response.json();
      if (data.ok) {
        setChatNotes((prev) => ({ ...prev, [platform]: "Disconnected" }));
      } else {
        setChatNotes((prev) => ({ ...prev, [platform]: data.error ?? "Failed" }));
      }
    } catch {
      setChatNotes((prev) => ({ ...prev, [platform]: "Request failed" }));
    } finally {
      setChatBusy((prev) => ({ ...prev, [platform]: false }));
      await refreshChatStatus();
    }
  };

  const getPlatformStatus = (platform: ChatPlatform) =>
    chatStatus.find((item) => item.platform === platform);

  const testAppToken = async () => {
    setAppTokenBusy(true);
    setAppTokenStatus("Testing client credentials...");
    try {
      const channelToTest = config.platforms.twitch.defaultChannel || demoStats.channel;
      const response = await fetch("/api/twitch?channel=" + channelToTest);
      const payload = await response.json();
      if (payload.ok) {
        setAppTokenStatus("Client credentials OK");
      } else {
        setAppTokenStatus(payload.error ?? "Client credentials failed");
      }
    } catch {
      setAppTokenStatus("Client credentials failed");
    } finally {
      setAppTokenBusy(false);
    }
  };

  // Use config goal target if set, otherwise fallback to stats
  const goalTarget = config.goals.followerTarget || stats.goal.target;
  const goalPercent = Math.min(
    100,
    Math.round((stats.goal.current / goalTarget) * 100)
  );

  const twitchConnection = getPlatformStatus("twitch");
  const youtubeConnection = getPlatformStatus("youtube");
  const discordConnection = getPlatformStatus("discord");

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {stats.channel}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {status} &middot; {twitchStatus}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={stats.live ? "default" : "secondary"}
                className={stats.live 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-muted/50"
                }
              >
                {stats.live ? "On Air" : "Offline"}
              </Badge>
              <Link href="/api/twitch/auth" className="text-sm text-primary hover:underline">
                Connect Twitch
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Follower Goal
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {goalPercent}%
            </p>
            <Progress value={goalPercent} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.goal.current.toLocaleString()} / {goalTarget.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Integrations */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Chat Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Twitch */}
            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform="twitch" size="md" />
                  <div>
                    <p className="font-medium">Twitch</p>
                    <p className="text-xs text-muted-foreground">
                      {twitchConnection?.connected
                        ? `Connected to ${twitchConnection.channel}`
                        : "Disconnected"}
                    </p>
                  </div>
                </div>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    twitchConnection?.connected
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-muted-foreground/50"
                  }`}
                />
              </div>
              <div className="mt-3 space-y-2">
                <input
                  value={twitchChannel}
                  onChange={(event) => setTwitchChannel(event.target.value)}
                  placeholder="twitch_channel"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-2">
                  {twitchConnection?.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectPlatform("twitch")}
                      disabled={chatBusy.twitch}
                    >
                      {chatBusy.twitch ? "..." : "Disconnect"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => connectPlatform("twitch")}
                      disabled={!twitchChannel || chatBusy.twitch}
                    >
                      {chatBusy.twitch ? "..." : "Connect"}
                    </Button>
                  )}
                  {chatNotes.twitch && (
                    <span className="text-xs text-muted-foreground">{chatNotes.twitch}</span>
                  )}
                </div>
              </div>
            </div>

            {/* YouTube */}
            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform="youtube" size="md" />
                  <div>
                    <p className="font-medium">YouTube</p>
                    <p className="text-xs text-muted-foreground">
                      {youtubeConnection?.connected
                        ? `Connected to ${youtubeConnection.channel}`
                        : "Disconnected"}
                    </p>
                  </div>
                </div>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    youtubeConnection?.connected
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-muted-foreground/50"
                  }`}
                />
              </div>
              <div className="mt-3 space-y-2">
                <input
                  value={youtubeLiveChatId}
                  onChange={(event) => setYoutubeLiveChatId(event.target.value)}
                  placeholder="live_chat_id"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-2">
                  {youtubeConnection?.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectPlatform("youtube")}
                      disabled={chatBusy.youtube}
                    >
                      {chatBusy.youtube ? "..." : "Disconnect"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => connectPlatform("youtube")}
                      disabled={!youtubeLiveChatId || chatBusy.youtube}
                    >
                      {chatBusy.youtube ? "..." : "Connect"}
                    </Button>
                  )}
                  {chatNotes.youtube && (
                    <span className="text-xs text-muted-foreground">{chatNotes.youtube}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Link href="/api/youtube/auth" className="text-primary hover:underline">
                    Connect YouTube auth
                  </Link>
                </p>
              </div>
            </div>

            {/* Discord */}
            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformBadge platform="discord" size="md" />
                  <div>
                    <p className="font-medium">Discord</p>
                    <p className="text-xs text-muted-foreground">
                      {discordConnection?.connected
                        ? `Connected to ${discordConnection.channel}`
                        : "Disconnected"}
                    </p>
                  </div>
                </div>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    discordConnection?.connected
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-muted-foreground/50"
                  }`}
                />
              </div>
              <div className="mt-3 space-y-3">
                {/* Channel picker */}
                <DiscordChannelPicker
                  selectedChannelId={discordChannelId}
                  onChannelSelect={(channelId) => setDiscordChannelId(channelId)}
                />

                {/* Manual channel ID input */}
                <input
                  value={discordChannelId}
                  onChange={(event) => setDiscordChannelId(event.target.value)}
                  placeholder="discord_channel_id"
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-2">
                  {discordConnection?.connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectPlatform("discord")}
                      disabled={chatBusy.discord}
                    >
                      {chatBusy.discord ? "..." : "Disconnect"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => connectPlatform("discord")}
                      disabled={!discordChannelId || chatBusy.discord}
                    >
                      {chatBusy.discord ? "..." : "Connect"}
                    </Button>
                  )}
                  {chatNotes.discord && (
                    <span className="text-xs text-muted-foreground">{chatNotes.discord}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Chat */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Live Chat</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChatContainer />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={testAppToken}
              disabled={appTokenBusy}
            >
              {appTokenBusy ? "Testing..." : "Test App Token"}
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              {appTokenStatus}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
