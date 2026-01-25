"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ChatWidgetConfig } from "@/features/config/types";
import type { ChatPlatform } from "@/features/chat/types/chat";

type ChatWidgetConfigFormProps = {
  config: ChatWidgetConfig;
  onChange: (config: Partial<ChatWidgetConfig>) => void;
  disabled?: boolean;
};

const PLATFORMS: { id: ChatPlatform; label: string }[] = [
  { id: "twitch", label: "Twitch" },
  { id: "youtube", label: "YouTube" },
  { id: "discord", label: "Discord" },
];

export function ChatWidgetConfigForm({
  config,
  onChange,
  disabled,
}: ChatWidgetConfigFormProps) {
  const handlePlatformToggle = (platform: ChatPlatform, enabled: boolean) => {
    const newPlatforms = enabled
      ? [...config.platforms, platform]
      : config.platforms.filter((p) => p !== platform);
    onChange({ platforms: newPlatforms });
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div className="space-y-3">
        <Label>Platforms to Display</Label>
        <div className="flex flex-wrap gap-4">
          {PLATFORMS.map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={`platform-${id}`}
                checked={config.platforms.includes(id)}
                onCheckedChange={(checked) =>
                  handlePlatformToggle(id, checked === true)
                }
                disabled={disabled}
              />
              <label
                htmlFor={`platform-${id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Connection Settings */}
      <div className="space-y-4">
        <Label className="text-muted-foreground">Auto-Connect Channels</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="twitch-channel">Twitch Channel</Label>
            <Input
              id="twitch-channel"
              placeholder="channel_name"
              value={config.twitchChannel}
              onChange={(e) => onChange({ twitchChannel: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discord-channel">Discord Channel ID</Label>
            <Input
              id="discord-channel"
              placeholder="123456789"
              value={config.discordChannelId}
              onChange={(e) => onChange({ discordChannelId: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube-video">YouTube Video ID or URL</Label>
          <Input
            id="youtube-video"
            placeholder="dQw4w9WgXcQ or https://youtube.com/watch?v=..."
            value={config.youtubeVideoId}
            onChange={(e) => onChange({ youtubeVideoId: e.target.value })}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter a video ID or full URL. No auth required.
          </p>
        </div>
      </div>

      <Separator />

      {/* Display Settings */}
      <div className="space-y-4">
        <Label className="text-muted-foreground">Display Options</Label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="max-messages">Max Messages</Label>
            <div className="flex items-center gap-3">
              <Slider
                id="max-messages"
                value={[config.maxMessages]}
                onValueChange={([value]) => onChange({ maxMessages: value })}
                min={10}
                max={200}
                step={10}
                className="flex-1"
                disabled={disabled}
              />
              <span className="w-12 text-right text-sm text-muted-foreground">
                {config.maxMessages}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={config.fontSize}
              onValueChange={(value: "small" | "medium" | "large") =>
                onChange({ fontSize: value })
              }
              disabled={disabled}
            >
              <SelectTrigger id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="message-density">Message Spacing</Label>
            <Select
              value={config.messageDensity}
              onValueChange={(value: "compact" | "comfortable" | "spacious") =>
                onChange({ messageDensity: value })
              }
              disabled={disabled}
            >
              <SelectTrigger id="message-density">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="animation">Message Animation</Label>
            <Select
              value={config.animation}
              onValueChange={(value: "none" | "fade" | "slide-left" | "slide-right" | "slide-up" | "slide-down" | "scale" | "bounce") =>
                onChange({ animation: value })
              }
              disabled={disabled}
            >
              <SelectTrigger id="animation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade In</SelectItem>
                <SelectItem value="slide-left">Slide from Left</SelectItem>
                <SelectItem value="slide-right">Slide from Right</SelectItem>
                <SelectItem value="slide-up">Slide from Bottom</SelectItem>
                <SelectItem value="slide-down">Slide from Top</SelectItem>
                <SelectItem value="scale">Scale In</SelectItem>
                <SelectItem value="bounce">Bounce In</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="message-layout">Message Layout</Label>
            <Select
              value={config.messageLayout}
              onValueChange={(value: "inline" | "inline-wrap" | "stacked") =>
                onChange({ messageLayout: value })
              }
              disabled={disabled}
            >
              <SelectTrigger id="message-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline (two columns)</SelectItem>
                <SelectItem value="inline-wrap">Inline Wrap (natural flow)</SelectItem>
                <SelectItem value="stacked">Stacked (name on top)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-align">Text Alignment</Label>
            <Select
              value={config.textAlign}
              onValueChange={(value: "left" | "center" | "right") =>
                onChange({ textAlign: value })
              }
              disabled={disabled}
            >
              <SelectTrigger id="text-align">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Toggle Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="transparent">Transparent Background</Label>
            <p className="text-xs text-muted-foreground">
              For clean OBS overlays
            </p>
          </div>
          <Switch
            id="transparent"
            checked={config.transparent}
            onCheckedChange={(checked) => onChange({ transparent: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-platform">Show Platform Badge</Label>
            <p className="text-xs text-muted-foreground">
              Display Twitch/YouTube/Discord icon
            </p>
          </div>
          <Switch
            id="show-platform"
            checked={config.showPlatformBadge}
            onCheckedChange={(checked) =>
              onChange({ showPlatformBadge: checked })
            }
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-avatars">Show Avatars</Label>
            <p className="text-xs text-muted-foreground">
              Display user profile pictures
            </p>
          </div>
          <Switch
            id="show-avatars"
            checked={config.showAvatars}
            onCheckedChange={(checked) => onChange({ showAvatars: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-badges">Show Badges</Label>
            <p className="text-xs text-muted-foreground">
              Moderator, subscriber badges
            </p>
          </div>
          <Switch
            id="show-badges"
            checked={config.showBadges}
            onCheckedChange={(checked) => onChange({ showBadges: checked })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
