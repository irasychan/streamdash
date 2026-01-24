# Streaming Dashboard Roadmap

## Overview
A Next.js 16 streaming dashboard displaying Twitch/YouTube metrics with OBS-ready widgets and unified chat aggregation.

---

## Phase 1: Core Dashboard (Completed)
- [x] Next.js 16 App Router setup
- [x] shadcn/ui component library integration
- [x] Twitch OAuth flow with token refresh
- [x] Twitch API integration (viewers, followers, subs)
- [x] YouTube Data API integration (subscribers, views)
- [x] Dashboard page with stats display
- [x] OBS widgets: stats widget, follower goal widget

## Phase 2: Chat Aggregator (Completed)
- [x] Unified chat types and data structures
- [x] Server-Sent Events (SSE) streaming endpoint
- [x] Twitch IRC client (WebSocket)
- [x] YouTube Live Chat poller
- [x] Discord Gateway bridge
- [x] Chat UI components (ChatMessage, PlatformBadge, etc.)
- [x] OBS chat widget with transparent mode
- [x] Dashboard chat integration

## Phase 3: Enhanced Features (Planned)
- [ ] YouTube OAuth flow for user's own streams
- [ ] Discord bot setup wizard
- [ ] Chat message sending (bi-directional)
- [ ] Emote rendering (Twitch, BTTV, FFZ, 7TV)
- [ ] User badges display
- [ ] Chat moderation controls (timeout, ban)
- [ ] Message highlighting (mentions, keywords)

## Phase 4: Alerts & Notifications (Planned)
- [ ] New follower alerts
- [ ] Subscription alerts
- [ ] Donation/bits alerts
- [ ] Raid alerts
- [ ] Custom alert sounds/animations
- [ ] OBS alert widget

## Phase 5: Analytics (Planned)
- [ ] Viewer count history graphs
- [ ] Chat activity metrics
- [ ] Peak viewer tracking
- [ ] Stream session summaries
- [ ] Export data to CSV/JSON

## Phase 6: Multi-Stream Support (Planned)
- [ ] Multiple Twitch channel monitoring
- [ ] Multiple YouTube channel monitoring
- [ ] Channel switching in dashboard
- [ ] Comparative analytics

---

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript
- **Real-time:** Server-Sent Events (SSE)
- **External APIs:** Twitch Helix, YouTube Data API v3, Discord Gateway

## Environment Variables
```
# Required
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
YOUTUBE_API_KEY=

# Optional (for full chat features)
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=
```
