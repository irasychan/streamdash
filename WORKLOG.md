# Current Work Log

## Recently Completed

### UX Audit + Fixes + Debug Tooling (Feb 8, 2026)
- [x] UX audit across all pages ([docs/ux-audit.md](docs/ux-audit.md))
- [x] Settings: sticky save bar, toast feedback, reset UX
- [x] Stats: use configured channel, status indicator
- [x] Toast notification system (sonner)
- [x] Debug chatbox in dashboard chat (multi-platform simulation via SSE)
- [x] OBS chat widget scrollbar hidden

See: [worklogs/2026-02-08.md](worklogs/2026-02-08.md)

### Local Message Hiding (Jan 25, 2026)
- [x] Hide messages locally (dashboard shows dimmed, OBS widget filters out)
- [x] Real-time sync via SSE hide/unhide events
- [x] API endpoint for hide/unhide/list operations

See: [worklogs/2026-01-25.md](worklogs/2026-01-25.md)

---

## Active Tasks

### Enhanced Features (Phase 3) - Remaining
**Priority:** High
**Status:** Active

- [ ] Chat UX redesign for moderation workflows (see [chat-ux-redesign.md](docs/chat-ux-redesign.md))
- [ ] Chat moderation controls (timeout durations, ban) - Twitch only
- [ ] Message highlighting (mentions, keywords)
- [ ] Dashboard connection status badges in header
- [ ] Add clear/flush button to remove debug messages from chat feed and SSE buffer

---

## Planned Tasks

### SQLite Persistence (Phase 3.1)
**Priority:** Medium
**Status:** Planned

- [ ] Define SQLite schema for config, chat, moderation
- [ ] Add SQLite + migration tooling
- [ ] Persist streamer config, channel bindings, widget prefs
- [ ] Store chat messages with retention policy
- [ ] Store moderation actions (hide/ban/timeout) with audit trail

### Moderation + Chat Experience (Phase 3.2)
**Priority:** Medium
**Status:** Planned

- [ ] Live chat feed improvements (filters, search, load more)
- [ ] Chatter focus view (profile, join time, message history)

### Twitch Real-time Architecture (Phase 3.3)
**Priority:** Medium
**Status:** Planned

- [ ] EventSub WebSocket client for real-time events (follows, subs, raids)
- [ ] Stats poller for aggregate data (viewer count, total followers)
- [ ] SSE endpoint `/api/twitch/stream` to broadcast to widgets
- [ ] Update widgets to use SSE instead of direct API calls

See: [docs/twitch-realtime-architecture.md](docs/twitch-realtime-architecture.md)

### Alerts & Notifications (Phase 4)
**Priority:** Low
**Status:** Planned (depends on Phase 3.3)

- [ ] New follower alerts
- [ ] Subscription alerts
- [ ] Donation/bits alerts
- [ ] Raid alerts
- [ ] Custom alert sounds/animations
- [ ] OBS alert widget

### Analytics (Phase 5)
**Priority:** Low
**Status:** Planned

- [ ] Viewer count history graphs
- [ ] Chat activity metrics
- [ ] Peak viewer tracking
- [ ] Stream session summaries
- [ ] Export data to CSV/JSON

---

## Notes

### Active Task Context (Phase 3)

**Chat UX Redesign**
- Current chat UI: [app/dashboard/chat/page.tsx](app/dashboard/chat/page.tsx)
- Chat message component: [features/chat/components/ChatMessage.tsx](features/chat/components/ChatMessage.tsx)
- Consider: hover actions, user context panels, quick mod controls, keyboard shortcuts

**Chat Moderation Controls (Twitch only)**
- Twitch API: `POST /moderation/bans` for timeout/ban (requires `moderator:manage:banned_users` scope)
- Current Twitch IRC client: [services/chat/bridges/TwitchIRC.ts](services/chat/bridges/TwitchIRC.ts)
- Chat SSE endpoint: [app/api/chat/sse/route.ts](app/api/chat/sse/route.ts)
- Hidden messages API: [app/api/chat/hide/route.ts](app/api/chat/hide/route.ts) - pattern to follow
- Debug messages API: [app/api/chat/debug/route.ts](app/api/chat/debug/route.ts)

**Message Highlighting**
- User preferences store: localStorage via [features/preferences/usePreferences.ts](features/preferences/usePreferences.ts)
- Consider: mention detection (@username), keyword list in preferences

---

*See `worklogs/roadmap.md` for full roadmap and icebox items.*
