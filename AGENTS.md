# AGENTS.md

Next.js 16 (App Router) streaming dashboard with OBS widgets and multi-platform
chat aggregation (Twitch, YouTube, Discord). TypeScript + Tailwind + shadcn/ui.

## Quick Reference

| Item | Location |
|------|----------|
| Package manifest | `package.json` |
| TypeScript config | `tsconfig.json` (strict mode enabled) |
| ESLint config | `eslint.config.mjs` (Next.js defaults) |
| Tailwind config | `tailwind.config.ts` |
| shadcn/ui config | `components.json` |
| Global styles | `app/globals.css` |

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # Run ESLint
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
    ├── youtube/            # YouTube Data API proxy + OAuth
    ├── discord/            # Discord OAuth + guild/channel APIs
    └── chat/               # Chat SSE stream + connect/disconnect

components/
├── ui/                     # shadcn/ui primitives
├── chat/                   # Chat-specific components
└── *.tsx                   # Shared components

lib/
├── utils.ts                # cn() helper for Tailwind classes
├── types/                  # Shared TypeScript types
├── chat/                   # Chat bridge implementations
└── discord/                # Discord auth helpers

hooks/                      # React hooks
```

## Code Style

### TypeScript

- **Strict mode** is enabled (`tsconfig.json`)
- Avoid `any`; use `unknown` and narrow types when needed
- Define explicit types for API responses and shared data
- Use `type` for object shapes, `interface` for extendable contracts
- Use literal unions for known value sets: `type Platform = "twitch" | "youtube"`

```typescript
// Good: explicit API response type
type TokenResponse = {
  access_token: string;
  expires_in: number;
};

// Good: literal union
type ChatPlatform = "twitch" | "youtube" | "discord";
```

### Imports

- Use `@/*` path alias for all imports (configured in tsconfig)
- Group imports: React/Next → third-party → local modules
- No unused imports (ESLint will flag these)

```typescript
import { NextResponse } from "next/server";         // Next.js
import { cookies } from "next/headers";

import { cn } from "@/lib/utils";                   // Local
import type { ChatMessage } from "@/lib/types/chat";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/functions | camelCase | `fetchChatStatus`, `isConnected` |
| Components | PascalCase | `ChatContainer`, `PlatformBadge` |
| Types/Interfaces | PascalCase | `ChatMessage`, `TokenResponse` |
| Constants | UPPER_SNAKE_CASE | `CHANNEL_TYPES`, `API_BASE_URL` |
| Files (components) | PascalCase | `ChatMessage.tsx` |
| Files (utilities) | camelCase | `demoData.ts` |
| API routes | kebab-case dirs | `app/api/chat/connect/route.ts` |

### Components

- Use function components with explicit return types when complex
- Prefer `"use client"` only when browser APIs are needed
- Keep components small; extract logic into hooks or utilities
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes

```typescript
"use client";

import { cn } from "@/lib/utils";

type Props = { active?: boolean; className?: string };

export function StatusDot({ active, className }: Props) {
  return (
    <span className={cn(
      "h-2 w-2 rounded-full",
      active ? "bg-emerald-500" : "bg-muted-foreground/50",
      className
    )} />
  );
}
```

### API Routes

- All routes in `app/api/*/route.ts`
- Return consistent JSON shape: `{ ok: boolean, data?, error? }`
- Validate inputs before external API calls
- Use `NextResponse.json()` for responses

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const param = url.searchParams.get("required");

  if (!param) {
    return NextResponse.json({ ok: false, error: "Missing parameter" });
  }

  return NextResponse.json({ ok: true, data: { /* ... */ } });
}
```

### Styling

- Use Tailwind utility classes; avoid inline styles except for dynamic values
- Color tokens defined as CSS variables in `app/globals.css`
- Use shadcn/ui theme colors: `bg-background`, `text-foreground`, `border-border`
- Custom neon colors available: `--neon-pink`, `--neon-cyan`, `--neon-violet`

### Error Handling

- API routes: return `{ ok: false, error: "message" }` with appropriate status
- Components: use fallback UI or demo data when APIs fail
- Catch blocks: use empty catch `catch { }` or `catch (error)` with logging

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

## Git Practices

- Never commit `.env`, `.env.local`, or files in `.data/`
- Keep commits focused on single features or fixes
- Run `npm run build` before pushing to catch type errors

## Adding New Features

1. **New API route**: Create `app/api/[name]/route.ts`
2. **New component**: Add to `components/` with PascalCase filename
3. **New page**: Add `app/[path]/page.tsx`
4. **shadcn/ui component**: `npx shadcn@latest add [component]`
5. **New types**: Add to `lib/types/` or colocate with feature

## External Integrations

| Platform | Auth Flow | Chat Bridge |
|----------|-----------|-------------|
| Twitch | OAuth → `/api/twitch/auth` | IRC via `TwitchBridge` |
| YouTube | OAuth → `/api/youtube/auth` | Polling via `YouTubeBridge` |
| Discord | OAuth → `/api/discord/auth` | Gateway via `DiscordBridge` |

Bot tokens and OAuth tokens are stored in httpOnly cookies.
