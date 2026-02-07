"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlatformBadge } from "./PlatformBadge";
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

const TIMEOUT_OPTIONS = [
  { label: "1 min", seconds: 60 },
  { label: "10 min", seconds: 600 },
  { label: "1 hour", seconds: 3600 },
] as const;

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
  const showModerationActions = isTwitch && isTwitchAuthed;

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-border/40 bg-background/80 backdrop-blur-sm px-3 py-2">
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

      {/* Actions */}
      <div className="flex items-center gap-1.5">
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

        {/* Timeout dropdown (Twitch only) */}
        {showModerationActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-amber-400 hover:text-amber-300"
              >
                Timeout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              {TIMEOUT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.seconds}
                  onClick={() => onTimeout(opt.seconds)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Ban (Twitch only) */}
        {showModerationActions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBan}
            className="h-7 text-xs text-rose-400 hover:text-rose-300"
          >
            Ban
          </Button>
        )}
      </div>

      {/* Keyboard hints */}
      <span className="hidden sm:inline-flex text-[10px] text-muted-foreground/50 ml-2 whitespace-nowrap">
        <kbd className="font-mono">↑↓</kbd>&nbsp;navigate&nbsp;&middot;&nbsp;
        <kbd className="font-mono">Esc</kbd>&nbsp;deselect
      </span>

      {/* Close button (mobile / always accessible) */}
      <button
        type="button"
        onClick={onDeselect}
        className="ml-1 rounded p-1 text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5"
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
  );
}
