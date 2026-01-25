# Streaming Dashboard

Next.js (App Router) dashboard for streamers with OBS-ready widgets and live data
connectors for Twitch, YouTube, and Discord chat. The UI ships with demo data
fallbacks so you can explore the layout before wiring credentials.

## Features

- Dashboard overview with live status, stats, goals, and unified chat
- OBS widgets for stream stats, follower goals, and live chat overlays
- Multi-platform chat aggregation (Twitch, YouTube, Discord) with customizable layouts
- Message animations (fade, slide, scale, bounce) for chat widgets
- Twitch Helix proxy with OAuth-based follower counts and app-token fallback
- YouTube live chat via [masterchat](https://github.com/holodata/masterchat) (no API quota limits)
- Server-sent events chat stream with connect/disconnect endpoints

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create a `.env.local` with the values you have available:

```bash
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_APP_ACCESS_TOKEN=
YOUTUBE_API_KEY=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

Notes:

- `TWITCH_APP_ACCESS_TOKEN` is optional; the app will attempt client credentials
  flow when missing.
- Twitch follower counts require OAuth (visit `/api/twitch/auth` after setting
   Twitch credentials).
- Discord chat requires `DISCORD_BOT_TOKEN` and a channel ID for `/api/chat/connect`.
- YouTube chat uses masterchat - no OAuth or API key required, just provide a video ID or URL.

## OAuth setup guide

You need OAuth clients for Twitch and Discord for full chat + stats features.
YouTube chat works without any credentials.

### Twitch OAuth

1. Create an app in the Twitch Developer Console:
   https://dev.twitch.tv/console/apps
2. Add redirect URL: `http://localhost:3000/api/twitch/callback` (add your
   production URL too).
3. Copy Client ID + Client Secret into `.env.local`.
4. Start auth: visit `http://localhost:3000/api/twitch/auth`.

Required env vars:

```bash
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```

### YouTube (No OAuth Required)

YouTube chat is powered by [masterchat](https://github.com/holodata/masterchat),
which reverse-engineers YouTube's internal chat protocol. This means:

- **No API quota limits** - YouTube Data API has 10,000 units/day; masterchat has none
- **No OAuth required** - Just provide a video ID or URL
- **Real-time messages** - Faster than API polling

To connect, provide either:
- Video ID: `dQw4w9WgXcQ`
- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Live URL: `https://www.youtube.com/live/dQw4w9WgXcQ`

### Discord OAuth

1. Create an OAuth2 app in the Discord Developer Portal:
   https://discord.com/developers/applications
2. Add redirect URL: `http://localhost:3000/api/discord/callback` (add your
   production URL too).
3. Copy Client ID + Client Secret into `.env.local`.
4. Start auth: visit `http://localhost:3000/api/discord/auth`.

Required env vars:

```bash
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

### Discord Bot (for chat)

Discord chat integration requires a bot token with the MESSAGE_CONTENT intent.

1. In the same Discord app, go to the **Bot** tab and click **Add Bot**.
2. Under **Privileged Gateway Intents**, enable **MESSAGE CONTENT INTENT**.
3. Copy the bot token into `.env.local` as `DISCORD_BOT_TOKEN`.
4. Go to **OAuth2 > URL Generator**, select `bot` scope with permissions:
   - Read Messages/View Channels
   - Read Message History
5. Open the generated URL to invite the bot to your server.

Required env vars:

```bash
DISCORD_BOT_TOKEN=
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - build production app
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Pages and widgets

- `/dashboard` - main streaming control center
- `/widgets/stats` - OBS stat card widget
- `/widgets/goal` - OBS follower goal widget
- `/widgets/chat` - OBS chat overlay

### Widget query params

Stats widget (`/widgets/stats`):

- `channel` - Twitch channel login
- `youtubeChannelId` - YouTube channel ID
- `youtubeHandle` or `handle` - YouTube handle (with or without `@`)

Goal widget (`/widgets/goal`):

- `channel` - Twitch channel login

Chat widget (`/widgets/chat`):

- `maxMessages` - max messages to keep (default 50)
- `platforms` - comma-separated list (`twitch,youtube,discord`)
- `showPlatform` - set to `false` to hide platform badges
- `transparent` - set to `true` for transparent OBS overlays
- `twitchChannel` - auto-connect Twitch channel
- `youtubeVideoId` - YouTube video ID or URL to connect
- `discordChannelId` - Discord channel id
- `fontSize` - `small`, `medium`, `large`
- `messageDensity` - `compact`, `comfortable`, `spacious`
- `messageLayout` - `inline`, `inline-wrap`, `stacked`
- `textAlign` - `left`, `center`, `right`
- `animation` - `none`, `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `scale`, `bounce`
- `showAvatars` - set to `true` to show user avatars
- `showBadges` - set to `false` to hide mod/sub badges

## API routes

- `GET /api/twitch?channel=NAME` - Twitch stats payload
- `GET /api/twitch/status` - auth status for Twitch
- `GET /api/twitch/auth` - start Twitch OAuth flow
- `GET /api/youtube?channelId=ID` or `?handle=HANDLE` - YouTube stats payload
- `GET /api/discord/status` - auth status for Discord
- `GET /api/discord/guilds` - list user's Discord servers (requires OAuth)
- `GET /api/discord/channels?guildId=ID` - list text channels in server (requires bot token)
- `POST /api/discord/refresh` - refresh Discord OAuth token
- `POST /api/chat/connect` - connect chat platform
- `POST /api/chat/disconnect` - disconnect chat platform
- `GET /api/chat/status` - connection status
- `GET /api/chat/sse` - server-sent events stream

## OBS usage

Add any widget URL as a Browser Source in OBS. For transparency, use the chat
widget with `transparent=true` and set OBS background color to transparent.

## Credits

- [masterchat](https://github.com/holodata/masterchat) - YouTube live chat without API limits
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
