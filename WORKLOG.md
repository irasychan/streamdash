# Current Work Log

## Recently Completed

### Local Message Hiding (Jan 25, 2026)
- [x] Hide messages locally (dashboard shows dimmed, OBS widget filters out)
- [x] Real-time sync via SSE hide/unhide events
- [x] API endpoint for hide/unhide/list operations

---

## Active Tasks

### Enhanced Chat Features (Phase 3)
**Priority:** Medium
**Status:** In Progress

- [x] Local message hiding (hide from OBS, still visible in dashboard)
- [ ] Chat moderation controls (timeout, ban) - Twitch only
- [ ] Message highlighting (mentions, keywords)

---

## Planned Tasks

### Analytics (Phase 5)
**Priority:** Low
**Status:** Planned

- [ ] Viewer count history graphs
- [ ] Chat activity metrics
- [ ] Peak viewer tracking
- [ ] Stream session summaries
- [ ] Export data to CSV/JSON

---

## Backlog / Icebox

### Chat Message Sending (Bi-directional)
**Priority:** Low
**Status:** Backlog

- [ ] Add Twitch chat message sending

---

## Notes
- All platform connections (Twitch IRC, Discord Gateway, YouTube Masterchat) run server-side
- Tokens stored in httpOnly cookies for security (Twitch/Discord only, YouTube doesn't need auth)
- SSE used for real-time chat streaming to clients
- User preferences stored in localStorage (browser-specific, no server sync)
- Server config stored in `.data/user-config.json` (gitignored)
- Chat status polling managed by Zustand store (`state/appStore.ts`, single 10s poll)

---

*See `worklogs/` directory for historical work logs.*
