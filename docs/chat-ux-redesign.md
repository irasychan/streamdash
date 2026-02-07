# Chat UX Redesign Proposal

## Current Chat UX Analysis

### Structure
```
┌─────────────────────────────────────────────────────┐
│ Dashboard Chat Page                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Card: "Live Chat Feed"                          │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Header: "Live Chat" + dot + ConnectionStatus│ │ │
│ │ ├─────────────────────────────────────────────┤ │ │
│ │ │ Message List (scrollable)                   │ │ │
│ │ │ ┌─────────────────────────────────────────┐ │ │ │
│ │ │ │ [Platform] [Avatar] Username: message   │ │ │ │
│ │ │ │                      [Hide][Timeout][Ban]│ │ │ │
│ │ │ └─────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Current Capabilities
- **Message display**: 3 layouts (inline, inline-wrap, stacked), configurable font/density/avatars/badges
- **Moderation**: Hover buttons (Hide, Timeout, Ban) appear on each message
- **Highlighting**: Mentions + keyword list (stored in preferences)
- **Hidden messages**: Dimmed with "Unhide" button, filtered from OBS widget
- **Connection status**: Platform badges with green dots

### Pain Points for Moderation Workflows

1. **No user context** - Clicking a username doesn't show user history, follower status, or account age
2. **Flat action buttons** - Timeout/Ban are side-by-side with no confirmation; easy to misclick
3. **No timeout duration options** - Hardcoded 600s (10min) timeout
4. **No keyboard shortcuts** - All actions require mouse hover
5. **No filtering** - Can't filter by platform, user, or time range
6. **No search** - Can't search past messages
7. **No quick user actions** - Can't see all messages from a specific user
8. **No undo/audit** - No way to see what actions were taken or undo them

---

## Proposed Chat UX Redesign

### Design Goals
1. **Efficient moderation** - Minimize clicks for common actions
2. **User context at a glance** - See who you're moderating before acting
3. **Keyboard-first** - Power users can moderate without mouse
4. **Non-destructive by default** - Confirmation for ban, easy undo

### New Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Chat                                                          [⚙] [Filter]│
├───────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐  ┌──────────────────────┐ │
│ │ Message Feed                                │  │ User Panel (context) │ │
│ │                                             │  │                      │ │
│ │ [Twitch] ModUser: timeout this spammer      │  │ ┌──────────────────┐ │ │
│ │ [Twitch] SpamUser: BUY FOLLOWERS NOW ← sel  │  │ │   SpamUser       │ │ │
│ │ [Twitch] NiceUser: great stream!            │  │ │   @spamuser_123  │ │ │
│ │ [YouTube] Viewer1: hello from YT            │  │ │   [Twitch icon]  │ │ │
│ │                                             │  │ ├──────────────────┤ │ │
│ │                                             │  │ │ Account: 2 days  │ │ │
│ │                                             │  │ │ Following: No    │ │ │
│ │                                             │  │ │ Messages: 47     │ │ │
│ │                                             │  │ ├──────────────────┤ │ │
│ │                                             │  │ │ Recent Messages  │ │ │
│ │                                             │  │ │ • BUY FOLLOWERS  │ │ │
│ │                                             │  │ │ • CHEAP BOTS     │ │ │
│ │                                             │  │ │ • VISIT SITE...  │ │ │
│ │                                             │  │ ├──────────────────┤ │ │
│ ├─────────────────────────────────────────────┤  │ │ Quick Actions    │ │ │
│ │ [Hide] [1m] [10m] [1h] [Ban] ← action bar   │  │ │ [Timeout ▾][Ban] │ │ │
│ └─────────────────────────────────────────────┘  │ │ [Hide All]       │ │ │
│                                                  │ └──────────────────┘ │ │
│                                                  └──────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘

Keyboard: ↑↓ navigate | h hide | t timeout | b ban | Esc deselect | / search
```

### Key Changes

| Feature | Current | Proposed |
|---------|---------|----------|
| **User context** | None | Side panel with account age, follow status, message history |
| **Message selection** | Hover only | Click to select, keyboard nav (↑↓) |
| **Action bar** | Per-message hover buttons | Fixed bottom bar for selected message |
| **Timeout options** | 10min only | 1m / 10m / 1h / custom |
| **Keyboard shortcuts** | None | h=hide, t=timeout, b=ban, /=search |
| **User message history** | None | "Show all from user" in context panel |
| **Filters** | None | Platform filter, highlighted only, hidden only |
| **Search** | None | / to search messages |
| **Ban confirmation** | None | Modal confirmation with reason input |

---

## Implementation Phases

### Phase 3a: Core UX
- [ ] Message selection (click + keyboard nav)
- [ ] Fixed action bar at bottom
- [ ] Timeout duration dropdown (1m/10m/1h)
- [ ] Ban confirmation modal

### Phase 3b: User Context Panel
- [ ] Collapsible side panel
- [ ] User info display (needs Twitch API: account age, follow status)
- [ ] "Messages from this user" list
- [ ] "Hide all from user" action

### Phase 3c: Keyboard & Filters
- [ ] Keyboard shortcuts (h/t/b/Esc)
- [ ] Platform filter dropdown
- [ ] Show highlighted/hidden toggles
- [ ] Search input (/)

---

## Key Files

- Chat page: `app/dashboard/chat/page.tsx`
- Chat container: `features/chat/components/ChatContainer.tsx`
- Message component: `features/chat/components/ChatMessage.tsx`
- Preferences types: `features/preferences/types.ts`
- Hidden messages API: `app/api/chat/hidden/route.ts`
