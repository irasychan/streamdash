# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Run production server
npm run lint         # ESLint check
```

## Architecture Overview

This is a **Next.js 16 App Router** streaming dashboard that displays Twitch/YouTube metrics with OBS-ready widgets. Uses **shadcn/ui** component library with Tailwind CSS.

### Data Flow

```
Client Component → fetch("/api/...") → API Route → External API (Twitch/YouTube) → JSON Response → UI Update
```

### Key Directories

- `app/` - Pages and API routes (App Router)
- `app/api/twitch/` - Twitch OAuth flow and data endpoints
- `app/api/youtube/` - YouTube stats endpoint
- `app/widgets/` - OBS browser source widgets (wrapped in Suspense for useSearchParams)
- `components/` - Reusable UI components
- `components/ui/` - shadcn/ui components (add via `npx shadcn@latest add <component>`)
- `lib/` - Utilities (`cn()` helper) and demo data

### Authentication

Twitch uses OAuth 2.0 with httpOnly cookies for token storage. Flow:
1. `/api/twitch/auth` initiates OAuth
2. `/api/twitch/callback` exchanges code for tokens
3. Tokens stored in cookies, auto-refresh on expiry

### API Response Pattern

All API routes return: `{ ok: boolean, data?: T, error?: string }`

## Next.js 16 Notes

- `cookies()` from `next/headers` returns a Promise - must use `await cookies()`
- `useSearchParams()` requires Suspense boundary wrapping
- ESLint 9 flat config format (`eslint.config.mjs`)

## Code Conventions

From `AGENTS.md`:

- Use `@/*` import alias (maps to root)
- Prefer server components; add `"use client"` only when needed
- Strict TypeScript - avoid `any`
- Naming: `camelCase` (vars/functions), `PascalCase` (components/types), `UPPER_SNAKE_CASE` (constants)
- Use `cn()` from `@/lib/utils` for className merging
- CSS classes in `globals.css`; Tailwind for utilities
- Return structured JSON errors from API routes
- Fallback to demo data on API failures

## Environment Variables

Required in `.env.local`:
```
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
YOUTUBE_API_KEY=
```

Optional:
```
TWITCH_APP_ACCESS_TOKEN=  # Auto-fetched if missing
```

## Styling

Uses shadcn/ui CSS variables (HSL format) in `globals.css`. Dark theme with custom colors:
- `--background`, `--foreground` - Base colors
- `--primary`, `--accent` - Gold accent (#f6b75b)
- `--destructive` - Error red
- `--muted`, `--muted-foreground` - Secondary text

Custom theme variables also available: `--bg-deep`, `--bg-panel`, `--accent-gold`, etc.
