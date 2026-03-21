# Chat UX Redesign for Moderation Workflows

## Problem

The current action bar crams all controls into a single row: user info, Hide/Unhide, Timeout dropdown, Ban, auth nudge, keyboard hints, and close. On narrow screens this wraps poorly, and the UX doesn't scale for future actions.

Beyond layout, there's no keyboard shortcut for moderation actions (only arrow keys and Esc), no visible moderation history, and no clear platform gating when selecting non-Twitch messages.

## Current Architecture

| Component          | Role                                           | File                                            |
| ------------------ | ---------------------------------------------- | ----------------------------------------------- |
| `ChatContainer`    | State management, SSE, selection, keyboard nav | `features/chat/components/ChatContainer.tsx`    |
| `ChatMessage`      | Render message with visual states              | `features/chat/components/ChatMessage.tsx`      |
| `ChatActionBar`    | Bottom bar with actions on selected message    | `features/chat/components/ChatActionBar.tsx`    |
| `BanConfirmDialog` | Modal confirm for bans                         | `features/chat/components/BanConfirmDialog.tsx` |
| `ConnectionStatus` | Platform connection badges                     | `features/chat/components/ConnectionStatus.tsx` |

### Bimodal Design (preserve)

- **Widget mode** (no `onSelect`): hover buttons, no selection state
- **Dashboard mode** (`onSelect` provided): click-to-select, action bar, no hover buttons

### Visual States (preserve)

| State          | Style                                                    |
| -------------- | -------------------------------------------------------- |
| Normal         | Full opacity                                             |
| Highlighted    | Gold tint + ring (`bg-primary/15 ring-primary/30`)       |
| Moderator msg  | Green tint (`bg-emerald-500/[0.06]`)                     |
| Hidden         | Grey dim (`opacity-40 bg-slate-500/5 ring-slate-500/20`) |
| Moderated user | Rose dim (`opacity-40 bg-rose-500/5 ring-rose-500/20`)   |
| Selected       | Gold ring (`ring-2 ring-primary/60 bg-primary/10`)       |

## Proposed Changes

### 1. Two-Row Action Bar

Split the single cramped row into a structured layout:

```txt
Row 1: [Platform Badge] [Username]              [Hide/Unhide] [X Close]
Row 2: [Timeout 1m] [10m] [1h] [Ban]   [keyboard hints: H hide | T timeout | B ban | Esc deselect]
```

- Row 1: context + local actions (always visible)
- Row 2: moderation actions (Twitch-only, hidden when not authed or non-Twitch message)
- When not Twitch-authed, Row 2 becomes: `[Connect Twitch to unlock moderation controls →]`

### 2. Keyboard Shortcuts for Moderation

Add single-key shortcuts when a message is selected (skip if focus is in input/textarea):

| Key       | Action                                                  |
| --------- | ------------------------------------------------------- |
| `H`       | Toggle hide/unhide                                      |
| `T`       | Quick timeout (default 10min), or opens duration picker |
| `B`       | Open ban confirmation dialog                            |
| `Esc`     | Deselect                                                |
| `Up/Down` | Navigate messages                                       |

Implementation: extend the existing `keydown` handler in `ChatContainer`.

### 3. Platform-Aware Action Bar

When selecting a YouTube or Discord message:

- Show Hide/Unhide (works for all platforms)
- Replace moderation section with subtle disabled state: "Moderation available for Twitch only"
- Avoid hiding the entire row (confusing), instead show the limitation clearly

### 4. Enhanced Timeout UX

Replace the dropdown with inline preset buttons:

- `[1m] [10m] [1h] [Custom...]`
- "Custom..." opens a small popover with a numeric input + unit selector
- Each button triggers immediately (like current dropdown items)

### 5. Ban Confirmation Improvements

- Add preset reason chips: Spam, Harassment, Advertising, Other
- Show character count for custom reason
- Consider adding "Timeout first" option (30min timeout before permanent ban)

### 6. Hidden Messages Summary

Add a collapsible counter in the header area:

- `"3 messages hidden"` — click to toggle showing/hiding them in the feed
- Useful for streamers who want to review what was hidden

## Components to Modify

| Component          | Changes                                                   |
| ------------------ | --------------------------------------------------------- |
| `ChatActionBar`    | Restructure to two rows, add platform gating text         |
| `ChatContainer`    | Add keyboard handlers for H/T/B, add hidden message count |
| `ChatMessage`      | No changes needed (visual states already complete)        |
| `BanConfirmDialog` | Add reason presets, character counter                     |

## Components to Create

| Component       | Purpose                                         |
| --------------- | ----------------------------------------------- |
| `TimeoutPicker` | Inline preset buttons + custom duration popover |

## Preferences to Add (future)

- `showModeratedMessages`: boolean — toggle visibility of moderated users' messages
- `moderationShortcutsEnabled`: boolean — toggle keyboard shortcuts

## Out of Scope

- Moderation audit log (requires SQLite persistence, Phase 3.1)
- Chatter focus view / user profile panel (Phase 3.2)
- Bulk moderation actions (future)
- Undo/cancel for moderation actions (requires Twitch unban API integration)

## Implementation Order

1. Two-row action bar layout (visual only, no new behavior)
1. Keyboard shortcuts (H/T/B) in ChatContainer
1. Inline timeout preset buttons (replace dropdown)
1. Platform-aware disabled state for non-Twitch messages
1. Ban dialog improvements (reason presets)
1. Hidden messages summary counter
