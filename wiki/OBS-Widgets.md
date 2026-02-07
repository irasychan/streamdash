# OBS Widgets

Add any widget URL as a **Browser Source** in OBS. For transparency, use the chat widget with `transparent=true` and set the OBS background color to transparent.

## Recommended Sizes

| Widget | URL | Size |
|--------|-----|------|
| Chat Overlay | `/widgets/chat` | 400x600 |
| Follower Goal | `/widgets/goal` | 400x100 |
| Stream Stats | `/widgets/stats` | 400x100 |

## Query Parameters

### Stats Widget (`/widgets/stats`)

| Param | Description |
|-------|-------------|
| `channel` | Twitch channel login |
| `youtubeChannelId` | YouTube channel ID |
| `youtubeHandle` or `handle` | YouTube handle (with or without `@`) |

### Goal Widget (`/widgets/goal`)

| Param | Description |
|-------|-------------|
| `channel` | Twitch channel login |

### Chat Widget (`/widgets/chat`)

| Param | Values | Default | Description |
|-------|--------|---------|-------------|
| `maxMessages` | number | `50` | Max messages to keep |
| `platforms` | comma-separated | all | Filter platforms (`twitch,youtube,discord`) |
| `showPlatform` | `true`/`false` | `true` | Show platform badges |
| `transparent` | `true`/`false` | `false` | Transparent background for OBS |
| `twitchChannel` | string | — | Auto-connect Twitch channel |
| `youtubeVideoId` | string | — | YouTube video ID or URL |
| `discordChannelId` | string | — | Discord channel ID |
| `fontSize` | `small`, `medium`, `large` | `medium` | Text size |
| `messageDensity` | `compact`, `comfortable`, `spacious` | `comfortable` | Spacing between messages |
| `messageLayout` | `inline`, `inline-wrap`, `stacked` | `inline` | Message layout style |
| `textAlign` | `left`, `center`, `right` | `left` | Text alignment |
| `animation` | `none`, `fade`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `scale`, `bounce` | `none` | Message entrance animation |
| `showAvatars` | `true`/`false` | `false` | Show user avatars |
| `showBadges` | `true`/`false` | `true` | Show mod/sub badges |
