"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [twitchChannel, setTwitchChannel] = useState("");
  const [youtubeChannelId, setYoutubeChannelId] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-muted-foreground">
          Configure your streaming dashboard and platform connections.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Twitch Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Twitch</CardTitle>
                <CardDescription>Connect your Twitch account for live stats and chat</CardDescription>
              </div>
              <Badge variant="outline">OAuth Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitch-channel">Default Channel</Label>
              <Input
                id="twitch-channel"
                placeholder="your_twitch_channel"
                value={twitchChannel}
                onChange={(e) => setTwitchChannel(e.target.value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">OAuth Connection</p>
                <p className="text-xs text-muted-foreground">
                  Required for chat and user-specific data
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/twitch/auth">Connect Twitch</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* YouTube Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">YouTube</CardTitle>
                <CardDescription>Connect your YouTube account for subscriber stats and live chat</CardDescription>
              </div>
              <Badge variant="outline">OAuth Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-channel">Channel ID</Label>
              <Input
                id="youtube-channel"
                placeholder="UCxxxxxxxxxxxxxxxxxx"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">OAuth Connection</p>
                <p className="text-xs text-muted-foreground">
                  Required for live chat access
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/youtube/auth">Connect YouTube</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discord Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Discord</CardTitle>
                <CardDescription>Connect Discord for server chat integration</CardDescription>
              </div>
              <Badge variant="outline">Bot Token Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Bot Connection</p>
                <p className="text-xs text-muted-foreground">
                  Uses server bot token for channel access
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/discord/auth">Connect Discord</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Info */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Environment Variables</CardTitle>
            <CardDescription>Required API credentials (set in .env.local)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted/30 p-4 font-mono text-xs">
              <pre className="text-muted-foreground whitespace-pre-wrap">
{`# Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# YouTube  
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
