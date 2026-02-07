"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType, ChatModerationAction, ChatHideEvent, ChatPlatform } from "../types/chat";
import { ChatMessage, densityGapClasses } from "./ChatMessage";
import { ConnectionStatus } from "./ConnectionStatus";
import { DebugChatInput } from "./DebugChatInput";
import { demoChatMessages } from "@/lib/demoData";
import { cn } from "@/lib/ui/cn";
import { usePreferences } from "@/features/preferences/usePreferences";
import { useEmotes } from "@/features/emotes/hooks/useEmotes";
import { useChatStatus } from "../hooks/useChatStatus";
import type { ChatDisplayPreferences } from "@/features/preferences/types";

type ChatContainerProps = {
  maxMessages?: number;
  showDemo?: boolean;
  showDebugInput?: boolean;
  className?: string;
};

export function ChatContainer({
  maxMessages = 100,
  showDemo = true,
  showDebugInput = false,
  className,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(
    showDemo ? demoChatMessages : []
  );
  const [hiddenMessageIds, setHiddenMessageIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const [twitchAuthConnected, setTwitchAuthConnected] = useState(false);
  const [twitchUserLogin, setTwitchUserLogin] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const { preferences } = usePreferences();
  const { loadEmotes } = useEmotes();
  const { twitchUserId, twitchChannel } = useChatStatus();
  const chatPrefs = preferences.chat;

  // Load emotes when Twitch user ID becomes available
  useEffect(() => {
    if (twitchUserId) {
      console.log(`[ChatContainer] Loading emotes for user ID: ${twitchUserId}`);
      loadEmotes(twitchUserId);
    }
  }, [twitchUserId, loadEmotes]);

  useEffect(() => {
    let active = true;

    const fetchAuthStatus = async () => {
      try {
        const response = await fetch("/api/twitch/status");
        const data = await response.json();
        if (!active) return;
        setTwitchAuthConnected(Boolean(data?.connected));
        setTwitchUserLogin(data?.user ?? null);
      } catch {
        if (!active) return;
        setTwitchAuthConnected(false);
        setTwitchUserLogin(null);
      }
    };

    fetchAuthStatus();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/chat/sse");

    eventSource.onopen = async () => {
      setConnected(true);
      // Clear demo messages when connected
      if (showDemo) {
        setMessages([]);
      }
      // Fetch initial hidden message list
      try {
        const response = await fetch("/api/chat/hide");
        const data = await response.json();
        if (data.ok && Array.isArray(data.data)) {
          setHiddenMessageIds(new Set(data.data));
        }
      } catch {
        // Ignore fetch errors
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Skip keepalive messages
        if (data.type === "keepalive") {
          return;
        }

        // Handle hide/unhide events
        if (data.type === "hide" || data.type === "unhide") {
          const hideEvent = data as ChatHideEvent;
          setHiddenMessageIds((prev) => {
            const next = new Set(prev);
            if (hideEvent.type === "hide") {
              next.add(hideEvent.messageId);
            } else {
              next.delete(hideEvent.messageId);
            }
            return next;
          });
          return;
        }

        const message = data as ChatMessageType;
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

    return () => {
      eventSource.close();
    };
  }, [maxMessages, showDemo]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect manual scroll to pause auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    autoScrollRef.current = isAtBottom;
  };

  const handleModerate = useCallback(
    async (message: ChatMessageType, action: ChatModerationAction) => {
      if (message.platform !== "twitch") return;

      const payload = {
        platform: "twitch" as const,
        action,
        targetUserId: message.author.id,
        durationSeconds: action === "timeout" ? 600 : undefined,
        channel: twitchChannel,
      };

      try {
        const response = await fetch("/api/chat/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          console.error("[Chat Moderation] Failed:", data?.error ?? response.statusText);
        }
      } catch (error) {
        console.error("[Chat Moderation] Error:", error);
      }
    },
    [twitchChannel]
  );

  const handleHide = useCallback(async (message: ChatMessageType) => {
    try {
      const response = await fetch("/api/chat/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error("[Chat Hide] Failed:", data?.error ?? response.statusText);
      }
    } catch (error) {
      console.error("[Chat Hide] Error:", error);
    }
  }, []);

  const handleUnhide = useCallback(async (message: ChatMessageType) => {
    try {
      const response = await fetch("/api/chat/hide", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error("[Chat Unhide] Failed:", data?.error ?? response.statusText);
      }
    } catch (error) {
      console.error("[Chat Unhide] Error:", error);
    }
  }, []);

  const handleDebugSend = useCallback(async (platform: ChatPlatform, content: string) => {
    try {
      await fetch("/api/chat/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content }),
      });
    } catch (error) {
      console.error("[Chat Debug] Error:", error);
    }
  }, []);

  const highlightKeywords = (chatPrefs.highlightKeywords ?? [])
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  const mentionTargets = chatPrefs.highlightMentions
    ? [twitchUserLogin, twitchChannel].filter((value): value is string => Boolean(value))
    : [];

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const shouldHighlightMessage = (message: ChatMessageType) => {
    if (message.isHighlighted) return true;

    const content = message.content.toLowerCase();

    if (highlightKeywords.length > 0) {
      for (const keyword of highlightKeywords) {
        if (content.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }

    if (mentionTargets.length > 0) {
      for (const mention of mentionTargets) {
        const regex = new RegExp(`(^|\\s|@)${escapeRegExp(mention)}(\\b)`, "i");
        if (regex.test(message.content)) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Live Chat
          </span>
          <span
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              connected 
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                : "bg-muted-foreground/40"
            )}
            title={connected ? "Connected" : "Disconnected"}
          />
        </div>
        <ConnectionStatus />
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto -mx-1 px-1"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground/60 text-sm">
                {connected
                  ? "Waiting for messages..."
                  : "Connect to a platform to see chat"}
              </div>
              {!connected && (
                <div className="mt-2 text-xs text-muted-foreground/40">
                  Use the Chat Integrations panel to connect
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={densityGapClasses[chatPrefs.messageDensity]}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                chatPrefs={chatPrefs}
                onModerate={twitchAuthConnected ? handleModerate : undefined}
                onHide={handleHide}
                onUnhide={handleUnhide}
                isHighlighted={shouldHighlightMessage(msg)}
                isHidden={hiddenMessageIds.has(msg.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showDebugInput && <DebugChatInput onSend={handleDebugSend} />}
    </div>
  );
}
