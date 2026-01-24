import type { ChatMessage as ChatMessageType } from "@/lib/types/chat";
import { PlatformBadge } from "./PlatformBadge";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: ChatMessageType;
  showPlatform?: boolean;
  className?: string;
};

export function ChatMessage({
  message,
  showPlatform = true,
  className,
}: ChatMessageProps) {
  const { author, content, platform, isModerator, isSubscriber } = message;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-white/5",
        isModerator && "bg-emerald-500/10",
        className
      )}
    >
      {showPlatform && <PlatformBadge platform={platform} className="mt-0.5 shrink-0" />}

      {author.avatar && (
        <img
          src={author.avatar}
          alt={author.displayName}
          className="h-5 w-5 rounded-full shrink-0 mt-0.5"
        />
      )}

      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1">
          <span
            className="font-semibold"
            style={{ color: author.color || "var(--foreground)" }}
          >
            {author.displayName}
          </span>
          {isModerator && (
            <span className="text-[10px] text-emerald-400" title="Moderator">
              MOD
            </span>
          )}
          {isSubscriber && (
            <span className="text-[10px] text-primary" title="Subscriber">
              SUB
            </span>
          )}
        </span>
        <span className="text-muted-foreground">: </span>
        <span className="break-words text-foreground">{content}</span>
      </div>
    </div>
  );
}
