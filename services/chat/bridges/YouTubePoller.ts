import type { ChatMessage } from "@/features/chat/types/chat";

type MessageCallback = (message: ChatMessage) => void;

export type YouTubeTokenState = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export type YouTubeTokenUpdate = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  expiresIn: number;
};

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const DEFAULT_POLL_INTERVAL = 5000;
const MAX_RESULTS = 200;

type YouTubeLiveChatMessage = {
  id: string;
  snippet: {
    displayMessage: string;
    publishedAt: string;
  };
  authorDetails: {
    channelId: string;
    displayName: string;
    profileImageUrl: string;
    isChatOwner: boolean;
    isChatModerator: boolean;
    isChatSponsor: boolean;
  };
};

type YouTubeLiveChatResponse = {
  pollingIntervalMillis: number;
  nextPageToken?: string;
  items: YouTubeLiveChatMessage[];
};

export class YouTubePoller {
  private liveChatId: string;
  private accessToken: string;
  private refreshToken?: string;
  private tokenExpiresAt?: number;
  private messageCallback: MessageCallback | null = null;
  private running = false;
  private pollTimeout: ReturnType<typeof setTimeout> | null = null;
  private nextPageToken?: string;
  private pollInterval = DEFAULT_POLL_INTERVAL;
  private seenMessageIds: Set<string> = new Set();
  private tokenUpdateCallback?: (update: YouTubeTokenUpdate) => void;

  constructor(
    liveChatId: string,
    tokenState: YouTubeTokenState,
    tokenUpdateCallback?: (update: YouTubeTokenUpdate) => void
  ) {
    this.liveChatId = liveChatId;
    this.accessToken = tokenState.accessToken;
    this.refreshToken = tokenState.refreshToken;
    this.tokenExpiresAt = tokenState.expiresAt;
    this.tokenUpdateCallback = tokenUpdateCallback;
  }

  public onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  public async start(): Promise<void> {
    this.running = true;
    await this.poll();
  }

  public stop(): void {
    this.running = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  public getLiveChatId(): string {
    return this.liveChatId;
  }

  private async poll(): Promise<void> {
    if (!this.running) return;

    try {
      await this.ensureValidToken();
      const url = new URL(`${YOUTUBE_API_BASE}/liveChat/messages`);
      url.searchParams.set("liveChatId", this.liveChatId);
      url.searchParams.set("part", "snippet,authorDetails");
      url.searchParams.set("maxResults", String(MAX_RESULTS));
      if (this.nextPageToken) {
        url.searchParams.set("pageToken", this.nextPageToken);
      }

      let response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          response = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          });
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[YouTubePoller] API error:", errorText);
        if (response.status === 400 && errorText.includes("pageTokenInvalid")) {
          this.nextPageToken = undefined;
        }
        this.schedulePoll();
        return;
      }

      const data: YouTubeLiveChatResponse = await response.json();

      // Update polling interval from API recommendation
      if (data.pollingIntervalMillis) {
        this.pollInterval = Math.max(
          data.pollingIntervalMillis,
          DEFAULT_POLL_INTERVAL
        );
      }

      this.nextPageToken = data.nextPageToken;

      // Process messages
      for (const item of data.items) {
        if (this.seenMessageIds.has(item.id)) {
          continue;
        }
        this.seenMessageIds.add(item.id);

        const message = this.parseMessage(item);
        if (message && this.messageCallback) {
          this.messageCallback(message);
        }
      }

      // Cleanup old message IDs (keep last 1000)
      if (this.seenMessageIds.size > 1000) {
        const ids = Array.from(this.seenMessageIds);
        this.seenMessageIds = new Set(ids.slice(-500));
      }
    } catch (error) {
      console.error("[YouTubePoller] Poll error:", error);
    }

    this.schedulePoll();
  }

  private schedulePoll(): void {
    if (this.running) {
      this.pollTimeout = setTimeout(() => this.poll(), this.pollInterval);
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.tokenExpiresAt) return;
    if (Date.now() < this.tokenExpiresAt - 60_000) return;
    await this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return false;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.refreshToken,
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[YouTubePoller] Token refresh failed:", errorText);
      return false;
    }

    const payload = await response.json();
    if (!payload.access_token || !payload.expires_in) {
      return false;
    }

    const expiresAt = Date.now() + payload.expires_in * 1000;
    this.accessToken = payload.access_token;
    if (payload.refresh_token) {
      this.refreshToken = payload.refresh_token;
    }
    this.tokenExpiresAt = expiresAt;
    this.tokenUpdateCallback?.({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt,
      expiresIn: payload.expires_in,
    });
    return true;
  }

  private parseMessage(item: YouTubeLiveChatMessage): ChatMessage {
    return {
      id: `youtube-${item.id}`,
      platform: "youtube",
      timestamp: new Date(item.snippet.publishedAt).getTime(),
      author: {
        id: item.authorDetails.channelId,
        name: item.authorDetails.displayName,
        displayName: item.authorDetails.displayName,
        avatar: item.authorDetails.profileImageUrl,
      },
      content: item.snippet.displayMessage,
      isModerator: item.authorDetails.isChatModerator,
      isSubscriber: item.authorDetails.isChatSponsor,
    };
  }
}
