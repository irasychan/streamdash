"use client";

import { useRef, useState } from "react";
import { Bug, Trash2 } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import type { ChatPlatform } from "../types/chat";

const PLATFORM_ORDER: ChatPlatform[] = ["twitch", "youtube", "discord"];

const PLATFORM_CONFIG: Record<ChatPlatform, { label: string; color: string }> = {
  twitch: { label: "TW", color: "bg-purple-600 hover:bg-purple-500" },
  youtube: { label: "YT", color: "bg-red-600 hover:bg-red-500" },
  discord: { label: "DC", color: "bg-indigo-600 hover:bg-indigo-500" },
};

type DebugChatInputProps = {
  onSend: (platform: ChatPlatform, content: string) => void;
  onFlush?: () => void;
};

export function DebugChatInput({ onSend, onFlush }: DebugChatInputProps) {
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<ChatPlatform>("twitch");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(platform, trimmed);
    setText("");
    inputRef.current?.focus();
  };

  const cyclePlatform = () => {
    const idx = PLATFORM_ORDER.indexOf(platform);
    setPlatform(PLATFORM_ORDER[(idx + 1) % PLATFORM_ORDER.length]);
  };

  const config = PLATFORM_CONFIG[platform];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border/40 pt-3 mt-3"
    >
      <Bug className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      <button
        type="button"
        onClick={cyclePlatform}
        className={cn(
          config.color,
          "shrink-0 rounded px-2 py-1 text-[10px] font-bold text-white transition-colors"
        )}
        title={`Sending as ${platform} (click to cycle)`}
      >
        {config.label}
      </button>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Send a debug message..."
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="shrink-0 rounded px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      >
        Send
      </button>
      {onFlush && (
        <button
          type="button"
          onClick={onFlush}
          className="shrink-0 rounded p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
          title="Clear debug messages"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
