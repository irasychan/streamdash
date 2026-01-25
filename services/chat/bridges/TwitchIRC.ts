import type { ChatMessage, ChatBadge, ChatEmote } from "@/features/chat/types/chat";
import { getUsernameColor } from "@/lib/chat/usernameColor";

type MessageCallback = (message: ChatMessage) => void;

const TWITCH_IRC_URL = "wss://irc-ws.chat.twitch.tv:443";
const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 60000;

export class TwitchIRC {
  private channel: string;
  private accessToken?: string;
  private username?: string;
  private ws: WebSocket | null = null;
  private messageCallback: MessageCallback | null = null;
  private connected = false;
  private reconnecting = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(channel: string, accessToken?: string, username?: string) {
    this.channel = channel.toLowerCase().replace(/^#/, "");
    this.accessToken = accessToken;
    this.username = username?.toLowerCase();
  }

  public onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(TWITCH_IRC_URL);

        this.ws.onopen = () => {
          if (!this.ws) return;

          // Request capabilities for tags (badges, colors, emotes)
          this.ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands");

          // Authenticate
          if (this.accessToken && this.username) {
            this.ws.send(`PASS oauth:${this.accessToken}`);
            this.ws.send(`NICK ${this.username}`);
          } else {
            // Anonymous connection
            this.ws.send(`NICK justinfan${Math.floor(Math.random() * 99999)}`);
          }

          // Join channel
          this.ws.send(`JOIN #${this.channel}`);

          this.connected = true;
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("[TwitchIRC] WebSocket error:", error);
          if (!this.connected) {
            reject(error);
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.stopPingInterval();
          if (!this.reconnecting) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.reconnecting = true; // Prevent auto-reconnect
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getChannel(): string {
    return this.channel;
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.connected) {
        this.ws.send("PING :tmi.twitch.tv");
      }
    }, PING_INTERVAL);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      if (!this.reconnecting) {
        this.connect().catch(console.error);
      }
    }, RECONNECT_DELAY);
  }

  private handleMessage(raw: string): void {
    const lines = raw.split("\r\n").filter(Boolean);

    for (const line of lines) {
      // Handle PING
      if (line.startsWith("PING")) {
        this.ws?.send("PONG :tmi.twitch.tv");
        continue;
      }

      // Parse PRIVMSG (chat messages)
      if (line.includes("PRIVMSG")) {
        const message = this.parsePrivmsg(line);
        if (message && this.messageCallback) {
          this.messageCallback(message);
        }
      }
    }
  }

  private parsePrivmsg(raw: string): ChatMessage | null {
    try {
      // Format: @tags :user!user@user.tmi.twitch.tv PRIVMSG #channel :message
      const tagMatch = raw.match(/^@([^ ]+)/);
      const userMatch = raw.match(/:([^!]+)!/);
      const messageMatch = raw.match(/PRIVMSG #[^ ]+ :(.*)$/);

      if (!userMatch || !messageMatch) {
        return null;
      }

      const tags = this.parseTags(tagMatch?.[1] || "");
      const username = userMatch[1];
      const content = messageMatch[1];

      return {
        id: `twitch-${tags["id"] || `${Date.now()}-${Math.random()}`}`,
        platform: "twitch",
        timestamp: parseInt(tags["tmi-sent-ts"] || String(Date.now())),
        author: {
          id: tags["user-id"] || username,
          name: username,
          displayName: tags["display-name"] || username,
          color: tags["color"] || getUsernameColor(username),
          badges: this.parseBadges(tags["badges"]),
        },
        content,
        emotes: this.parseEmotes(tags["emotes"], content),
        isModerator: tags["mod"] === "1",
        isSubscriber: tags["subscriber"] === "1",
      };
    } catch (error) {
      console.error("[TwitchIRC] Failed to parse message:", error);
      return null;
    }
  }

  private parseTags(tagString: string): Record<string, string> {
    const tags: Record<string, string> = {};
    if (!tagString) return tags;

    for (const tag of tagString.split(";")) {
      const [key, value] = tag.split("=");
      if (key) {
        tags[key] = value || "";
      }
    }
    return tags;
  }

  private parseBadges(badgeString?: string): ChatBadge[] {
    if (!badgeString) return [];

    return badgeString.split(",").map((badge) => {
      const [name, version] = badge.split("/");
      return {
        id: badge,
        name: name || badge,
        imageUrl: `https://static-cdn.jtvnw.net/badges/v1/${name}/${version}/1`,
      };
    });
  }

  /**
   * Parse Twitch emote tags into ChatEmote array
   * Format: emotes=emoteId:start-end,start-end/emoteId:start-end
   * Example: emotes=25:0-4,6-10/1902:12-16
   */
  private parseEmotes(emoteString?: string, content?: string): ChatEmote[] {
    if (!emoteString || !content) return [];

    const emotes: ChatEmote[] = [];

    // Split by "/" to get each emote type
    const emoteGroups = emoteString.split("/");

    for (const group of emoteGroups) {
      const [emoteId, positions] = group.split(":");
      if (!emoteId || !positions) continue;

      // Split positions by "," for multiple occurrences
      const positionList = positions.split(",");

      for (const pos of positionList) {
        const [startStr, endStr] = pos.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end)) continue;

        // Extract the emote name from content (end is inclusive in Twitch)
        const emoteName = content.substring(start, end + 1);

        emotes.push({
          id: emoteId,
          name: emoteName,
          start,
          end: end + 1, // Convert to exclusive end for easier substring operations
          imageUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0`,
        });
      }
    }

    // Sort by start position for easier rendering
    return emotes.sort((a, b) => a.start - b.start);
  }
}
