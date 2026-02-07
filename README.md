# StreamDash

Next.js streaming dashboard with OBS-ready widgets and live data from Twitch, YouTube, and Discord. Ships with demo data so you can explore without credentials.

## Features

- Live dashboard with stream stats, goals, and unified multi-platform chat
- OBS browser source widgets (stats, follower goal, chat overlay)
- Chat moderation with message hiding, timeouts, and bans
- Message animations and customizable chat layouts
- Twitch Helix proxy with OAuth and app-token fallback
- YouTube live chat via [masterchat](https://github.com/holodata/masterchat) (no API quota)
- Discord bot chat integration

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```bash
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
YOUTUBE_API_KEY=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

All variables are optional — the app falls back to demo data.

## Documentation

See the [Wiki](https://github.com/irasychan/streamdash/wiki) for detailed docs:

- [OAuth Setup](https://github.com/irasychan/streamdash/wiki/OAuth-Setup) — Twitch, YouTube, and Discord credentials
- [OBS Widgets](https://github.com/irasychan/streamdash/wiki/OBS-Widgets) — Widget URLs, query params, and recommended sizes
- [API Reference](https://github.com/irasychan/streamdash/wiki/API-Reference) — All REST and SSE endpoints
- [Architecture](https://github.com/irasychan/streamdash/wiki/Architecture) — Project structure and data flow
- [Chat & Moderation](https://github.com/irasychan/streamdash/wiki/Chat-and-Moderation) — Chat features and moderation tools
- [Twitch Real-time](https://github.com/irasychan/streamdash/wiki/Twitch-Realtime) — EventSub + polling architecture

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint check |

## Credits

- [masterchat](https://github.com/holodata/masterchat) — YouTube live chat
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — Styling
