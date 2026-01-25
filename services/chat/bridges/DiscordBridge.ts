import type { ChatMessage } from "@/features/chat/types/chat";
import { getUsernameColor } from "@/lib/chat/usernameColor";

type MessageCallback = (message: ChatMessage) => void;

const DISCORD_GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const HEARTBEAT_INTERVAL = 41250; // Discord's recommended interval

type DiscordGatewayPayload = {
  op: number;
  d: unknown;
  s?: number;
  t?: string;
};

type DiscordReadyEvent = {
  user: {
    id: string;
    username: string;
  };
  session_id: string;
};

type DiscordMessageCreate = {
  id: string;
  channel_id: string;
  author: {
    id: string;
    username: string;
    global_name?: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  member?: {
    roles: string[];
  };
};

export class DiscordBridge {
  private channelId: string;
  private botToken: string;
  private ws: WebSocket | null = null;
  private messageCallback: MessageCallback | null = null;
  private connected = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private sequence: number | null = null;
  private sessionId: string | null = null;
  private reconnecting = false;

  constructor(channelId: string) {
    this.channelId = channelId;
    this.botToken = process.env.DISCORD_BOT_TOKEN || "";
  }

  public onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  public async connect(): Promise<void> {
    if (!this.botToken) {
      throw new Error("DISCORD_BOT_TOKEN environment variable is not set");
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(DISCORD_GATEWAY_URL);

        this.ws.onopen = () => {
          // Wait for HELLO event
        };

        this.ws.onmessage = (event) => {
          const payload: DiscordGatewayPayload = JSON.parse(event.data);
          this.handlePayload(payload, resolve);
        };

        this.ws.onerror = (error) => {
          console.error("[DiscordBridge] WebSocket error:", error);
          if (!this.connected) {
            reject(error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("[DiscordBridge] WebSocket closed:", event.code);
          this.connected = false;
          this.stopHeartbeat();

          if (!this.reconnecting && event.code !== 1000) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.reconnecting = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getChannelId(): string {
    return this.channelId;
  }

  private handlePayload(
    payload: DiscordGatewayPayload,
    onReady?: () => void
  ): void {
    // Update sequence number
    if (payload.s !== undefined) {
      this.sequence = payload.s;
    }

    switch (payload.op) {
      case 10: // HELLO
        this.handleHello(payload.d as { heartbeat_interval: number });
        break;
      case 11: // HEARTBEAT_ACK
        // Heartbeat acknowledged
        break;
      case 0: // DISPATCH
        this.handleDispatch(payload.t!, payload.d, onReady);
        break;
    }
  }

  private handleHello(data: { heartbeat_interval: number }): void {
    // Start heartbeating
    this.startHeartbeat(data.heartbeat_interval);

    // Send IDENTIFY
    this.send({
      op: 2,
      d: {
        token: this.botToken,
        intents: 1 << 9 | 1 << 15, // GUILD_MESSAGES | MESSAGE_CONTENT
        properties: {
          os: "linux",
          browser: "streaming-dashboard",
          device: "streaming-dashboard",
        },
      },
    });
  }

  private handleDispatch(
    eventName: string,
    data: unknown,
    onReady?: () => void
  ): void {
    switch (eventName) {
      case "READY": {
        const ready = data as DiscordReadyEvent;
        this.sessionId = ready.session_id;
        this.connected = true;
        console.log(
          "[DiscordBridge] Connected as:",
          ready.user.username
        );
        onReady?.();
        break;
      }
      case "MESSAGE_CREATE": {
        const message = data as DiscordMessageCreate;
        // Only process messages from the configured channel
        if (message.channel_id === this.channelId) {
          const chatMessage = this.parseMessage(message);
          if (chatMessage && this.messageCallback) {
            this.messageCallback(chatMessage);
          }
        }
        break;
      }
    }
  }

  private parseMessage(data: DiscordMessageCreate): ChatMessage | null {
    // Ignore bot messages
    if (!data.author || data.author.id === "bot") {
      return null;
    }

    return {
      id: `discord-${data.id}`,
      platform: "discord",
      timestamp: new Date(data.timestamp).getTime(),
      author: {
        id: data.author.id,
        name: data.author.username,
        displayName: data.author.global_name || data.author.username,
        avatar: data.author.avatar
          ? `https://cdn.discordapp.com/avatars/${data.author.id}/${data.author.avatar}.png`
          : undefined,
        color: getUsernameColor(data.author.username),
      },
      content: data.content,
      isModerator: false, // Would need role checking
    };
  }

  private startHeartbeat(interval: number): void {
    // Send initial heartbeat
    this.sendHeartbeat();

    // Set up interval
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendHeartbeat(): void {
    this.send({
      op: 1,
      d: this.sequence,
    });
  }

  private send(payload: DiscordGatewayPayload): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      if (!this.reconnecting) {
        this.connect().catch(console.error);
      }
    }, 5000);
  }
}
