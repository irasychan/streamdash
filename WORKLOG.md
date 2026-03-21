# Current Work Log

## Active Tasks

### Phase 3 — Remaining Items

**Priority:** High
**Status:** Active

- [ ] Hidden messages summary counter (step 6 of [chat-ux-redesign.md](docs/chat-ux-redesign.md) — collapsible "N messages hidden" in chat header)
- [ ] TimeoutPicker "Custom..." duration input (design spec'd in chat-ux-redesign.md but only 1m/10m/1h presets implemented)

______________________________________________________________________

## Bugs

(See `worklogs/bugs.md` for active, deferred, and fixed bugs.)

______________________________________________________________________

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

______________________________________________________________________

## Notes

### Active Task Context (Phase 3)

**Hidden Messages Counter** (step 6 of chat-ux-redesign.md)

- Add collapsible "N messages hidden" counter to the chat header area
- Clicking toggles showing/hiding those messages in the feed
- Components: `ChatContainer.tsx` (state), chat header area

______________________________________________________________________

_See `worklogs/roadmap.md` for full roadmap and icebox items._

______________________________________________________________________

## Archive

- [2026-03-22](worklogs/2026-03-22.md) — Fix ESLint react-compiler errors in ChatContainer and WidgetConfigCard
- [2026-03-07](worklogs/2026-03-07.md) — Chat moderation polish, auth nudge, post-action visual state, UX redesign research; Chat UX redesign (steps 1–5), message highlighting
- [2026-02-08](worklogs/2026-02-08.md) — UX audit, settings overhaul, debug chat, toast notifications
- [2026-01-25](worklogs/2026-01-25.md) — Architecture refactor, Zustand, widget fixes, local message hiding
