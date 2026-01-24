import type {
  ChatMessage,
  ChatPlatform,
  ChatConnectionStatus,
  SSEClient,
} from "@/features/chat/types/chat";
import { TwitchIRC } from "./bridges/TwitchIRC";
import {
  YouTubePoller,
  type YouTubeTokenState,
  type YouTubeTokenUpdate,
} from "./bridges/YouTubePoller";
import { DiscordBridge } from "./bridges/DiscordBridge";

const MESSAGE_BUFFER_SIZE = 100;

class ConnectionManager {
  private static instance: ConnectionManager | null = null;

  private sseClients: Map<string, SSEClient> = new Map();
  private messageBuffer: ChatMessage[] = [];
  private messageIds: Set<string> = new Set();

  private twitchIRC: TwitchIRC | null = null;
  private youtubePoller: YouTubePoller | null = null;
  private discordBridge: DiscordBridge | null = null;
  private youtubeTokenUpdate: YouTubeTokenUpdate | null = null;

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
  public async connectYouTube(
    liveChatId: string,
    tokenState: YouTubeTokenState
  ): Promise<void> {
    if (this.youtubePoller) {
      this.youtubePoller.stop();
    }

    this.youtubeTokenUpdate = null;
    this.youtubePoller = new YouTubePoller(liveChatId, tokenState, (update) => {
      this.youtubeTokenUpdate = update;
    });
    this.youtubePoller.onMessage((message) => this.broadcast(message));
    await this.youtubePoller.start();
  }

  public disconnectYouTube(): void {
    if (this.youtubePoller) {
      this.youtubePoller.stop();
      this.youtubePoller = null;
    }
    this.youtubeTokenUpdate = null;
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
        connected: this.youtubePoller?.isRunning() ?? false,
        channel: this.youtubePoller?.getLiveChatId(),
      },
      {
        platform: "discord" as ChatPlatform,
        connected: this.discordBridge?.isConnected() ?? false,
        channel: this.discordBridge?.getChannelId(),
      },
    ];
  }

  public consumeYouTubeTokenUpdate(): YouTubeTokenUpdate | null {
    const update = this.youtubeTokenUpdate;
    this.youtubeTokenUpdate = null;
    return update;
  }

  public disconnectAll(): void {
    this.disconnectTwitch();
    this.disconnectYouTube();
    this.disconnectDiscord();
  }
}

export const connectionManager = ConnectionManager.getInstance();
