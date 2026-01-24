import type { ChatEmote } from "@/lib/types/chat";
import type { ReactNode } from "react";
import type { ThirdPartyEmote } from "@/hooks/useEmotes";

type EmoteSizeClass = "small" | "medium" | "large";

const EMOTE_SIZE_CLASSES: Record<EmoteSizeClass, string> = {
  small: "h-4 w-auto",
  medium: "h-5 w-auto",
  large: "h-6 w-auto",
};

type MessageSegment =
  | { type: "text"; content: string }
  | { type: "emote"; emote: ChatEmote }
  | { type: "thirdPartyEmote"; emote: ThirdPartyEmote };

type EmoteRenderOptions = {
  showTwitchEmotes?: boolean;
  showThirdPartyEmotes?: boolean;
};

/**
 * Split message content into text and emote segments based on emote positions
 */
export function parseMessageSegments(
  content: string,
  emotes?: ChatEmote[]
): MessageSegment[] {
  if (!emotes || emotes.length === 0) {
    return [{ type: "text", content }];
  }

  const segments: MessageSegment[] = [];
  let lastIndex = 0;

  // Emotes should already be sorted by start position from parser
  for (const emote of emotes) {
    // Add text before this emote
    if (emote.start > lastIndex) {
      const textContent = content.substring(lastIndex, emote.start);
      if (textContent) {
        segments.push({ type: "text", content: textContent });
      }
    }

    // Add the emote
    segments.push({ type: "emote", emote });
    lastIndex = emote.end;
  }

  // Add remaining text after last emote
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex);
    if (textContent) {
      segments.push({ type: "text", content: textContent });
    }
  }

  return segments;
}

/**
 * Scan text for third-party emotes and split into segments
 */
export function parseThirdPartyEmotes(
  text: string,
  emoteMap: Map<string, ThirdPartyEmote>
): MessageSegment[] {
  if (emoteMap.size === 0) {
    return [{ type: "text", content: text }];
  }

  const segments: MessageSegment[] = [];
  const words = text.split(/(\s+)/); // Split keeping whitespace

  for (const word of words) {
    // Check if this word is an emote
    const emote = emoteMap.get(word);
    if (emote) {
      segments.push({ type: "thirdPartyEmote", emote });
    } else if (word) {
      // Merge consecutive text segments
      const lastSegment = segments[segments.length - 1];
      if (lastSegment?.type === "text") {
        lastSegment.content += word;
      } else {
        segments.push({ type: "text", content: word });
      }
    }
  }

  return segments;
}

/**
 * Render message content with inline emotes as React elements
 * Handles both native Twitch emotes and third-party emotes
 */
export function renderMessageWithEmotes(
  content: string,
  emotes?: ChatEmote[],
  size: EmoteSizeClass = "medium",
  thirdPartyEmotes?: Map<string, ThirdPartyEmote>,
  options: EmoteRenderOptions = {}
): ReactNode {
  const { showTwitchEmotes = true, showThirdPartyEmotes = true } = options;

  // If all emotes are disabled, just return plain text
  if (!showTwitchEmotes && !showThirdPartyEmotes) {
    return <span>{content}</span>;
  }

  // First pass: parse native Twitch emotes (only if enabled)
  const segments = showTwitchEmotes
    ? parseMessageSegments(content, emotes)
    : [{ type: "text" as const, content }];

  // Second pass: scan text segments for third-party emotes (only if enabled)
  const finalSegments: MessageSegment[] = [];
  for (const segment of segments) {
    if (
      segment.type === "text" &&
      showThirdPartyEmotes &&
      thirdPartyEmotes &&
      thirdPartyEmotes.size > 0
    ) {
      const thirdPartySegments = parseThirdPartyEmotes(segment.content, thirdPartyEmotes);
      finalSegments.push(...thirdPartySegments);
    } else {
      finalSegments.push(segment);
    }
  }

  return finalSegments.map((segment, index) => {
    if (segment.type === "text") {
      return <span key={index}>{segment.content}</span>;
    }

    if (segment.type === "emote") {
      return (
        <img
          key={`twitch-${segment.emote.id}-${index}`}
          src={segment.emote.imageUrl}
          alt={segment.emote.name}
          title={segment.emote.name}
          className={`inline-block align-middle ${EMOTE_SIZE_CLASSES[size]}`}
          loading="lazy"
        />
      );
    }

    // Third-party emote
    return (
      <img
        key={`${segment.emote.source}-${segment.emote.id}-${index}`}
        src={segment.emote.url}
        alt={segment.emote.name}
        title={`${segment.emote.name} (${segment.emote.source.toUpperCase()})`}
        className={`inline-block align-middle ${EMOTE_SIZE_CLASSES[size]}`}
        loading="lazy"
      />
    );
  });
}
