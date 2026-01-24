export type ChatPlatform = "twitch" | "youtube" | "discord";

export type ChatAuthor = {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  color?: string;
  badges?: ChatBadge[];
};

export type ChatBadge = {
  id: string;
  name: string;
  imageUrl: string;
};

export type ChatEmote = {
  id: string;
  name: string;
  start: number;
  end: number;
  imageUrl: string;
};

export type ChatMessage = {
  id: string;
  platform: ChatPlatform;
  timestamp: number;
  author: ChatAuthor;
  content: string;
  emotes?: ChatEmote[];
  isHighlighted?: boolean;
  isModerator?: boolean;
  isSubscriber?: boolean;
};

export type ChatConnectionStatus = {
  platform: ChatPlatform;
  connected: boolean;
  channel?: string;
  error?: string;
};

export type ChatConnectionConfig = {
  twitch?: {
    channel: string;
    accessToken?: string;
  };
  youtube?: {
    videoId?: string;
    liveChatId?: string;
    accessToken?: string;
  };
  discord?: {
    channelId: string;
  };
};

export type SSEClient = {
  id: string;
  send: (message: ChatMessage) => void;
  close: () => void;
};
