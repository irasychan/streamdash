"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "@/features/chat/components/ChatMessage";
import { demoChatMessages } from "@/lib/demoData";
import { useEmotes } from "@/features/emotes/hooks/useEmotes";
import type { ChatMessage as ChatMessageType, ChatPlatform } from "@/features/chat/types/chat";

function ChatWidgetContent() {
  const [messages, setMessages] = useState<ChatMessageType[]>(demoChatMessages);
  const [connected, setConnected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const searchParams = useSearchParams();
  const { loadEmotes } = useEmotes();

  // Widget configuration from URL params
  const maxMessages = useMemo(
    () => Number(searchParams.get("maxMessages")) || 50,
    [searchParams]
  );
  const platforms = useMemo(() => {
    const p = searchParams.get("platforms");
    return p ? (p.split(",") as ChatPlatform[]) : ["twitch", "youtube", "discord"];
  }, [searchParams]);
  const showPlatformBadge = useMemo(
    () => searchParams.get("showPlatform") !== "false",
    [searchParams]
  );
  const transparent = useMemo(
    () => searchParams.get("transparent") === "true",
    [searchParams]
  );

  // Load emotes for Twitch channel
  const loadChannelEmotes = useCallback(async (channel: string) => {
    try {
      const response = await fetch(`/api/twitch/user?username=${encodeURIComponent(channel)}`);
      const data = await response.json();
      
      if (data.ok && data.data?.id) {
        console.log(`[ChatWidget] Loading emotes for channel ${channel} (ID: ${data.data.id})`);
        await loadEmotes(data.data.id);
      }
    } catch (error) {
      console.error("[ChatWidget] Failed to load channel emotes:", error);
    }
  }, [loadEmotes]);

  // Auto-connect to platforms based on URL params
  useEffect(() => {
    const connectPlatforms = async () => {
      const twitchChannel = searchParams.get("twitchChannel");
      const youtubeVideoId = searchParams.get("youtubeVideoId");
      const discordChannelId = searchParams.get("discordChannelId");

      const connections: Promise<Response>[] = [];

      if (twitchChannel) {
        connections.push(
          fetch("/api/chat/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform: "twitch", channel: twitchChannel }),
          })
        );
        // Load emotes for the channel
        loadChannelEmotes(twitchChannel);
      }

      if (youtubeVideoId) {
        // Would need to get liveChatId from video first
        // For now, assume it's passed directly
        const liveChatId = searchParams.get("liveChatId");
        if (liveChatId) {
          connections.push(
            fetch("/api/chat/connect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ platform: "youtube", liveChatId }),
            })
          );
        }
      }

      if (discordChannelId) {
        connections.push(
          fetch("/api/chat/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform: "discord", channelId: discordChannelId }),
          })
        );
      }

      if (connections.length > 0) {
        await Promise.all(connections);
      }
    };

    connectPlatforms();
  }, [searchParams, loadChannelEmotes]);

  // SSE connection for receiving messages
  useEffect(() => {
    const eventSource = new EventSource("/api/chat/sse");

    eventSource.onopen = () => {
      setConnected(true);
      setMessages([]);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "keepalive") return;

        const message = data as ChatMessageType;

        // Filter by platform
        if (!platforms.includes(message.platform)) return;

        setMessages((prev) => {
          const next = [...prev, message];
          return next.slice(-maxMessages);
        });
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => eventSource.close();
  }, [maxMessages, platforms]);

  // Auto-scroll
  useEffect(() => {
    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  return (
    <Card
      className={
        transparent
          ? "border-0 bg-transparent shadow-none"
          : "border-primary/25 bg-background/90 shadow-[0_0_0_1px_rgba(125,207,255,0.22),0_10px_30px_rgba(247,118,142,0.18)]"
      }
    >
      <CardContent className="p-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-2rem)] overflow-y-auto p-3 space-y-0.5"
          style={{ scrollbarWidth: "thin" }}
        >
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              showPlatform={showPlatformBadge}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ChatWidgetSkeleton() {
  return (
    <Card className="border-primary/25 bg-background/75">
      <CardContent className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ChatWidget() {
  return (
    <main className="p-4 min-h-screen">
      <Suspense fallback={<ChatWidgetSkeleton />}>
        <ChatWidgetContent />
      </Suspense>
    </main>
  );
}
