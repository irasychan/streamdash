# Twitch Real-time Architecture

Hybrid approach: Twitch EventSub WebSocket for real-time events + slow polling for aggregate stats.

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Server                                                           │
│                                                                  │
│  EventSub WebSocket ◄──────► wss://eventsub.wss.twitch.tv/ws    │
│       │                                                          │
│       │    Stats Poller (60s) ──► Twitch Helix API               │
│       │         │                 /helix/streams, /followers      │
│       ▼         ▼                                                │
│  SSE Endpoint (/api/twitch/stream)                               │
│       │                                                          │
└───────┼──────────────────────────────────────────────────────────┘
        │ SSE (no auth needed)
        ▼
   Dashboard / Goal Widget / Stats Widget
```

## EventSub Events (Real-time)

| Event | Description | Use Case |
|-------|-------------|----------|
| `channel.follow` | New follower | Alerts, counter increment |
| `channel.subscribe` | New subscription | Alerts |
| `channel.subscription.gift` | Gift subs | Alerts |
| `channel.cheer` | Bits donation | Alerts |
| `channel.raid` | Incoming raid | Alerts |
| `stream.online` | Stream went live | Status update |
| `stream.offline` | Stream ended | Status update |

## Polled Data (~60s interval)

| Endpoint | Data | Why Polling |
|----------|------|-------------|
| `/helix/streams` | Viewer count, stream title | No real-time event available |
| `/helix/channels/followers` | Total follower count | EventSub only sends individual events |

## SSE Event Format

```typescript
// Stats update (polled or derived)
{ type: "stats", data: { live: boolean, viewers: number, followers: number, subs: number } }

// Real-time event from EventSub
{ type: "event", event: "channel.follow" | "channel.subscribe" | ..., data: { ... } }
```

## Benefits

- **Widgets don't need auth** — subscribe to SSE, receive updates
- **Reduced API calls** — single poll serves all clients
- **Instant alerts** — EventSub pushes events in real-time
- **Scalable** — one Twitch connection, broadcast to many clients
