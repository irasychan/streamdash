"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Guild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
};

type Channel = {
  id: string;
  name: string;
  category: string | null;
};

type DiscordChannelPickerProps = {
  onChannelSelect: (channelId: string, channelName: string) => void;
  selectedChannelId?: string;
};

export function DiscordChannelPicker({
  onChannelSelect,
  selectedChannelId,
}: DiscordChannelPickerProps) {
  const [discordStatus, setDiscordStatus] = useState<{
    connected: boolean;
    expired?: boolean;
    user?: string | null;
  } | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  // Check Discord auth status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/discord/status");
        const data = await response.json();
        setDiscordStatus(data);
      } catch {
        setDiscordStatus({ connected: false });
      }
    };
    checkStatus();
  }, []);

  // Load guilds when connected
  useEffect(() => {
    if (!discordStatus?.connected) return;

    const loadGuilds = async () => {
      setLoadingGuilds(true);
      setError("");
      try {
        const response = await fetch("/api/discord/guilds");
        const data = await response.json();

        if (data.rateLimited) {
          const retrySeconds = data.retryAfter || 5;
          setError(`Rate limited. Retrying in ${retrySeconds}s...`);
          setRetryCountdown(retrySeconds);
          return;
        }

        if (data.needsRefresh) {
          // Try to refresh token
          setRefreshing(true);
          const refreshResponse = await fetch("/api/discord/refresh", {
            method: "POST",
          });
          const refreshData = await refreshResponse.json();
          setRefreshing(false);

          if (refreshData.ok) {
            // Retry loading guilds
            const retryResponse = await fetch("/api/discord/guilds");
            const retryData = await retryResponse.json();
            if (retryData.ok) {
              setGuilds(retryData.data);
            } else {
              setError(retryData.error || "Failed to load servers");
            }
          } else {
            setError("Session expired. Please reconnect Discord.");
          }
        } else if (data.ok) {
          setGuilds(data.data);
        } else {
          setError(data.error || "Failed to load servers");
        }
      } catch {
        setError("Failed to load servers");
      } finally {
        setLoadingGuilds(false);
      }
    };

    loadGuilds();
  }, [discordStatus?.connected]);

  // Load channels when guild is selected
  useEffect(() => {
    if (!selectedGuildId) {
      setChannels([]);
      return;
    }

    const loadChannels = async () => {
      setLoadingChannels(true);
      setError("");
      try {
        const response = await fetch(
          `/api/discord/channels?guildId=${selectedGuildId}`
        );
        const data = await response.json();

        if (data.rateLimited) {
          const retrySeconds = data.retryAfter || 5;
          setError(`Rate limited. Please wait ${retrySeconds}s before selecting a server.`);
          return;
        }

        if (data.ok) {
          setChannels(data.data);
        } else {
          setError(data.error || "Failed to load channels");
        }
      } catch {
        setError("Failed to load channels");
      } finally {
        setLoadingChannels(false);
      }
    };

    loadChannels();
  }, [selectedGuildId]);

  // Rate limit countdown and auto-retry
  useEffect(() => {
    if (retryCountdown <= 0) return;

    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          // Trigger reload by toggling connected status effect
          setError("");
          // Re-fetch guilds
          if (discordStatus?.connected) {
            fetch("/api/discord/guilds")
              .then((res) => res.json())
              .then((data) => {
                if (data.ok) {
                  setGuilds(data.data);
                } else if (data.rateLimited) {
                  setError(`Rate limited. Retrying in ${data.retryAfter || 5}s...`);
                  setRetryCountdown(data.retryAfter || 5);
                } else {
                  setError(data.error || "Failed to load servers");
                }
              })
              .catch(() => setError("Failed to load servers"));
          }
          return 0;
        }
        setError(`Rate limited. Retrying in ${prev - 1}s...`);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryCountdown, discordStatus?.connected]);

  const handleChannelSelect = (channel: Channel) => {
    onChannelSelect(channel.id, `#${channel.name}`);
  };

  // Not authenticated
  if (discordStatus && !discordStatus.connected) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Connect your Discord account to browse servers and channels.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/discord/auth">Connect Discord</a>
        </Button>
      </div>
    );
  }

  // Loading initial status
  if (!discordStatus) {
    return (
      <p className="text-sm text-muted-foreground">Checking Discord status...</p>
    );
  }

  return (
    <div className="space-y-3">
      {discordStatus.user && (
        <p className="text-xs text-muted-foreground">
          Signed in as <span className="font-medium">{discordStatus.user}</span>
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {refreshing && (
        <p className="text-xs text-muted-foreground">Refreshing session...</p>
      )}

      {/* Guild selector */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          Server
        </label>
        <select
          value={selectedGuildId}
          onChange={(e) => setSelectedGuildId(e.target.value)}
          disabled={loadingGuilds || guilds.length === 0}
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">
            {loadingGuilds
              ? "Loading servers..."
              : guilds.length === 0
              ? "No servers found"
              : "Select a server"}
          </option>
          {guilds.map((guild) => (
            <option key={guild.id} value={guild.id}>
              {guild.name}
            </option>
          ))}
        </select>
      </div>

      {/* Channel selector */}
      {selectedGuildId && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Channel
          </label>
          {loadingChannels ? (
            <p className="text-xs text-muted-foreground">Loading channels...</p>
          ) : channels.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No text channels found. Make sure the bot has access.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-md border border-border/40 bg-background/50">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                    selectedChannelId === channel.id
                      ? "bg-primary/20 text-primary"
                      : ""
                  }`}
                >
                  <span className="text-muted-foreground">#</span> {channel.name}
                  {channel.category && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({channel.category})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual entry fallback */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Enter channel ID manually
        </summary>
        <p className="mt-2 text-muted-foreground">
          Enable Developer Mode in Discord settings, then right-click a channel
          and select &quot;Copy Channel ID&quot;.
        </p>
      </details>
    </div>
  );
}
