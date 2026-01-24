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
        "group flex items-start gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
        "hover:bg-white/[0.03]",
        isModerator && "bg-emerald-500/[0.06] hover:bg-emerald-500/[0.08]",
        className
      )}
    >
      {showPlatform && <PlatformBadge platform={platform} className="mt-0.5 shrink-0" />}

      {author.avatar && (
        <img
          src={author.avatar}
          alt={author.displayName}
          className="h-6 w-6 rounded-full shrink-0 mt-0.5 ring-1 ring-white/10"
        />
      )}

      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="font-semibold"
            style={{ color: author.color || "hsl(var(--foreground))" }}
          >
            {author.displayName}
          </span>
          {isModerator && (
            <span 
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
              title="Moderator"
            >
              MOD
            </span>
          )}
          {isSubscriber && (
            <span 
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-primary/20 text-primary ring-1 ring-primary/30"
              title="Subscriber"
            >
              SUB
            </span>
          )}
        </span>
        <span className="mx-1 text-muted-foreground/60">:</span>
        <span className="break-words text-foreground/90 leading-relaxed">{content}</span>
      </div>
    </div>
  );
}
