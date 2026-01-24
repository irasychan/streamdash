# Current Work Log

## Recently Completed

Archived to `worklogs/2026-01-24.md`:
- Widget configuration UI (Chat/Goal/Stats config cards + URL generation)
- Follower goal widget fix (real follower counts + configured targets)
- State Management Refactor (Zustand migration)

---

## Active Tasks

### Architecture Separation of Concerns
**Priority:** Medium
**Status:** Complete

Migrated to feature-based architecture with clear separation of concerns.

**Final Directory Structure (matches plan):**
```
features/               # Feature modules (top-level)
├── chat/
│   ├── components/     # ChatContainer, ChatMessage, ConnectionStatus, PlatformBadge
│   ├── hooks/          # useChatStatus
│   ├── types/          # ChatMessage, ChatPlatform, etc.
│   └── utils/          # emoteRenderer, youtubeTokenStore
├── emotes/
│   ├── hooks/          # useEmotes, useAutoLoadEmotes
│   └── types/          # ThirdPartyEmote, EmoteSource
├── config/
│   ├── useConfig.ts    # Client hook
│   └── types.ts        # StreamDashConfig schema
├── preferences/
│   ├── usePreferences.ts  # Client hook with theme application
│   └── types.ts           # UserPreferences, theme presets
├── widgets/
│   └── components/     # WidgetConfigCard, ChatWidgetConfigForm
└── dashboard/
    └── hooks/          # useDashboardStatus

services/               # External API clients (top-level, no React)
├── chat/
│   ├── ConnectionManager.ts
│   └── bridges/        # TwitchIRC, YouTubePoller, DiscordBridge
├── discord/
│   └── auth.ts
├── emotes/
│   └── thirdPartyEmotes.ts
└── widgets/
    └── urlGenerator.ts

state/                  # Zustand stores (top-level)
└── appStore.ts

server/                 # Server-only logic (top-level)
└── config.ts           # Config persistence

components/
├── layout/             # AppSidebar, DashboardHeader, DashboardLayoutClient
├── ui/                 # shadcn/ui primitives
└── [shared]/           # StatCard, DiscordChannelPicker

lib/                    # Cross-cutting utilities
└── shared/utils/cn.ts
```

**Subtasks:**
- [x] Map current folders/files to proposed layers
- [x] Decide target structure (`features/`, `services/`, `state/`, `server/`)
- [x] Identify quick wins (move low-risk modules first)
- [x] Draft migration steps for contexts → store(s)
- [x] Update import paths and aliases as needed
- [x] Remove backwards-compatible re-exports after migration
- [x] Move feature UI components into feature modules
- [x] Create components/layout/ for shared layout components
- [x] Extract services to top-level `services/`
- [x] Move state to top-level `state/`
- [x] Create `server/` for server-only logic
- [x] Verify build passes

### State Management Refactor
**Priority:** Medium
**Status:** Complete

Reduced context provider nesting by migrating to Zustand.

**What was done:**
- Created `lib/state/appStore.ts` with Zustand store containing slices for:
  - Dashboard status (status string, isLive flag)
  - Chat status (connection state, polling, Twitch user lookup)
  - Emotes (third-party emotes with localStorage persistence)
- Created wrapper hooks: `useChatStatus`, `useDashboardStatus`, `useEmotes`
- Removed `ChatStatusContext` and `DashboardStatusContext`
- Removed provider nesting from `dashboard-layout-client.tsx`
- Preferences already use provider-free `useSyncExternalStore` pattern

**Subtasks:**
- [x] Document research findings (`docs/research-state-management-refactor.md`)
- [x] Audit current context providers and their dependencies
- [x] Choose state management approach (Zustand)
- [x] Migrate chat status state
- [x] Migrate emote state
- [x] Migrate preferences state (already provider-free, no migration needed)
- [x] Remove provider nesting from layouts
- [x] Test SSR compatibility (build passes)

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
- All platform connections (Twitch IRC, Discord Gateway, YouTube polling) run server-side
- Tokens stored in httpOnly cookies for security
- SSE used for real-time chat streaming to clients
- User preferences stored in localStorage (browser-specific, no server sync)
- Server config stored in `.data/user-config.json` (gitignored)
- Chat status polling managed by Zustand store (`state/appStore.ts`, single 10s poll)

---

*See `worklogs/` directory for historical work logs.*
