import type { ChatMessage } from "@/features/chat/types/chat";

export const demoStats = {
  channel: "iroiroira",
  youtubeChannelId: "UCF-gSgJSzQbWUBL-dLDDF9Q",
  live: true,
  viewers: 1423,
  followers: 12840,
  subs: 532,
  goal: {
    current: 12840,
    target: 15000,
  },
  youtube: {
    subscribers: 18420,
    views: 892340,
  },
};

export const demoChatMessages: ChatMessage[] = [
  {
    id: "demo-1",
    platform: "twitch",
    timestamp: Date.now() - 30000,
    author: {
      id: "user1",
      name: "chathero42",
      displayName: "ChatHero42",
      color: "#FF4500",
    },
    content: "Hey everyone! Great stream today!",
    isModerator: false,
    isSubscriber: true,
  },
  {
    id: "demo-2",
    platform: "youtube",
    timestamp: Date.now() - 25000,
    author: {
      id: "yt-user1",
      name: "StreamFan",
      displayName: "StreamFan",
      avatar: "https://yt3.ggpht.com/ytc/default_avatar.png",
    },
    content: "Just joined from YouTube! Love the content",
    isModerator: false,
  },
  {
    id: "demo-3",
    platform: "discord",
    timestamp: Date.now() - 20000,
    author: {
      id: "discord-user1",
      name: "mod_master",
      displayName: "Mod Master",
    },
    content: "Welcome everyone from Discord!",
    isModerator: true,
  },
  {
    id: "demo-4",
    platform: "twitch",
    timestamp: Date.now() - 15000,
    author: {
      id: "user2",
      name: "pixelwizard",
      displayName: "PixelWizard",
      color: "#9146FF",
    },
    content: "PogChamp that was insane!",
    isModerator: false,
    isSubscriber: true,
  },
  {
    id: "demo-5",
    platform: "youtube",
    timestamp: Date.now() - 10000,
    author: {
      id: "yt-user2",
      name: "TechViewer",
      displayName: "TechViewer",
    },
    content: "Can you show that again?",
    isModerator: false,
  },
  {
    id: "demo-6",
    platform: "twitch",
    timestamp: Date.now() - 5000,
    author: {
      id: "user3",
      name: "nightowl_gamer",
      displayName: "NightOwl_Gamer",
      color: "#00FF7F",
    },
    content: "LUL this is hilarious",
    isModerator: false,
  },
];
