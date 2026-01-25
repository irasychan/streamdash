import type { ChatMessage } from "@/features/chat/types/chat";
import {
  Masterchat,
  MasterchatError,
  stringify,
  type AddChatItemAction,
} from "masterchat";

type MessageCallback = (message: ChatMessage) => void;
type ErrorCallback = (error: YouTubeMasterchatError) => void;

export type YouTubeMasterchatError = {
  code: string;
  message: string;
};

/**
 * YouTube chat bridge using masterchat library.
 * Uses YouTube's internal chat protocol instead of the Data API, avoiding quota limits.
 *
 * Accepts either:
 * - A video ID (e.g., "dQw4w9WgXcQ")
 * - A video URL (e.g., "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
 */
export class YouTubeMasterchat {
  private videoId: string;
  private masterchat: Masterchat | null = null;
  private messageCallback: MessageCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private running = false;

  constructor(videoIdOrUrl: string) {
    this.videoId = this.extractVideoId(videoIdOrUrl);
  }

  /**
   * Extract video ID from URL or return as-is if already an ID
   */
  private extractVideoId(input: string): string {
    // Already a video ID (11 characters, alphanumeric + _ and -)
    if (/^[\w-]{11}$/.test(input)) {
      return input;
    }

    // Try to parse as URL
    try {
      const url = new URL(input);

      // youtube.com/watch?v=VIDEO_ID
      if (url.searchParams.has("v")) {
        return url.searchParams.get("v")!;
      }

      // youtu.be/VIDEO_ID
      if (url.hostname === "youtu.be") {
        return url.pathname.slice(1);
      }

      // youtube.com/live/VIDEO_ID
      if (url.pathname.startsWith("/live/")) {
        return url.pathname.slice(6);
      }
    } catch {
      // Not a valid URL, treat as video ID
    }

    return input;
  }

  public onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  public onError(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  public async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      console.log(`[YouTubeMasterchat] Initializing for video: ${this.videoId}`);
      this.masterchat = await Masterchat.init(this.videoId);
      console.log(
        `[YouTubeMasterchat] Connected to: ${this.masterchat.title} by ${this.masterchat.channelName}`
      );

      // Set up event handlers
      this.masterchat.on("chat", (chat: AddChatItemAction) => {
        if (!this.running) return;

        const message = this.parseChat(chat);
        if (message && this.messageCallback) {
          this.messageCallback(message);
        }
      });

      this.masterchat.on("error", (err: MasterchatError | Error) => {
        if (err instanceof MasterchatError) {
          console.error("[YouTubeMasterchat] Error:", err.code, err.message);
          this.errorCallback?.({
            code: err.code,
            message: err.message || this.getErrorMessage(err.code),
          });
        } else {
          console.error("[YouTubeMasterchat] Error:", err.message);
          this.errorCallback?.({
            code: "unknown",
            message: err.message,
          });
        }
      });

      this.masterchat.on("end", () => {
        console.log("[YouTubeMasterchat] Stream ended");
        this.running = false;
      });

      // Start listening
      this.masterchat.listen();
    } catch (error) {
      this.running = false;

      if (error instanceof MasterchatError) {
        console.error(
          "[YouTubeMasterchat] Init error:",
          error.code,
          error.message
        );
        this.errorCallback?.({
          code: error.code,
          message: error.message || this.getErrorMessage(error.code),
        });
      } else {
        console.error("[YouTubeMasterchat] Unexpected error:", error);
        this.errorCallback?.({
          code: "unknown",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
      throw error;
    }
  }

  public stop(): void {
    this.running = false;

    if (this.masterchat) {
      // Remove all listeners and stop
      this.masterchat.removeAllListeners();
      this.masterchat.stop();
      this.masterchat = null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  public getVideoId(): string {
    return this.videoId;
  }

  public getMetadata(): { title?: string; channelName?: string } | null {
    if (!this.masterchat) return null;
    return {
      title: this.masterchat.title,
      channelName: this.masterchat.channelName,
    };
  }

  private parseChat(chat: AddChatItemAction): ChatMessage {
    // Handle message - it can be undefined in rare cases
    const messageText = chat.message ? stringify(chat.message) : "";

    return {
      id: `youtube-${chat.id}`,
      platform: "youtube",
      timestamp: chat.timestamp
        ? new Date(chat.timestamp).getTime()
        : Date.now(),
      author: {
        id: chat.authorChannelId,
        name: chat.authorName ?? "Unknown",
        displayName: chat.authorName ?? "Unknown",
        avatar: chat.authorPhoto,
      },
      content: messageText,
      isModerator: chat.isModerator || chat.isOwner, // treat owner as moderator
      isSubscriber: !!chat.membership, // membership object indicates channel member
    };
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case "disabled":
        return "Live chat is disabled for this stream";
      case "membersOnly":
        return "Chat is members-only";
      case "private":
        return "This video is private";
      case "unavailable":
        return "Video not found or has been deleted";
      case "unarchived":
        return "Live stream recording is not available";
      case "denied":
        return "Access denied (rate limited)";
      case "invalid":
        return "Invalid video ID";
      default:
        return `Error: ${code}`;
    }
  }
}
