"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "@/features/config/useConfig";
import { usePreferences } from "@/features/preferences/usePreferences";
import { DiscordChannelPicker } from "@/components/DiscordChannelPicker";
import type { FontSize, MessageDensity, ThemePreset } from "@/features/preferences/types";
import { THEME_PRESETS } from "@/features/preferences/types";

type ConfigHook = ReturnType<typeof useConfig>;
type PreferencesHook = ReturnType<typeof usePreferences>;

type SettingsFormProps = {
  config: ConfigHook["config"];
  loading: ConfigHook["loading"];
  saving: ConfigHook["saving"];
  error: ConfigHook["error"];
  update: ConfigHook["update"];
  reset: ConfigHook["reset"];
  preferences: PreferencesHook["preferences"];
  updatePreferences: PreferencesHook["update"];
  resetPreferences: PreferencesHook["reset"];
};

function SettingsForm({
  config,
  loading,
  saving,
  error,
  update,
  reset,
  preferences,
  updatePreferences,
  resetPreferences,
}: SettingsFormProps) {
  // Local state for form inputs (initialized from config)
  const [twitchChannel, setTwitchChannel] = useState(
    () => config.platforms.twitch.defaultChannel
  );
  const [youtubeChannelId, setYoutubeChannelId] = useState(
    () => config.platforms.youtube.defaultChannelId
  );
  const [youtubeLiveChatId, setYoutubeLiveChatId] = useState(
    () => config.platforms.youtube.defaultLiveChatId
  );
  const [discordChannelId, setDiscordChannelId] = useState(
    () => config.platforms.discord.defaultChannelId
  );
  const [followerTarget, setFollowerTarget] = useState(
    () => config.goals.followerTarget.toString()
  );

  const handleSave = async () => {
    await update({
      platforms: {
        twitch: { defaultChannel: twitchChannel },
        youtube: {
          defaultChannelId: youtubeChannelId,
          defaultLiveChatId: youtubeLiveChatId,
        },
        discord: { defaultChannelId: discordChannelId },
      },
      goals: {
        followerTarget: parseInt(followerTarget, 10) || 15000,
      },
    });
  };

  const handleReset = async () => {
    await reset();
  };

  const hasChanges =
    twitchChannel !== config.platforms.twitch.defaultChannel ||
    youtubeChannelId !== config.platforms.youtube.defaultChannelId ||
    youtubeLiveChatId !== config.platforms.youtube.defaultLiveChatId ||
    discordChannelId !== config.platforms.discord.defaultChannelId ||
    followerTarget !== config.goals.followerTarget.toString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Settings</h2>
          <p className="mt-1 text-muted-foreground">
            Configure your streaming dashboard and platform connections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-destructive">{error}</span>
          )}
          {loading && (
            <span className="text-xs text-muted-foreground">Loading...</span>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Twitch Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Twitch</CardTitle>
                <CardDescription>Connect your Twitch account for live stats and chat</CardDescription>
              </div>
              <Badge variant="outline">OAuth Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitch-channel">Default Channel</Label>
              <Input
                id="twitch-channel"
                placeholder="your_twitch_channel"
                value={twitchChannel}
                onChange={(e) => setTwitchChannel(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                This channel will be used by default when connecting to Twitch chat
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">OAuth Connection</p>
                <p className="text-xs text-muted-foreground">
                  Required for chat and user-specific data
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/twitch/auth">Connect Twitch</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* YouTube Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">YouTube</CardTitle>
                <CardDescription>Connect your YouTube account for subscriber stats and live chat</CardDescription>
              </div>
              <Badge variant="outline">OAuth Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-channel">Channel ID</Label>
              <Input
                id="youtube-channel"
                placeholder="UCxxxxxxxxxxxxxxxxxx"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Your YouTube channel ID for fetching subscriber stats
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube-livechat">Default Live Chat ID</Label>
              <Input
                id="youtube-livechat"
                placeholder="Live chat ID from YouTube stream"
                value={youtubeLiveChatId}
                onChange={(e) => setYoutubeLiveChatId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                The live chat ID changes for each stream
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">OAuth Connection</p>
                <p className="text-xs text-muted-foreground">
                  Required for live chat access
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/youtube/auth">Connect YouTube</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Discord Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Discord</CardTitle>
                <CardDescription>Connect Discord for server chat integration</CardDescription>
              </div>
              <Badge variant="outline">Bot Token Required</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Channel</Label>
              <DiscordChannelPicker
                selectedChannelId={discordChannelId}
                onChannelSelect={(channelId) => setDiscordChannelId(channelId)}
              />
              {discordChannelId && (
                <p className="text-xs text-muted-foreground">
                  Selected: <code className="rounded bg-muted px-1">{discordChannelId}</code>
                </p>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="discord-channel-manual">Or enter Channel ID manually</Label>
              <Input
                id="discord-channel-manual"
                placeholder="Discord channel ID"
                value={discordChannelId}
                onChange={(e) => setDiscordChannelId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enable Developer Mode in Discord, right-click a channel → Copy Channel ID
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Goals Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Goals</CardTitle>
            <CardDescription>Configure your streaming goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="follower-target">Follower Target</Label>
              <Input
                id="follower-target"
                type="number"
                placeholder="15000"
                value={followerTarget}
                onChange={(e) => setFollowerTarget(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Target follower count for the progress bar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Appearance</CardTitle>
            <CardDescription>
              Customize chat display and theme (saved to this browser)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((preset) => {
                  const theme = THEME_PRESETS[preset];
                  const isSelected = preferences.theme.preset === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => updatePreferences({ theme: { preset } })}
                      className={`relative rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border/60 hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ background: theme.colors.neonPink }}
                        />
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ background: theme.colors.neonCyan }}
                        />
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ background: theme.colors.neonViolet }}
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium">{theme.name}</p>
                      <p className="text-xs text-muted-foreground">{theme.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Chat Display Options */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={preferences.chat.fontSize}
                  onValueChange={(value: FontSize) =>
                    updatePreferences({ chat: { fontSize: value } })
                  }
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

              <div className="space-y-2">
                <Label htmlFor="message-density">Message Density</Label>
                <Select
                  value={preferences.chat.messageDensity}
                  onValueChange={(value: MessageDensity) =>
                    updatePreferences({ chat: { messageDensity: value } })
                  }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-family">Custom Font Family</Label>
              <Input
                id="font-family"
                placeholder="e.g., Inter, Roboto Mono, system-ui"
                value={preferences.chat.fontFamily}
                onChange={(e) =>
                  updatePreferences({ chat: { fontFamily: e.target.value } })
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for system default. Font must be installed on your system.
              </p>
            </div>

            <Separator />

            {/* Toggle Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-avatars">Show Avatars</Label>
                  <p className="text-xs text-muted-foreground">
                    Display user profile pictures in chat
                  </p>
                </div>
                <Switch
                  id="show-avatars"
                  checked={preferences.chat.showAvatars}
                  onCheckedChange={(checked) =>
                    updatePreferences({ chat: { showAvatars: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-badges">Show Badges</Label>
                  <p className="text-xs text-muted-foreground">
                    Display moderator/subscriber badges
                  </p>
                </div>
                <Switch
                  id="show-badges"
                  checked={preferences.chat.showBadges}
                  onCheckedChange={(checked) =>
                    updatePreferences({ chat: { showBadges: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-twitch-emotes">Twitch Emotes</Label>
                  <p className="text-xs text-muted-foreground">
                    Display native Twitch emotes in chat
                  </p>
                </div>
                <Switch
                  id="show-twitch-emotes"
                  checked={preferences.chat.showTwitchEmotes}
                  onCheckedChange={(checked) =>
                    updatePreferences({ chat: { showTwitchEmotes: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-third-party-emotes">Third-Party Emotes</Label>
                  <p className="text-xs text-muted-foreground">
                    Display BTTV, FFZ, and 7TV emotes
                  </p>
                </div>
                <Switch
                  id="show-third-party-emotes"
                  checked={preferences.chat.showThirdPartyEmotes}
                  onCheckedChange={(checked) =>
                    updatePreferences({ chat: { showThirdPartyEmotes: checked } })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Background Opacity (for OBS) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Background Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {preferences.theme.backgroundOpacity}%
                </span>
              </div>
              <Slider
                value={[preferences.theme.backgroundOpacity]}
                onValueChange={([value]) =>
                  updatePreferences({ theme: { backgroundOpacity: value } })
                }
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Reduce for transparent OBS overlays. 100% = fully opaque.
              </p>
            </div>

            <Separator />

            <Button variant="outline" size="sm" onClick={resetPreferences}>
              Reset Appearance to Defaults
            </Button>
          </CardContent>
        </Card>

        {/* Save Actions */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading || saving || !hasChanges}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading || saving}
                >
                  Reset to Defaults
                </Button>
              </div>
              {hasChanges && !saving && (
                <span className="text-xs text-muted-foreground">Unsaved changes</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Info */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Environment Variables</CardTitle>
            <CardDescription>Required API credentials (set in .env.local)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted/30 p-4 font-mono text-xs">
              <pre className="text-muted-foreground whitespace-pre-wrap">
{`# Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# YouTube  
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { config, loading, saving, error, update, reset } = useConfig();
  const { preferences, update: updatePreferences, reset: resetPreferences } = usePreferences();

  const formKey = [
    config.platforms.twitch.defaultChannel,
    config.platforms.youtube.defaultChannelId,
    config.platforms.youtube.defaultLiveChatId,
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
      preferences={preferences}
      updatePreferences={updatePreferences}
      resetPreferences={resetPreferences}
    />
  );
}
