# API Reference

All API routes return `{ ok: boolean, data?: T, error?: string }`.

## Twitch

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/twitch?channel=NAME` | Twitch stats payload |
| GET | `/api/twitch/status` | Auth status |
| GET | `/api/twitch/auth` | Start OAuth flow |
| GET | `/api/twitch/callback` | OAuth callback (internal) |

## YouTube

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/youtube?channelId=ID` | YouTube stats by channel ID |
| GET | `/api/youtube?handle=HANDLE` | YouTube stats by handle |

## Discord

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discord/status` | Auth status |
| GET | `/api/discord/guilds` | List user's servers (requires OAuth) |
| GET | `/api/discord/channels?guildId=ID` | List text channels (requires bot token) |
| POST | `/api/discord/refresh` | Refresh OAuth token |

## Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/connect` | Connect a chat platform |
| POST | `/api/chat/disconnect` | Disconnect a chat platform |
| GET | `/api/chat/status` | Connection status |
| GET | `/api/chat/sse` | Server-sent events stream |

## Message Hiding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/hide` | Hide a message (`{ messageId }`) |
| DELETE | `/api/chat/hide` | Unhide a message (`{ messageId }`) |
| GET | `/api/chat/hide` | Get all hidden message IDs |

### SSE Event Types

```typescript
// Chat message
{ type: "message", data: ChatMessage }

// Hide/unhide event
{ type: "hide" | "unhide", messageId: string }

// Stats update
{ type: "stats", data: { live, viewers, followers, subs } }
```
