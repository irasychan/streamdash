# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Next.js 16 (App Router) streaming dashboard with OBS widgets and multi-platform chat aggregation (Twitch, YouTube, Discord). TypeScript + Tailwind + shadcn/ui.

## Quick Reference

| Item              | Location                                   |
| ----------------- | ------------------------------------------ |
| Package manifest  | `package.json`                             |
| TypeScript config | `tsconfig.json` (strict mode enabled)      |
| ESLint config     | `eslint.config.mjs` (ESLint 9 flat config) |
| Tailwind config   | `tailwind.config.ts`                       |
| shadcn/ui config  | `components.json`                          |
| Global styles     | `app/globals.css`                          |

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (run before pushing to catch type errors)
npm start            # Run production server
npm run lint         # ESLint check
```

### Testing (not yet configured)

No test runner is configured. When adding tests:

```bash
# Jest
npm test -- path/to/file.test.ts
npm test -- -t "test name pattern"

# Vitest
npx vitest path/to/file.test.ts
npx vitest -t "test name pattern"
```

## Project Structure

```
app/
├── layout.tsx              # Root layout with fonts
├── page.tsx                # Landing page
├── globals.css             # CSS variables and utilities
├── dashboard/
│   ├── layout.tsx          # Dashboard shell with sidebar
│   └── page.tsx            # Main dashboard view
├── widgets/*/page.tsx      # OBS browser source widgets
└── api/
    ├── twitch/             # Twitch Helix proxy + OAuth
    ├── youtube/            # YouTube Data API proxy
    ├── discord/            # Discord OAuth + guild/channel APIs
    └── chat/               # Chat SSE stream + connect/disconnect/moderate

components/
└── ui/                     # shadcn/ui primitives

features/
├── chat/                   # Chat components, hooks, types, utils
│   ├── components/         # ChatContainer, ChatMessage, ChatActionBar, BanConfirmDialog, etc.
│   ├── hooks/              # useChatStatus
│   ├── types/              # chat.ts
│   └── utils/              # emoteRenderer
├── dashboard/              # Dashboard hooks
├── widgets/                # Widget config components
├── emotes/                 # Emote types and hooks
├── config/                 # App config hook and types
└── preferences/            # User preferences

lib/
├── ui/cn.ts                # cn() helper for Tailwind class merging
├── demoData.ts             # Fallback demo data
└── chat/                   # Chat utilities (e.g. usernameColor)
```

## Architecture

### Data Flow

```
Client Component → fetch("/api/...") → API Route → External API → JSON Response → UI Update
```

### Authentication

Twitch and Discord use OAuth 2.0 with httpOnly cookies for token storage:

- Twitch: `/api/twitch/auth` → `/api/twitch/callback` → tokens in cookies, auto-refresh on expiry
- Discord: `/api/discord/auth` → `/api/discord/callback` → tokens in cookies

### API Response Pattern

All API routes return: `{ ok: boolean, data?: T, error?: string }`

### Chat Architecture

`ChatMessage` supports two render modes:

- **Widget mode** (no `onSelect` prop): hover buttons visible, used in OBS widget
- **Dashboard mode** (`onSelect` provided): click-to-select, no hover buttons

`ChatContainer` manages selection state, keyboard nav (↑↓ Esc), action bar, and ban dialog. Auto-scroll pauses when a message is selected.

## Next.js 16 Notes

- `cookies()` from `next/headers` returns a Promise — must use `await cookies()`
- `useSearchParams()` requires Suspense boundary wrapping (widgets use this)
- ESLint 9 flat config format (`eslint.config.mjs`)

## Code Conventions

### TypeScript

- **Strict mode** enabled (`tsconfig.json`)
- Avoid `any`; use `unknown` and narrow types when needed
- Define explicit types for API responses and shared data
- Use `type` for object shapes, `interface` for extendable contracts
- Use literal unions for known value sets: `type Platform = "twitch" | "youtube"`

### Imports

- Use `@/*` path alias for all imports (configured in tsconfig)
- Group imports: React/Next → third-party → local modules
- No unused imports (ESLint will flag these)

```typescript
import { NextResponse } from "next/server";

import { cn } from "@/lib/ui/cn";
import type { ChatMessage } from "@/features/chat/types/chat";
```

### Naming Conventions

| Type                | Convention       | Example                          |
| ------------------- | ---------------- | -------------------------------- |
| Variables/functions | camelCase        | `fetchChatStatus`, `isConnected` |
| Components          | PascalCase       | `ChatContainer`, `PlatformBadge` |
| Types/Interfaces    | PascalCase       | `ChatMessage`, `TokenResponse`   |
| Constants           | UPPER_SNAKE_CASE | `CHANNEL_TYPES`, `API_BASE_URL`  |
| Files (components)  | PascalCase       | `ChatMessage.tsx`                |
| Files (utilities)   | camelCase        | `demoData.ts`                    |
| API routes          | kebab-case dirs  | `app/api/chat/connect/route.ts`  |

### Components

- Use function components with explicit return types when complex
- Prefer server components; add `"use client"` only when browser APIs are needed
- Keep components small; extract logic into hooks or utilities
- Use `cn()` from `@/lib/ui/cn` for conditional Tailwind classes

### API Routes

- All routes in `app/api/*/route.ts`
- Return consistent JSON shape: `{ ok: boolean, data?, error? }`
- Validate inputs before external API calls
- Use `NextResponse.json()` for responses

### Styling

- Use Tailwind utility classes; avoid inline styles except for dynamic values
- Color tokens defined as CSS variables in `app/globals.css`
- Use shadcn/ui theme colors: `bg-background`, `text-foreground`, `border-border`
- Custom theme variables: `--bg-deep`, `--bg-panel`, `--accent-gold`, `--neon-pink`, `--neon-cyan`, `--neon-violet`
- When adding shadcn components, verify the `cn` import path is `@/lib/ui/cn` (the CLI generates the wrong path)

### Error Handling

- API routes: return `{ ok: false, error: "message" }` with appropriate status
- Components: use fallback UI or demo data when APIs fail
- Catch blocks: `catch { }` or `catch (error)` with logging

## Environment Variables

```bash
# Twitch
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_APP_ACCESS_TOKEN=      # Optional, auto-fetched if missing

# YouTube
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=            # Required for chat (needs MESSAGE_CONTENT intent)
```

## External Integrations

| Platform | Auth Flow                   | Chat Bridge                                       |
| -------- | --------------------------- | ------------------------------------------------- |
| Twitch   | OAuth → `/api/twitch/auth`  | IRC via `TwitchIRC`                               |
| YouTube  | None required               | Masterchat (reverse-engineered internal protocol) |
| Discord  | OAuth → `/api/discord/auth` | Gateway via `DiscordBridge`                       |

Bot tokens and OAuth tokens are stored in httpOnly cookies.

### YouTube Chat (Masterchat)

Uses the `masterchat` library which reverse-engineers YouTube's internal chat protocol:

- No API quota limits (unlike YouTube Data API's 10,000 units/day)
- No OAuth required — works with just a video ID or URL
- Real-time messages via YouTube's internal protocol

Accepted input formats: video ID (`dQw4w9WgXcQ`), watch URL, or live URL.

## Git Practices

- Never commit `.env`, `.env.local`, or files in `.data/`
- Keep commits focused on single features or fixes
- Run `npm run build` before pushing to catch type errors

## Adding New Features

1. **New API route**: Create `app/api/[name]/route.ts`
1. **New component**: Add to `features/[feature]/components/` or `components/` if shared
1. **New page**: Add `app/[path]/page.tsx`
1. **shadcn/ui component**: `npx shadcn@latest add [component]` — then fix `cn` import path to `@/lib/ui/cn`
1. **New types**: Add to `features/[feature]/types/` or colocate with feature
