"use client";

import { Button } from "@/components/ui/button";
import { PlatformBadge } from "./PlatformBadge";
import { TimeoutPicker } from "./TimeoutPicker";
import type { ChatMessage } from "../types/chat";

type ChatActionBarProps = {
  selectedMessage: ChatMessage;
  onTimeout: (seconds: number) => void;
  onBan: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onDeselect: () => void;
  isHidden: boolean;
  isTwitchAuthed: boolean;
};

export function ChatActionBar({
  selectedMessage,
  onTimeout,
  onBan,
  onHide,
  onUnhide,
  onDeselect,
  isHidden,
  isTwitchAuthed,
}: ChatActionBarProps) {
  const isTwitch = selectedMessage.platform === "twitch";

  return (
    <div className="sticky bottom-0 z-10 border-t border-border/40 bg-background/80 backdrop-blur-sm px-3 py-2 space-y-1.5">
      {/* Row 1: context + hide/unhide + close */}
      <div className="flex items-center gap-2">
        {/* User info */}
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <PlatformBadge platform={selectedMessage.platform} />
          <span
            className="text-sm font-semibold truncate"
            style={{
              color:
                selectedMessage.author.color || "hsl(var(--foreground))",
            }}
          >
            {selectedMessage.author.displayName}
          </span>
        </div>

        {/* Hide / Unhide */}
        {isHidden ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUnhide}
            className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
          >
            Unhide
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onHide}
            className="h-7 text-xs text-slate-300 hover:text-slate-200"
          >
            Hide
          </Button>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onDeselect}
          className="rounded p-1 text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5"
          title="Deselect (Esc)"
          aria-label="Deselect message"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Row 2: moderation actions + keyboard hints */}
      <div className="flex items-center gap-2">
        {isTwitch && isTwitchAuthed && (
          <>
            <TimeoutPicker onTimeout={onTimeout} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onBan}
              className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
            >
              Ban
            </Button>
            <span className="hidden sm:inline-flex ml-auto text-[10px] text-muted-foreground/50 whitespace-nowrap">
              <kbd className="font-mono">H</kbd>&nbsp;hide&nbsp;&middot;&nbsp;
              <kbd className="font-mono">T</kbd>&nbsp;timeout&nbsp;&middot;&nbsp;
              <kbd className="font-mono">B</kbd>&nbsp;ban&nbsp;&middot;&nbsp;
              <kbd className="font-mono">Esc</kbd>&nbsp;deselect
            </span>
          </>
        )}

        {isTwitch && !isTwitchAuthed && (
          <a
            href="/api/twitch/auth"
            className="text-[11px] text-muted-foreground/60 hover:text-primary/80 transition-colors whitespace-nowrap"
          >
            Connect Twitch to unlock moderation →
          </a>
        )}

        {!isTwitch && (
          <span className="text-[11px] text-muted-foreground/40 whitespace-nowrap">
            Moderation available for Twitch only
          </span>
        )}
      </div>
    </div>
  );
}
