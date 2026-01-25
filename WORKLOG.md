# Current Work Log

## Recently Completed

### Chat Widget Layout & Animation Enhancements (Jan 25, 2026)
**Status:** Complete

Added flexible message layout options and entrance animations for chat widgets.

**Message Layout Options:**
- `inline` - Two-column flex layout (name in column 1, message in column 2)
- `inline-wrap` - Natural flowing text where name and message wrap together
- `stacked` - Name on top, message below (two lines)

**Message Animations (8 options):**
- `none`, `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `scale`, `bounce`

**Text Alignment:**
- `left`, `center`, `right` options for all layouts

**Username Display Fixes:**
- Removed `@` prefix from Discord and YouTube usernames
- Added consistent username colors across all platforms using shared `lib/chat/usernameColor.ts`

**Files Modified:**
- `features/chat/components/ChatMessage.tsx` - Layout, alignment, animation support
- `features/widgets/components/ChatWidgetConfigForm.tsx` - New UI controls
- `features/preferences/types.ts` - Added MessageLayout, TextAlign, MessageAnimation types
- `features/config/types.ts` - Added new config options
- `services/widgets/urlGenerator.ts` - New URL params
- `app/widgets/chat/page.tsx` - Read new params
- `app/globals.css` - Animation keyframes
- `services/chat/bridges/DiscordBridge.ts` - Color, @ removal
- `services/chat/bridges/YouTubeMasterchat.ts` - Color, @ removal
- `lib/chat/usernameColor.ts` - Shared color utility

---

### YouTube Chat Migration to Masterchat (Jan 25, 2026)
**Status:** Complete

Replaced YouTube Data API polling with [`masterchat`](https://github.com/holodata/masterchat) library to avoid quota limits.

**Changes Made:**
- Installed `masterchat` package
- Created `YouTubeMasterchat` bridge class in `services/chat/bridges/YouTubeMasterchat.ts`
- Updated `ConnectionManager` to use new bridge (no more OAuth token handling for YouTube)
- Updated API routes: `/api/chat/connect` now accepts `videoId` instead of `liveChatId`
- Updated dashboard UI: YouTube input now accepts video ID or URL, no OAuth link needed
- Updated config types: `liveChatId` → `youtubeVideoId`
- Updated widget URL generator and config forms
- Updated AGENTS.md documentation

**Cleanup (legacy files removed):**
- Removed `app/api/youtube/auth/route.ts` - OAuth no longer needed
- Removed `app/api/youtube/callback/route.ts` - OAuth callback no longer needed
- Removed `app/api/youtube/live-chat-id/route.ts` - Masterchat doesn't need liveChatId lookup
- Removed `services/chat/bridges/YouTubePoller.ts` - Replaced by YouTubeMasterchat
- Removed `features/chat/utils/youtubeTokenStore.ts` - OAuth tokens no longer needed
- Updated `features/chat/index.ts` barrel export to use YouTubeMasterchat

**Benefits:**
- No API quota consumed (was 10,000 units/day, exhausted in ~3 hours)
- No OAuth required - works with just a video ID or URL
- Real-time messages (faster than polling)

Archived to `worklogs/2026-01-25.md`:
- Architecture Separation of Concerns (feature-based directory structure)
- State Management Refactor (Zustand migration)
- Widget Transparent Background Fix
- Widget URL Param & Config Fixes
- Settings Page Redesign (Monkeytype-inspired UI)

---

## Active Tasks

### Widget Preview in Dashboard
**Priority:** Medium
**Status:** Pending

- [ ] Add live iframe preview in the config cards
- [ ] Show chat widget preview
- [ ] Show goal widget preview
- [ ] Show stats widget preview

### Stream Analytics
**Priority:** Low
**Status:** Pending

- [ ] Track viewer count history
- [ ] Store chat activity metrics
- [ ] Add analytics dashboard page
- [ ] Implement session summaries

### Chat Sending Capability
**Priority:** Low
**Status:** Pending

**Implementation Plan:**
1. Add `sendMessage(text: string)` method to `TwitchIRC` class
   - Requires authenticated connection (access token + username)
   - Send via `PRIVMSG #channel :message` IRC command
2. Add `sendTwitchMessage(text: string)` to `ConnectionManager`
3. Create `POST /api/chat/send` endpoint
   - Validate message content
   - Return success/error response
4. Create `ChatInput` component (`components/chat/ChatInput.tsx`)
   - Input field + send button
   - Enter key to send
   - Disable when not authenticated
5. Integrate `ChatInput` into `ChatContainer`
6. Add rate limiting (Twitch limits: 20 msgs/30s regular, 100/30s for mods)

**Subtasks:**
- [ ] Add `sendMessage()` to `TwitchIRC` class
- [ ] Add `sendTwitchMessage()` to `ConnectionManager`
- [ ] Create `POST /api/chat/send` endpoint
- [ ] Create `ChatInput` component
- [ ] Integrate into `ChatContainer`
- [ ] Implement rate limiting
- [ ] Test end-to-end

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
