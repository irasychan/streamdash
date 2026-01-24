"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { ChatMessage } from "./ChatMessage";
import { ConnectionStatus } from "./ConnectionStatus";
import { demoChatMessages } from "@/lib/demoData";
import { cn } from "@/lib/utils";

type ChatContainerProps = {
  maxMessages?: number;
  showDemo?: boolean;
  className?: string;
};

export function ChatContainer({
  maxMessages = 100,
  showDemo = true,
  className,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(
    showDemo ? demoChatMessages : []
  );
  const [connected, setConnected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    const eventSource = new EventSource("/api/chat/sse");

    eventSource.onopen = () => {
      setConnected(true);
      // Clear demo messages when connected
      if (showDemo) {
        setMessages([]);
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Skip keepalive messages
        if (data.type === "keepalive") {
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
          <div className="space-y-0.5">
            {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          </div>
        )}
      </div>
    </div>
  );
}
