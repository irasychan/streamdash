"use client";

import Image from "next/image";
import type { ChatMessage as ChatMessageType } from "../types/chat";
import type { ChatDisplayPreferences, MessageLayout, TextAlign } from "@/features/preferences/types";
import { PlatformBadge } from "./PlatformBadge";
import { cn } from "@/lib/ui/cn";
import { renderMessageWithEmotes } from "../utils/emoteRenderer";
import { useEmotes } from "@/features/emotes/hooks/useEmotes";

type ChatMessageProps = {
  message: ChatMessageType;
  showPlatform?: boolean;
  className?: string;
  chatPrefs?: Partial<ChatDisplayPreferences>;
};

// Font size classes
const fontSizeClasses = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
} as const;

// Density padding classes
const densityClasses = {
  compact: "px-2 py-1",
  comfortable: "px-2.5 py-2",
  spacious: "px-3 py-3",
} as const;

// Density gap classes for message spacing (applied in container)
export const densityGapClasses = {
  compact: "space-y-0",
  comfortable: "space-y-0.5",
  spacious: "space-y-1.5",
} as const;

// Avatar size classes
const avatarSizeClasses = {
  small: "h-5 w-5",
  medium: "h-6 w-6",
  large: "h-7 w-7",
} as const;

const avatarSizePx = {
  small: 20,
  medium: 24,
  large: 28,
} as const;

// Text alignment classes
const textAlignClasses: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Flex alignment for the container
const flexAlignClasses: Record<TextAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function ChatMessage({
  message,
  showPlatform = true,
  className,
  chatPrefs,
}: ChatMessageProps) {
  const { author, content, platform, emotes, isModerator, isSubscriber } = message;
  const { emotes: thirdPartyEmotes } = useEmotes();

  // Default preferences if not provided
  const fontSize = chatPrefs?.fontSize ?? "medium";
  const density = chatPrefs?.messageDensity ?? "comfortable";
  const showAvatars = chatPrefs?.showAvatars ?? false;
  const showBadges = chatPrefs?.showBadges ?? true;
  const showTwitchEmotes = chatPrefs?.showTwitchEmotes ?? true;
  const showThirdPartyEmotes = chatPrefs?.showThirdPartyEmotes ?? true;
  const fontFamily = chatPrefs?.fontFamily || undefined;
  const messageLayout = chatPrefs?.messageLayout ?? "inline";
  const textAlign = chatPrefs?.textAlign ?? "left";

  const isStacked = messageLayout === "stacked";

  return (
    <div
      className={cn(
        "group flex rounded-md transition-colors",
        "hover:bg-white/[0.03]",
        isModerator && "bg-emerald-500/[0.06] hover:bg-emerald-500/[0.08]",
        fontSizeClasses[fontSize],
        densityClasses[density],
        isStacked ? "flex-col gap-0.5" : "items-start gap-2.5",
        textAlignClasses[textAlign],
        className
      )}
      style={fontFamily ? { fontFamily } : undefined}
    >
      {/* Header row: platform badge, avatar, username, badges */}
      <div
        className={cn(
          "flex items-center gap-2",
          isStacked && flexAlignClasses[textAlign]
        )}
      >
        {showPlatform && <PlatformBadge platform={platform} className="shrink-0" />}

        {showAvatars && author.avatar && (
          <Image
            src={author.avatar}
            alt={author.displayName}
            width={avatarSizePx[fontSize]}
            height={avatarSizePx[fontSize]}
            className={cn(
              "rounded-full shrink-0 ring-1 ring-white/10",
              avatarSizeClasses[fontSize]
            )}
            unoptimized
          />
        )}

        <span className="inline-flex items-center gap-1.5">
          <span
            className="font-semibold"
            style={{ color: author.color || "hsl(var(--foreground))" }}
          >
            {author.displayName}
          </span>
          {showBadges && isModerator && (
            <span 
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
              title="Moderator"
            >
              MOD
            </span>
          )}
          {showBadges && isSubscriber && (
            <span 
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-primary/20 text-primary ring-1 ring-primary/30"
              title="Subscriber"
            >
              SUB
            </span>
          )}
        </span>

        {/* Colon only for inline layout */}
        {!isStacked && <span className="text-muted-foreground/60">:</span>}
      </div>

      {/* Message content */}
      <div className={cn("min-w-0", !isStacked && "flex-1")}>
        <span className="break-words text-foreground/90 leading-relaxed">
          {renderMessageWithEmotes(
            content,
            emotes,
            fontSize,
            thirdPartyEmotes,
            { showTwitchEmotes, showThirdPartyEmotes }
          )}
        </span>
      </div>
    </div>
  );
}
