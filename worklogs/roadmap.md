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
- [x] Demo data fallback system for offline/disconnected state

## Phase 2: Chat Aggregator (Completed)

- [x] Unified chat types and data structures
- [x] Server-Sent Events (SSE) streaming endpoint
- [x] ConnectionManager singleton (message buffering, deduplication, SSE client management)
- [x] Twitch IRC client (WebSocket)
- [x] YouTube Masterchat bridge (no OAuth, no quota limits)
- [x] Discord Gateway bridge (v10, MESSAGE_CONTENT intent)
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

- [x] User preferences system (localStorage with cross-tab sync)
- [x] Server-side config persistence (.data/user-config.json) with Config API (GET/PATCH/DELETE)
- [x] Theme presets (Tokyo Night, Midnight, Cyberpunk, Forest, Sunset, Monochrome)
- [x] Emote rendering pipeline (Twitch native, BTTV, FFZ, 7TV via useEmotes hook)
- [x] Chat display preferences (font size, density, layout, animation, avatars, badges)
- [x] Discord OAuth token refresh endpoint
- [x] Discord channel picker component
- [x] Code style alignment with AGENTS.md guidelines
- [x] lib/chat/ directory restructure (bridges/, utils/)

## Phase 3: Enhanced Features (In Progress)

### Widgets & Chat Polish (Completed)

- [x] Widget configuration UI — Jan 24, 2026
- [x] Widget preview in dashboard (iframe-based) — Jan 25, 2026
- [x] Widget URL generator utility — Jan 25, 2026
- [x] Chat widget layout + animation options (8 animation types) — Jan 25, 2026
- [x] Local message hiding with hide/unhide API (POST/DELETE/GET) — Jan 25, 2026
- [x] OBS chat widget scrollbar hidden for cleaner overlay — Feb 8, 2026
- [x] Debug chat input with multi-platform simulation + flush button — Feb 8, 2026

### Chat Moderation & UX Redesign (Completed — Mar 7, 2026)

- [x] Chat moderation controls — timeout/ban via Twitch Helix API with token auto-refresh
- [x] Chat UX redesign (steps 1–5) — two-row action bar, H/T/B shortcuts, inline timeout picker, platform gating, ban dialog with reason presets
- [x] Message highlighting (mentions, keywords — user-configurable)
- [x] Auth nudge for unauthenticated Twitch users
- [x] Post-action visual state (moderated user dimming)

### Remaining

- [ ] Hidden messages summary counter (step 6 of chat-ux-redesign.md)
- [ ] TimeoutPicker "Custom..." duration input (design spec'd but only presets implemented)

## Phase 3.1: SQLite Persistence (Planned)

- [ ] Define SQLite schema for config, chat, moderation
- [ ] Add SQLite + migration tooling
- [ ] Persist streamer config, channel bindings, widget prefs
- [ ] Store chat messages with retention policy
- [ ] Store moderation actions (hide/ban/timeout) with audit trail

## Phase 3.2: Chat Experience (Planned)

- [ ] Live chat feed improvements (filters, search, load more)
- [ ] Chatter focus view (profile, join time, message history)

## Phase 3.3: Twitch Real-time Architecture (Planned)

- [ ] EventSub WebSocket client for real-time events (follows, subs, raids)
- [ ] Stats poller for aggregate data (viewer count, total followers)
- [ ] SSE endpoint `/api/twitch/stream` to broadcast to widgets
- [ ] Update widgets to use SSE instead of direct API polling

## Phase 4: Alerts & Notifications (Planned, depends on Phase 3.3)

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

## Phase 7: Auth, Roles, Deployment (Planned)

- [ ] User authentication (sessions, logout, password reset)
- [ ] Role-based access (owner, moderator, viewer)
- [ ] Moderator access to moderation + settings
- [ ] Deployment target + persistent storage strategy
- [ ] Secrets management for hosted environments

## Icebox / Backlog

- [ ] Evaluate docs site migration (Docusaurus/MkDocs/Nextra or GitHub Pages) to replace GitHub Wiki — wiki tends to go stale outside the PR workflow
- [ ] Chat message sending (bi-directional)
- [ ] Multiple Twitch channel monitoring
- [ ] Multiple YouTube channel monitoring
- [ ] Channel switching in dashboard
- [ ] Comparative analytics
- [ ] User authentication (sessions, logout, password reset)
- [ ] Role-based access (owner, moderator, viewer)
- [ ] Moderator access to moderation + settings
- [ ] Deployment target + persistent storage strategy
- [ ] Secrets management for hosted environments

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript (strict mode)
- **Real-time:** Server-Sent Events (SSE)
- **External APIs:** Twitch Helix, YouTube Data API v3 (stats), YouTube Masterchat (chat), Discord Gateway

## Environment Variables

```
# Required
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
YOUTUBE_API_KEY=

# Optional (for full chat features)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=          # Needs MESSAGE_CONTENT intent
```

---

## Current Focus

See `/WORKLOG.md` for active tasks and priorities.
