import type {
  ChatMessage,
  ChatPlatform,
  ChatConnectionStatus,
  ChatHideEvent,
  ChatFlushDebugEvent,
  SSEClient,
} from "@/features/chat/types/chat";
import { TwitchIRC } from "./bridges/TwitchIRC";
import {
  YouTubeMasterchat,
  type YouTubeMasterchatError,
} from "./bridges/YouTubeMasterchat";
import { DiscordBridge } from "./bridges/DiscordBridge";

const MESSAGE_BUFFER_SIZE = 100;

class ConnectionManager {
  private static instance: ConnectionManager | null = null;

  private sseClients: Map<string, SSEClient> = new Map();
  private messageBuffer: ChatMessage[] = [];
  private messageIds: Set<string> = new Set();
  private hiddenMessageIds: Set<string> = new Set();

  private twitchIRC: TwitchIRC | null = null;
  private youtubeMasterchat: YouTubeMasterchat | null = null;
  private discordBridge: DiscordBridge | null = null;
  private youtubeError: YouTubeMasterchatError | null = null;

  private constructor() {}

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public addSSEClient(client: SSEClient): void {
    this.sseClients.set(client.id, client);

    // Send buffered messages to new client
    for (const message of this.messageBuffer) {
      client.send(message);
    }
  }

  public removeSSEClient(clientId: string): void {
    this.sseClients.delete(clientId);
  }

  public getClientCount(): number {
    return this.sseClients.size;
  }

  public broadcast(message: ChatMessage): void {
    // Deduplicate messages
    if (this.messageIds.has(message.id)) {
      return;
    }
    this.messageIds.add(message.id);

    // Add to buffer
    this.messageBuffer.push(message);
    if (this.messageBuffer.length > MESSAGE_BUFFER_SIZE) {
      const removed = this.messageBuffer.shift();
      if (removed) {
        this.messageIds.delete(removed.id);
      }
    }

    // Broadcast to all clients
    for (const [clientId, client] of this.sseClients.entries()) {
      try {
        client.send(message);
      } catch (error) {
        // Client disconnected, will be cleaned up
        console.error(
          `Error sending SSE message to client ${clientId}:`,
          error
        );
      }
    }
  }

  public getBuffer(): ChatMessage[] {
    return [...this.messageBuffer];
  }

  public hideMessage(messageId: string): void {
    if (this.hiddenMessageIds.has(messageId)) {
      return; // Already hidden
    }
    this.hiddenMessageIds.add(messageId);
    this.broadcastHideEvent({ type: "hide", messageId });
  }

  public unhideMessage(messageId: string): void {
    if (!this.hiddenMessageIds.has(messageId)) {
      return; // Not hidden
    }
    this.hiddenMessageIds.delete(messageId);
    this.broadcastHideEvent({ type: "unhide", messageId });
  }

  public isMessageHidden(messageId: string): boolean {
    return this.hiddenMessageIds.has(messageId);
  }

  public getHiddenMessageIds(): string[] {
    return [...this.hiddenMessageIds];
  }

  private broadcastHideEvent(event: ChatHideEvent): void {
    this.broadcastControlEvent(event);
  }

  private broadcastControlEvent(event: ChatHideEvent | ChatFlushDebugEvent): void {
    for (const [clientId, client] of this.sseClients.entries()) {
      try {
        client.send(event);
      } catch (error) {
        console.error(
          `Error sending SSE control event to client ${clientId}:`,
          error
        );
      }
    }
  }

  public clearDebugMessages(): void {
    const before = this.messageBuffer.length;
    this.messageBuffer = this.messageBuffer.filter((msg) => {
      if (msg.id.includes("-debug-")) {
        this.messageIds.delete(msg.id);
        return false;
      }
      return true;
    });
    console.log(`[ConnectionManager] Flushed ${before - this.messageBuffer.length} debug messages`);
    this.broadcastControlEvent({ type: "flush-debug" });
  }

  // Twitch connection
  public async connectTwitch(
    channel: string,
    accessToken?: string,
    username?: string
  ): Promise<void> {
    if (this.twitchIRC) {
      this.twitchIRC.disconnect();
    }

    this.twitchIRC = new TwitchIRC(channel, accessToken, username);
    this.twitchIRC.onMessage((message) => this.broadcast(message));
    await this.twitchIRC.connect();
  }

  public disconnectTwitch(): void {
    if (this.twitchIRC) {
      this.twitchIRC.disconnect();
      this.twitchIRC = null;
    }
  }

  // YouTube connection
  // Now uses masterchat - just needs video ID, no OAuth required
  public async connectYouTube(videoIdOrUrl: string): Promise<void> {
    if (this.youtubeMasterchat) {
      this.youtubeMasterchat.stop();
    }

    this.youtubeError = null;
    this.youtubeMasterchat = new YouTubeMasterchat(videoIdOrUrl);

    this.youtubeMasterchat.onMessage((message) => this.broadcast(message));
    this.youtubeMasterchat.onError((error) => {
      this.youtubeError = error;
      console.error("[ConnectionManager] YouTube error:", error);
    });

    await this.youtubeMasterchat.start();
  }

  public disconnectYouTube(): void {
    if (this.youtubeMasterchat) {
      this.youtubeMasterchat.stop();
      this.youtubeMasterchat = null;
    }
    this.youtubeError = null;
  }

  // Discord connection
  public async connectDiscord(channelId: string): Promise<void> {
    if (this.discordBridge) {
      this.discordBridge.disconnect();
    }

    this.discordBridge = new DiscordBridge(channelId);
    this.discordBridge.onMessage((message) => this.broadcast(message));
    await this.discordBridge.connect();
  }

  public disconnectDiscord(): void {
    if (this.discordBridge) {
      this.discordBridge.disconnect();
      this.discordBridge = null;
    }
  }

  public getStatus(): ChatConnectionStatus[] {
    return [
      {
        platform: "twitch" as ChatPlatform,
        connected: this.twitchIRC?.isConnected() ?? false,
        channel: this.twitchIRC?.getChannel(),
      },
      {
        platform: "youtube" as ChatPlatform,
        connected: this.youtubeMasterchat?.isRunning() ?? false,
        channel: this.youtubeMasterchat?.getVideoId(),
        error: this.youtubeError?.message,
      },
      {
        platform: "discord" as ChatPlatform,
        connected: this.discordBridge?.isConnected() ?? false,
        channel: this.discordBridge?.getChannelId(),
      },
    ];
  }

  public getYouTubeError(): YouTubeMasterchatError | null {
    return this.youtubeError;
  }

  public getYouTubeMetadata(): { title?: string; channelName?: string } | null {
    return this.youtubeMasterchat?.getMetadata() ?? null;
  }

  public disconnectAll(): void {
    this.disconnectTwitch();
    this.disconnectYouTube();
    this.disconnectDiscord();
  }
}

export const connectionManager = ConnectionManager.getInstance();
