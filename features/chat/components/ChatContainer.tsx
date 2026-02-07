"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage as ChatMessageType, ChatModerationAction, ChatHideEvent, ChatPlatform } from "../types/chat";
import { ChatMessage, densityGapClasses } from "./ChatMessage";
import { ChatActionBar } from "./ChatActionBar";
import { BanConfirmDialog } from "./BanConfirmDialog";
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
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<ChatMessageType | null>(null);
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

        // Handle flush-debug event
        if (data.type === "flush-debug") {
          setMessages((prev) => prev.filter((msg) => !msg.id.includes("-debug-")));
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

  // Auto-scroll to bottom when new messages arrive (paused when a message is selected)
  useEffect(() => {
    if (!selectedMessageId && autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, selectedMessageId]);

  // Detect manual scroll to pause auto-scroll
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    autoScrollRef.current = isAtBottom;
  };

  const handleModerate = useCallback(
    async (
      message: ChatMessageType,
      action: ChatModerationAction,
      opts?: { durationSeconds?: number; reason?: string }
    ) => {
      if (message.platform !== "twitch") return;

      const payload = {
        platform: "twitch" as const,
        action,
        targetUserId: message.author.id,
        durationSeconds: opts?.durationSeconds ?? (action === "timeout" ? 600 : undefined),
        reason: opts?.reason,
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
          const errorMsg = data?.error ?? response.statusText;
          console.error("[Chat Moderation] Failed:", errorMsg);
          toast.error(`Moderation failed: ${errorMsg}`);
          return;
        }

        const actionLabel = action === "timeout"
          ? `Timed out ${message.author.displayName}`
          : `Banned ${message.author.displayName}`;
        toast.success(actionLabel);
      } catch (error) {
        console.error("[Chat Moderation] Error:", error);
        toast.error("Moderation request failed");
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

  const handleDebugFlush = useCallback(async () => {
    try {
      await fetch("/api/chat/debug", { method: "DELETE" });
    } catch (error) {
      console.error("[Chat Debug] Flush error:", error);
    }
  }, []);

  // --- Selection logic ---

  const selectedMessage = useMemo(
    () => (selectedMessageId ? messages.find((m) => m.id === selectedMessageId) ?? null : null),
    [selectedMessageId, messages]
  );

  // Auto-deselect if selected message leaves the array (maxMessages overflow)
  useEffect(() => {
    if (selectedMessageId && !messages.some((m) => m.id === selectedMessageId)) {
      setSelectedMessageId(null);
    }
  }, [messages, selectedMessageId]);

  const handleSelectMessage = useCallback((msg: ChatMessageType) => {
    setSelectedMessageId((prev) => (prev === msg.id ? null : msg.id));
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedMessageId(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Escape") {
        setSelectedMessageId(null);
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMessageId((prev) => {
          if (!prev) {
            // Select first or last message
            return e.key === "ArrowDown"
              ? messages[0]?.id ?? null
              : messages[messages.length - 1]?.id ?? null;
          }
          const idx = messages.findIndex((m) => m.id === prev);
          if (idx === -1) return null;
          const nextIdx = e.key === "ArrowDown" ? idx + 1 : idx - 1;
          if (nextIdx < 0 || nextIdx >= messages.length) return prev;
          return messages[nextIdx].id;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [messages]);

  // Scroll selected message into view
  useEffect(() => {
    if (!selectedMessageId || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-message-id="${selectedMessageId}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedMessageId]);

  // Action bar handlers
  const handleTimeoutFromBar = useCallback(
    (seconds: number) => {
      if (!selectedMessage) return;
      handleModerate(selectedMessage, "timeout", { durationSeconds: seconds });
      setSelectedMessageId(null);
    },
    [selectedMessage, handleModerate]
  );

  const handleBanClick = useCallback(() => {
    if (!selectedMessage) return;
    setBanTarget(selectedMessage);
    setBanDialogOpen(true);
  }, [selectedMessage]);

  const handleConfirmBan = useCallback(
    (reason?: string) => {
      if (!banTarget) return;
      handleModerate(banTarget, "ban", { reason });
      setBanDialogOpen(false);
      setBanTarget(null);
      setSelectedMessageId(null);
    },
    [banTarget, handleModerate]
  );

  const handleHideFromBar = useCallback(() => {
    if (!selectedMessage) return;
    handleHide(selectedMessage);
    setSelectedMessageId(null);
    toast.success(`Hidden message from ${selectedMessage.author.displayName}`);
  }, [selectedMessage, handleHide]);

  const handleUnhideFromBar = useCallback(() => {
    if (!selectedMessage) return;
    handleUnhide(selectedMessage);
    setSelectedMessageId(null);
    toast.success(`Unhidden message from ${selectedMessage.author.displayName}`);
  }, [selectedMessage, handleUnhide]);

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
              <div key={msg.id} data-message-id={msg.id}>
                <ChatMessage
                  message={msg}
                  chatPrefs={chatPrefs}
                  onModerate={twitchAuthConnected ? handleModerate : undefined}
                  onHide={handleHide}
                  onUnhide={handleUnhide}
                  isHighlighted={shouldHighlightMessage(msg)}
                  isHidden={hiddenMessageIds.has(msg.id)}
                  isSelected={selectedMessageId === msg.id}
                  onSelect={handleSelectMessage}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMessage && (
        <ChatActionBar
          selectedMessage={selectedMessage}
          onTimeout={handleTimeoutFromBar}
          onBan={handleBanClick}
          onHide={handleHideFromBar}
          onUnhide={handleUnhideFromBar}
          onDeselect={handleDeselect}
          isHidden={hiddenMessageIds.has(selectedMessage.id)}
          isTwitchAuthed={twitchAuthConnected}
        />
      )}

      <BanConfirmDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onConfirm={handleConfirmBan}
        username={banTarget?.author.displayName ?? ""}
        platform={banTarget?.platform ?? "twitch"}
      />

      {showDebugInput && <DebugChatInput onSend={handleDebugSend} onFlush={handleDebugFlush} />}
    </div>
  );
}
