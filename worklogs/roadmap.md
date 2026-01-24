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

## Phase 2.5: UX Redesign (Completed - Jan 24, 2026)
- [x] Admin panel layout with shadcn sidebar
- [x] Collapsible navigation with keyboard shortcuts
- [x] Mobile-responsive drawer navigation
- [x] Akira Neo Tokyo visual design overhaul
- [x] Neon color palette and glow effects
- [x] Dashboard status context for live state sharing
- [x] Platform connection status indicators
- [x] Dedicated routes: /dashboard/chat, /stats, /widgets, /settings

## Phase 2.6: Code Quality & Preferences (Completed - Jan 24, 2026)
- [x] User preferences system (localStorage)
- [x] Server-side config persistence (.data/user-config.json)
- [x] Theme presets (Tokyo Night, Midnight, Cyberpunk, Forest, Sunset, Monochrome)
- [x] Emote rendering (Twitch native, BTTV, FFZ, 7TV)
- [x] Chat display preferences (font size, density, avatars, badges)
- [x] Code style alignment with AGENTS.md guidelines
- [x] lib/chat/ directory restructure (bridges/, utils/)

## Phase 3: Enhanced Features (In Progress)
- [ ] Widget preview in dashboard (iframe-based)
- [ ] Widget configuration UI
- [ ] Chat message sending (bi-directional)
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
- **Language:** TypeScript (strict mode)
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
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=          # Needs MESSAGE_CONTENT intent
```

---

## Current Focus
See `/WORKLOG.md` for active tasks and priorities.
