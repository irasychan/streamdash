# Local Message Hiding - Technical Design

## Overview

This feature allows moderators to hide chat messages locally without removing them from the actual platform (Twitch, YouTube, Discord). Hidden messages are:
- Still visible in the dashboard (with a visual indicator showing they're hidden)
- Not shown in the OBS widget

This enables quick moderation during streams without affecting the actual platform chat or requiring platform-specific permissions.

## Architecture

### Data Flow

```
Dashboard           Server                    OBS Widget
   │                  │                          │
   │  POST /hide      │                          │
   ├─────────────────>│                          │
   │                  │ Store in hiddenMessageIds│
   │                  │ Broadcast hide event     │
   │                  │─────────────────────────>│
   │<─────────────────│                          │
   │  SSE hide event  │  SSE hide event          │
   │                  │                          │
   │  Shows message   │         Filters out msg  │
   │  (dimmed)        │                          │
```

### Components Modified

1. **`features/chat/types/chat.ts`**
   - Added `"hide" | "unhide"` to `ChatModerationAction` type
   - Added `ChatHideEvent` type for SSE events
   - Updated `SSEClient` to handle `SSEEvent` union type

2. **`services/chat/ConnectionManager.ts`**
   - Added `hiddenMessageIds: Set<string>` for tracking hidden messages
   - Added `hideMessage()` and `unhideMessage()` methods
   - Added `broadcastHideEvent()` to notify all SSE clients

3. **`app/api/chat/hide/route.ts`** (new)
   - `POST` - Hide a message by ID
   - `DELETE` - Unhide a message by ID
   - `GET` - Get list of all hidden message IDs

4. **`features/chat/components/ChatMessage.tsx`**
   - Added `onHide` and `onUnhide` callback props
   - Added `isHidden` prop for visual styling
   - Added "Hide" / "Unhide" buttons in action bar
   - Hidden messages show with reduced opacity and subtle ring

5. **`features/chat/components/ChatContainer.tsx`**
   - Tracks `hiddenMessageIds` in state
   - Listens for hide/unhide SSE events
   - Fetches initial hidden list on connect
   - Passes hide handlers to ChatMessage

6. **`app/widgets/chat/page.tsx`**
   - Tracks `hiddenMessageIds` in state
   - Listens for hide/unhide SSE events
   - Filters out hidden messages from display
   - Uses `visibleMessages` memo for efficient filtering

### Storage

Hidden message IDs are stored in-memory in the server's `ConnectionManager` singleton. This means:
- Hidden messages persist for the lifetime of the server process
- Hidden state is shared across all dashboard clients
- Hidden state is lost on server restart (intentional - fresh start for new streams)

### API Endpoints

#### POST /api/chat/hide
Hide a message from the OBS widget.

**Request:**
```json
{
  "messageId": "twitch-abc123"
}
```

**Response:**
```json
{ "ok": true }
```

#### DELETE /api/chat/hide
Unhide a previously hidden message.

**Request:**
```json
{
  "messageId": "twitch-abc123"
}
```

**Response:**
```json
{ "ok": true }
```

#### GET /api/chat/hide
Get all hidden message IDs.

**Response:**
```json
{
  "ok": true,
  "data": ["twitch-abc123", "youtube-xyz789"]
}
```

### SSE Events

New event type broadcast to all clients:

```typescript
type ChatHideEvent = {
  type: "hide" | "unhide";
  messageId: string;
};
```

### UI Behavior

**Dashboard:**
- All messages shown
- Hidden messages appear dimmed (40% opacity) with subtle gray ring
- Hover reveals "Unhide" button (green) for hidden messages
- Hover reveals "Hide" button (gray) for visible messages

**OBS Widget:**
- Hidden messages are completely filtered out
- When a hide event is received, the message is immediately removed
- No visual indication of hidden messages

## Design Decisions

1. **Server-side storage**: Hidden IDs stored server-side so all dashboard clients and the widget share the same state.

2. **In-memory only**: No persistence across server restarts. This is intentional since hiding is typically per-stream.

3. **Real-time updates**: SSE broadcasts ensure instant sync across all clients.

4. **Separate from platform moderation**: This is local-only hiding. Timeout/ban still use platform APIs.

5. **Cross-platform support**: Works for all platforms (Twitch, YouTube, Discord) without platform-specific code.
