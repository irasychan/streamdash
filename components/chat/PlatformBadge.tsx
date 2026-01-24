import type { ChatPlatform } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

type PlatformBadgeProps = {
  platform: ChatPlatform;
  size?: "sm" | "md";
  className?: string;
};

const platformConfig: Record<
  ChatPlatform,
  { icon: string; color: string; label: string }
> = {
  twitch: {
    icon: "T",
    color: "bg-[#9146FF]",
    label: "Twitch",
  },
  youtube: {
    icon: "Y",
    color: "bg-[#FF0000]",
    label: "YouTube",
  },
  discord: {
    icon: "D",
    color: "bg-[#5865F2]",
    label: "Discord",
  },
};

export function PlatformBadge({
  platform,
  size = "sm",
  className,
}: PlatformBadgeProps) {
  const config = platformConfig[platform];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-bold text-white",
        config.color,
        size === "sm" ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-xs",
        className
      )}
      title={config.label}
    >
      {config.icon}
    </span>
  );
}
