"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Tv, Youtube, MessageCircle, Target, Key, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useConfig } from "@/features/config/useConfig";
import { DiscordChannelPicker } from "@/components/DiscordChannelPicker";
import { cn } from "@/lib/ui/cn";

type ConfigHook = ReturnType<typeof useConfig>;

type SettingsFormProps = {
  config: ConfigHook["config"];
  loading: ConfigHook["loading"];
  saving: ConfigHook["saving"];
  error: ConfigHook["error"];
  update: ConfigHook["update"];
  reset: ConfigHook["reset"];
};

// Collapsible section component
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  variant = "default",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "danger";
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 text-left group"
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            !isOpen && "-rotate-90"
          )}
        />
        <Icon
          className={cn(
            "h-5 w-5",
            variant === "danger" ? "text-destructive" : "text-primary"
          )}
        />
        <span
          className={cn(
            "text-xl font-medium tracking-wide",
            variant === "danger" ? "text-destructive" : "text-foreground/80"
          )}
        >
          {title}
        </span>
      </button>
      {isOpen && <div className="mt-6 space-y-1">{children}</div>}
    </div>
  );
}

// Setting row component
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground/60" />}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {description && (
          <p className="mt-1 text-sm text-foreground/70">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// Pill button group component
function PillButton({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "primary" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-all border",
        "first:rounded-l-md last:rounded-r-md",
        active
          ? variant === "danger"
            ? "bg-destructive/20 border-destructive text-destructive"
            : "bg-primary/20 border-primary text-primary"
          : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// Text input with monkeytype style
function SettingInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-64 bg-transparent border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground/50"
    />
  );
}

function SettingsForm({
  config,
  loading,
  saving,
  error,
  update,
  reset,
}: SettingsFormProps) {
  const [twitchChannel, setTwitchChannel] = useState(
    () => config.platforms.twitch.defaultChannel
  );
  const [youtubeChannelId, setYoutubeChannelId] = useState(
    () => config.platforms.youtube.defaultChannelId
  );
  const [youtubeVideoId, setYoutubeVideoId] = useState(
    () => config.platforms.youtube.defaultVideoId
  );
  const [discordChannelId, setDiscordChannelId] = useState(
    () => config.platforms.discord.defaultChannelId
  );
  const [followerTarget, setFollowerTarget] = useState(
    () => config.goals.followerTarget.toString()
  );

  const handleSave = async () => {
    try {
      await update({
        platforms: {
          twitch: { defaultChannel: twitchChannel },
          youtube: {
            defaultChannelId: youtubeChannelId,
            defaultVideoId: youtubeVideoId,
          },
          discord: { defaultChannelId: discordChannelId },
        },
        goals: {
          followerTarget: parseInt(followerTarget, 10) || 15000,
        },
      });
      toast.success("Settings saved", {
        description: "Your configuration has been updated.",
      });
    } catch {
      toast.error("Failed to save settings", {
        description: "Please try again.",
      });
    }
  };

  const handleReset = async () => {
    try {
      await reset();
      // Update local state to match reset values
      setTwitchChannel("");
      setYoutubeChannelId("");
      setYoutubeVideoId("");
      setDiscordChannelId("");
      setFollowerTarget("15000");
      toast.success("Settings reset", {
        description: "All settings have been restored to defaults.",
      });
    } catch {
      toast.error("Failed to reset settings", {
        description: "Please try again.",
      });
    }
  };

  const hasChanges =
    twitchChannel !== config.platforms.twitch.defaultChannel ||
    youtubeChannelId !== config.platforms.youtube.defaultChannelId ||
    youtubeVideoId !== config.platforms.youtube.defaultVideoId ||
    discordChannelId !== config.platforms.discord.defaultChannelId ||
    followerTarget !== config.goals.followerTarget.toString();

  return (
    <div className="max-w-4xl pb-24">
      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            {error && (
              <span className="text-destructive">{error}</span>
            )}
            {loading && (
              <span className="text-muted-foreground">Loading...</span>
            )}
            {hasChanges && !saving && (
              <span className="text-muted-foreground">You have unsaved changes</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md transition-all",
              hasChanges
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        {/* Spacer for any additional header content */}
      </div>

      {/* Twitch Section */}
      <Section title="twitch" icon={Tv}>
        <SettingRow
          label="default channel"
          description="This channel will be used by default when connecting to Twitch chat."
        >
          <SettingInput
            value={twitchChannel}
            onChange={setTwitchChannel}
            placeholder="your_channel"
            disabled={loading}
          />
        </SettingRow>

        <SettingRow
          label="oauth connection"
          description="Required for chat and user-specific data. Connect your Twitch account to enable all features."
        >
          <Link
            href="/api/twitch/auth"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border/50 rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            connect
          </Link>
        </SettingRow>
      </Section>

      {/* YouTube Section */}
      <Section title="youtube" icon={Youtube}>
        <SettingRow
          label="channel id"
          description="Your YouTube channel ID for fetching subscriber stats."
        >
          <SettingInput
            value={youtubeChannelId}
            onChange={setYoutubeChannelId}
            placeholder="UCxxxxxxxxxxxxxxxxxx"
            disabled={loading}
          />
        </SettingRow>

        <SettingRow
          label="video id / url"
          description="Enter a YouTube video ID or full URL. No OAuth required with masterchat."
        >
          <SettingInput
            value={youtubeVideoId}
            onChange={setYoutubeVideoId}
            placeholder="dQw4w9WgXcQ or https://youtube.com/watch?v=..."
            disabled={loading}
          />
        </SettingRow>
      </Section>

      {/* Discord Section */}
      <Section title="discord" icon={MessageCircle}>
        <SettingRow
          label="default channel"
          description="Select a Discord channel to monitor for chat messages."
        >
          <div className="w-64">
            <DiscordChannelPicker
              selectedChannelId={discordChannelId}
              onChannelSelect={(channelId) => setDiscordChannelId(channelId)}
            />
          </div>
        </SettingRow>

        <SettingRow
          label="channel id (manual)"
          description="Enable Developer Mode in Discord, right-click a channel, and copy the Channel ID."
        >
          <SettingInput
            value={discordChannelId}
            onChange={setDiscordChannelId}
            placeholder="channel id"
            disabled={loading}
          />
        </SettingRow>
      </Section>

      {/* Goals Section */}
      <Section title="goals" icon={Target}>
        <SettingRow
          label="follower target"
          description="Target follower count displayed in the goal widget progress bar."
        >
          <SettingInput
            value={followerTarget}
            onChange={setFollowerTarget}
            placeholder="15000"
            disabled={loading}
            type="number"
          />
        </SettingRow>
      </Section>

      {/* Environment Variables Section */}
      <Section title="environment" icon={Key} defaultOpen={false}>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Required API credentials. Set these in your <code className="text-primary">.env.local</code> file.
          </p>
          <pre className="text-xs text-muted-foreground/70 font-mono leading-relaxed">
{`TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=`}
          </pre>
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="danger zone" icon={RotateCcw} variant="danger" defaultOpen={false}>
        <SettingRow
          label="reset all settings"
          description="Reset all settings to their default values. This action cannot be undone."
        >
          <div className="flex">
            <PillButton onClick={handleReset} variant="danger" active>
              {saving ? "resetting..." : "reset to defaults"}
            </PillButton>
          </div>
        </SettingRow>
      </Section>
    </div>
  );
}

export default function SettingsPage() {
  const { config, loading, saving, error, update, reset } = useConfig();

  const formKey = [
    config.platforms.twitch.defaultChannel,
    config.platforms.youtube.defaultChannelId,
    config.platforms.youtube.defaultVideoId,
    config.platforms.discord.defaultChannelId,
    config.goals.followerTarget,
  ].join("|");

  return (
    <SettingsForm
      key={formKey}
      config={config}
      loading={loading}
      saving={saving}
      error={error}
      update={update}
      reset={reset}
    />
  );
}
