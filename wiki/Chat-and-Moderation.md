# Chat and Moderation

## Overview

StreamDash aggregates chat from Twitch, YouTube, and Discord into a unified feed. The dashboard provides moderation tools while OBS widgets display a clean overlay.

## Chat Modes

**Dashboard mode** (click-to-select):
- Click a message to select it
- Keyboard navigation: `↑`/`↓` to move, `Esc` to deselect
- Action bar appears at the bottom with Hide/Unhide, Timeout (1m/10m/1h), Ban

**Widget mode** (OBS overlay):
- Hover buttons for quick actions
- Hidden messages are filtered out entirely
- Auto-scrolls with new messages

## Local Message Hiding

Messages can be hidden locally without affecting the actual platform chat. This enables quick moderation without requiring platform-specific permissions.

### Behavior

| Context | Hidden Message |
|---------|---------------|
| Dashboard | Shown dimmed (40% opacity) with gray ring, "Unhide" button |
| OBS Widget | Completely filtered out |

### How It Works

1. Dashboard sends `POST /api/chat/hide` with the message ID
2. Server stores the ID in-memory and broadcasts an SSE hide event
3. All connected clients receive the event:
   - Dashboard dims the message
   - Widget removes the message

Hidden state is in-memory only — resets on server restart (intentional for fresh streams).

## Ban Confirmation

Banning opens a confirmation dialog with an optional reason textarea. This prevents accidental bans.

## Timeout Options

Timeout durations: 1 minute, 10 minutes, 1 hour. Available from the action bar dropdown when a message is selected.

## Planned Improvements

- User context side panel (account age, follow status, message history)
- Keyboard shortcuts (`h` hide, `t` timeout, `b` ban, `/` search)
- Platform and keyword filters
- Message search
