# OAuth Setup

YouTube chat works without any credentials. Twitch and Discord require OAuth for full functionality.

## Twitch

1. Create an app at the [Twitch Developer Console](https://dev.twitch.tv/console/apps).
2. Add redirect URL: `http://localhost:3000/api/twitch/callback` (add your production URL too).
3. Copy **Client ID** and **Client Secret** into `.env.local`:
   ```bash
   TWITCH_CLIENT_ID=
   TWITCH_CLIENT_SECRET=
   ```
4. Start the auth flow: visit `http://localhost:3000/api/twitch/auth`.

`TWITCH_APP_ACCESS_TOKEN` is optional — the app auto-fetches one via client credentials flow when missing. Follower counts require user OAuth (step 4).

## YouTube (No OAuth)

YouTube chat uses [masterchat](https://github.com/holodata/masterchat) which reverse-engineers YouTube's internal chat protocol:

- No API quota limits (YouTube Data API has 10,000 units/day; masterchat has none)
- No OAuth required — just provide a video ID or URL
- Real-time messages, faster than API polling

Accepted input formats:
- Video ID: `dQw4w9WgXcQ`
- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Live URL: `https://www.youtube.com/live/dQw4w9WgXcQ`

## Discord OAuth

1. Create an app at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Add redirect URL: `http://localhost:3000/api/discord/callback` (add your production URL too).
3. Copy credentials into `.env.local`:
   ```bash
   DISCORD_CLIENT_ID=
   DISCORD_CLIENT_SECRET=
   ```
4. Start auth: visit `http://localhost:3000/api/discord/auth`.

## Discord Bot (for chat)

Discord chat integration requires a bot token with the **MESSAGE_CONTENT** intent.

1. In the same Discord app, go to **Bot** tab and click **Add Bot**.
2. Under **Privileged Gateway Intents**, enable **MESSAGE CONTENT INTENT**.
3. Copy the bot token:
   ```bash
   DISCORD_BOT_TOKEN=
   ```
4. Go to **OAuth2 > URL Generator**, select `bot` scope with permissions:
   - Read Messages / View Channels
   - Read Message History
5. Open the generated URL to invite the bot to your server.
