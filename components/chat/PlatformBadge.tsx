import type { ChatPlatform } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

type PlatformBadgeProps = {
  platform: ChatPlatform;
  size?: "sm" | "md";
  className?: string;
};

const platformConfig: Record<
  ChatPlatform,
  { icon: string; bg: string; glow: string; label: string }
> = {
  twitch: {
    icon: "T",
    bg: "bg-[#9146FF]",
    glow: "shadow-[0_0_8px_rgba(145,70,255,0.5)]",
    label: "Twitch",
  },
  youtube: {
    icon: "Y",
    bg: "bg-[#FF0000]",
    glow: "shadow-[0_0_8px_rgba(255,0,0,0.5)]",
    label: "YouTube",
  },
  discord: {
    icon: "D",
    bg: "bg-[#5865F2]",
    glow: "shadow-[0_0_8px_rgba(88,101,242,0.5)]",
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
        config.bg,
        config.glow,
        size === "sm" ? "h-4 w-4 text-[10px]" : "h-6 w-6 text-xs",
        className
      )}
      title={config.label}
    >
      {config.icon}
    </span>
  );
}
