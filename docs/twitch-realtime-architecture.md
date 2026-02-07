# Twitch Real-time Data Architecture

## Overview

Hybrid approach using Twitch EventSub WebSocket for real-time events + slow polling for aggregate stats.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Server                                                                  │
│                                                                         │
│  ┌────────────────────┐         ┌─────────────────────────────────────┐ │
│  │ EventSub WebSocket │ ◀─────▶ │ wss://eventsub.wss.twitch.tv/ws    │ │
│  │ (real-time events) │         └─────────────────────────────────────┘ │
│  └─────────┬──────────┘                                                 │
│            │                                                            │
│            │  ┌────────────────┐      ┌───────────────────────────────┐ │
│            │  │ Stats Poller   │ ───▶ │ Twitch Helix API              │ │
│            │  │ (every 60s)    │ ◀─── │ /helix/streams, /followers    │ │
│            │  └───────┬────────┘      └───────────────────────────────┘ │
│            │          │                                                 │
│            ▼          ▼                                                 │
│  ┌─────────────────────────────┐                                        │
│  │ SSE Endpoint                │  /api/twitch/stream                    │
│  │ (broadcasts to clients)     │                                        │
│  └─────────────┬───────────────┘                                        │
└────────────────┼────────────────────────────────────────────────────────┘
                 │
                 │ SSE connection (no auth needed)
                 ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ Dashboard          │  │ Goal Widget (OBS)  │  │ Stats Widget (OBS) │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

## EventSub Events (Real-time)

| Event Type | Description | Use Case |
|------------|-------------|----------|
| `channel.follow` | New follower | Alerts, increment counter |
| `channel.subscribe` | New subscription | Alerts |
| `channel.subscription.gift` | Gift subs | Alerts |
| `channel.cheer` | Bits donation | Alerts |
| `channel.raid` | Incoming raid | Alerts |
| `stream.online` | Stream went live | Status update |
| `stream.offline` | Stream ended | Status update |

## Polled Data (Slow, ~60s interval)

| Endpoint | Data | Why Polling |
|----------|------|-------------|
| `/helix/streams` | Viewer count, stream title | No real-time event available |
| `/helix/channels/followers` | Total follower count | EventSub only sends individual events |

## SSE Event Format

```typescript
// Stats update (polled or derived)
{
  type: "stats",
  data: {
    live: boolean,
    viewers: number,
    followers: number,
    subs: number
  }
}

// Real-time event from EventSub
{
  type: "event",
  event: "channel.follow" | "channel.subscribe" | "channel.raid" | ...,
  data: { ... } // Event-specific payload
}
```

## Benefits

1. **Widgets don't need auth** - Subscribe to SSE, receive updates
2. **Reduced API calls** - Single poll serves all clients
3. **Instant alerts** - EventSub pushes events in real-time
4. **Scalable** - Server maintains one Twitch connection, broadcasts to many

## Implementation Files

- EventSub client: `lib/twitch/eventSubClient.ts` (to create)
- Stats poller: `lib/twitch/statsPoller.ts` (to create)
- SSE endpoint: `app/api/twitch/stream/route.ts` (to create)

## References

- [EventSub | Twitch Developers](https://dev.twitch.tv/docs/eventsub)
- [Handling WebSocket Events](https://dev.twitch.tv/docs/eventsub/handling-websocket-events)
- [EventSub Subscription Types](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/)
