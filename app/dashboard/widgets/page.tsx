"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonitorPlay, BarChart3, MessageSquare, Eye } from "lucide-react";

const widgets = [
  {
    title: "Stream Stats",
    description: "Display live viewer count, followers, and YouTube subs",
    href: "/widgets/stats",
    icon: BarChart3,
    params: "?channel=YOURNAME&youtubeChannelId=YOURID",
  },
  {
    title: "Follower Goal",
    description: "Show progress towards your follower target",
    href: "/widgets/goal",
    icon: Eye,
    params: "?channel=YOURNAME",
  },
  {
    title: "Chat Overlay",
    description: "Unified chat from Twitch, YouTube, and Discord",
    href: "/widgets/chat",
    icon: MessageSquare,
    params: "?maxMessages=50&platforms=twitch,youtube,discord",
  },
  {
    title: "Chat (Transparent)",
    description: "Transparent background for clean overlays",
    href: "/widgets/chat?transparent=true",
    icon: MessageSquare,
    params: "?transparent=true&maxMessages=50",
  },
];

export default function WidgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">OBS Widgets</h2>
        <p className="mt-1 text-muted-foreground">
          Add these URLs to OBS as browser sources for your stream overlays.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {widgets.map((widget) => (
          <Card key={widget.href} className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <widget.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{widget.description}</p>
              <div className="rounded-md bg-muted/30 p-2">
                <code className="text-xs text-muted-foreground break-all">
                  {widget.href}{widget.params}
                </code>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={widget.href} target="_blank" rel="noreferrer">
                    <MonitorPlay className="mr-2 h-4 w-4" />
                    Preview
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + widget.href + widget.params
                    );
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm prose-invert max-w-none">
          <ol className="space-y-2 text-muted-foreground">
            <li>Copy the widget URL from above</li>
            <li>In OBS, add a new Browser Source</li>
            <li>Paste the URL and set dimensions (recommended: 400x200 for stats, 400x600 for chat)</li>
            <li>Customize URL parameters as needed for your channel</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
