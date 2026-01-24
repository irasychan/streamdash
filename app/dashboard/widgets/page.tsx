"use client";

import { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquare, Eye, Save, Loader2 } from "lucide-react";
import { useConfig } from "@/features/config/useConfig";
import { WidgetConfigCard, ChatWidgetConfigForm } from "@/features/widgets/components";
import { generateChatWidgetUrl, generateGoalWidgetUrl, generateStatsWidgetUrl } from "@/services/widgets/urlGenerator";
import {
  DEFAULT_CHAT_WIDGET_CONFIG,
  DEFAULT_GOAL_WIDGET_CONFIG,
  DEFAULT_STATS_WIDGET_CONFIG,
} from "@/features/config/types";
import type { ChatWidgetConfig, GoalWidgetConfig, StatsWidgetConfig } from "@/features/config/types";

export default function WidgetsPage() {
  const { config, loading, saving, update } = useConfig();

  // Merge server config with defaults for widgets
  const chatConfig = useMemo(
    () => ({ ...DEFAULT_CHAT_WIDGET_CONFIG, ...config.widgets?.chat }),
    [config.widgets?.chat]
  );

  const goalConfig = useMemo(
    () => ({ ...DEFAULT_GOAL_WIDGET_CONFIG, ...config.widgets?.goal }),
    [config.widgets?.goal]
  );

  const statsConfig = useMemo(
    () => ({ ...DEFAULT_STATS_WIDGET_CONFIG, ...config.widgets?.stats }),
    [config.widgets?.stats]
  );

  // Generate URLs from config
  const chatUrl = useMemo(
    () => generateChatWidgetUrl(chatConfig, DEFAULT_CHAT_WIDGET_CONFIG),
    [chatConfig]
  );

  const goalUrl = useMemo(
    () => generateGoalWidgetUrl(goalConfig, DEFAULT_GOAL_WIDGET_CONFIG),
    [goalConfig]
  );

  const statsUrl = useMemo(
    () => generateStatsWidgetUrl(statsConfig, DEFAULT_STATS_WIDGET_CONFIG),
    [statsConfig]
  );

  // Update handlers
  const handleChatConfigChange = useCallback(
    async (partial: Partial<ChatWidgetConfig>) => {
      await update({
        widgets: {
          chat: { ...chatConfig, ...partial },
        },
      });
    },
    [update, chatConfig]
  );

  const handleGoalConfigChange = useCallback(
    async (partial: Partial<GoalWidgetConfig>) => {
      await update({
        widgets: {
          goal: { ...goalConfig, ...partial },
        },
      });
    },
    [update, goalConfig]
  );

  const handleStatsConfigChange = useCallback(
    async (partial: Partial<StatsWidgetConfig>) => {
      await update({
        widgets: {
          stats: { ...statsConfig, ...partial },
        },
      });
    },
    [update, statsConfig]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">OBS Widgets</h2>
          <p className="mt-1 text-muted-foreground">
            Configure and generate URLs for your stream overlays.
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {/* Chat Widget */}
        <WidgetConfigCard
          title="Chat Overlay"
          description="Unified chat from Twitch, YouTube, and Discord"
          icon={<MessageSquare className="h-5 w-5 text-primary" />}
          previewUrl={chatUrl}
        >
          <ChatWidgetConfigForm
            config={chatConfig}
            onChange={handleChatConfigChange}
            disabled={loading || saving}
          />
        </WidgetConfigCard>

        {/* Goal Widget */}
        <WidgetConfigCard
          title="Follower Goal"
          description="Show progress towards your follower target"
          icon={<Eye className="h-5 w-5 text-primary" />}
          previewUrl={goalUrl}
        >
          <GoalWidgetConfigForm
            config={goalConfig}
            onChange={handleGoalConfigChange}
            disabled={loading || saving}
          />
        </WidgetConfigCard>

        {/* Stats Widget */}
        <WidgetConfigCard
          title="Stream Stats"
          description="Display live viewer count, followers, and YouTube subs"
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          previewUrl={statsUrl}
        >
          <StatsWidgetConfigForm
            config={statsConfig}
            onChange={handleStatsConfigChange}
            disabled={loading || saving}
          />
        </WidgetConfigCard>
      </div>

      {/* Usage Instructions */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm prose-invert max-w-none">
          <ol className="space-y-2 text-muted-foreground">
            <li>Click <strong>Configure</strong> on any widget to customize its settings</li>
            <li>Settings are saved automatically as you make changes</li>
            <li>Copy the generated URL and add it as a <strong>Browser Source</strong> in OBS</li>
            <li>Recommended dimensions: <code>400x600</code> for chat, <code>400x200</code> for stats/goal</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Goal Widget Config Form (inline for now)
// ============================================================================

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

function GoalWidgetConfigForm({
  config,
  onChange,
  disabled,
}: {
  config: GoalWidgetConfig;
  onChange: (partial: Partial<GoalWidgetConfig>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goal-channel">Twitch Channel</Label>
        <Input
          id="goal-channel"
          placeholder="channel_name"
          value={config.channel}
          onChange={(e) => onChange({ channel: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-title">Title Text</Label>
        <Input
          id="goal-title"
          placeholder="Follower sprint"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bar-color">Progress Bar Color</Label>
        <Input
          id="bar-color"
          placeholder="#7dd3fc (leave empty for default)"
          value={config.barColor}
          onChange={(e) => onChange({ barColor: e.target.value })}
          disabled={disabled}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-percentage">Show Percentage</Label>
            <p className="text-xs text-muted-foreground">Display progress %</p>
          </div>
          <Switch
            id="show-percentage"
            checked={config.showPercentage}
            onCheckedChange={(checked) => onChange({ showPercentage: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-numbers">Show Numbers</Label>
            <p className="text-xs text-muted-foreground">
              Display current/target count
            </p>
          </div>
          <Switch
            id="show-numbers"
            checked={config.showNumbers}
            onCheckedChange={(checked) => onChange({ showNumbers: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="goal-transparent">Transparent Background</Label>
            <p className="text-xs text-muted-foreground">For clean OBS overlays</p>
          </div>
          <Switch
            id="goal-transparent"
            checked={config.transparent}
            onCheckedChange={(checked) => onChange({ transparent: checked })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Widget Config Form (inline for now)
// ============================================================================

function StatsWidgetConfigForm({
  config,
  onChange,
  disabled,
}: {
  config: StatsWidgetConfig;
  onChange: (partial: Partial<StatsWidgetConfig>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stats-channel">Twitch Channel</Label>
          <Input
            id="stats-channel"
            placeholder="channel_name"
            value={config.channel}
            onChange={(e) => onChange({ channel: e.target.value })}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube-channel">YouTube Channel ID</Label>
          <Input
            id="youtube-channel"
            placeholder="UCxxxxxxxx"
            value={config.youtubeChannelId}
            onChange={(e) => onChange({ youtubeChannelId: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube-handle">YouTube Handle (alternative)</Label>
        <Input
          id="youtube-handle"
          placeholder="@handle"
          value={config.youtubeHandle}
          onChange={(e) => onChange({ youtubeHandle: e.target.value })}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Use handle if you don&apos;t have the channel ID
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-viewers">Show Viewers</Label>
            <p className="text-xs text-muted-foreground">Live viewer count</p>
          </div>
          <Switch
            id="show-viewers"
            checked={config.showViewers}
            onCheckedChange={(checked) => onChange({ showViewers: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-subs">Show Subs</Label>
            <p className="text-xs text-muted-foreground">Twitch subscriber count</p>
          </div>
          <Switch
            id="show-subs"
            checked={config.showSubs}
            onCheckedChange={(checked) => onChange({ showSubs: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-youtube-subs">Show YouTube Subs</Label>
            <p className="text-xs text-muted-foreground">YouTube subscriber count</p>
          </div>
          <Switch
            id="show-youtube-subs"
            checked={config.showYoutubeSubs}
            onCheckedChange={(checked) => onChange({ showYoutubeSubs: checked })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="stats-transparent">Transparent Background</Label>
            <p className="text-xs text-muted-foreground">For clean OBS overlays</p>
          </div>
          <Switch
            id="stats-transparent"
            checked={config.transparent}
            onCheckedChange={(checked) => onChange({ transparent: checked })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
