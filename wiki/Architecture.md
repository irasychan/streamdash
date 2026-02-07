# Architecture

## Tech Stack

- **Next.js 16** (App Router) with React 19
- **shadcn/ui** + Tailwind CSS
- **Zustand** for client state
- **SSE** for real-time chat and events

## Project Structure

```
app/                # Routing + page composition only
  api/              # REST and SSE endpoints
  dashboard/        # Dashboard pages
  widgets/          # OBS browser source widgets
components/         # Shared UI primitives (shadcn + layout)
features/           # Feature modules (chat, dashboard, widgets, preferences)
services/           # External API clients (Twitch, YouTube, Discord)
state/              # Zustand stores
server/             # Server-only helpers (cookies, auth)
lib/                # Utilities, shared types, demo data
hooks/              # Generic reusable hooks
```

## Data Flow

```
Client Component → fetch("/api/...") → API Route → External API → JSON → UI
```

## Boundaries

| Layer | Owns | Does NOT touch |
|-------|------|----------------|
| `app/` | Routing, page composition | Business logic, API calls |
| `features/` | Feature UI, hooks, types | Other features directly |
| `services/` | External API clients | React, UI |
| `state/` | Global state, selectors | UI |
| `components/` | Shared UI primitives | Feature-specific logic |
| `server/` | Server-only helpers | Client code |

## Authentication

Twitch uses OAuth 2.0 with httpOnly cookies:

1. `/api/twitch/auth` starts the flow
2. `/api/twitch/callback` exchanges code for tokens
3. Tokens stored in cookies, auto-refresh on expiry

## Conventions

- `@/*` import alias (maps to project root)
- Server components by default; `"use client"` only when needed
- Strict TypeScript, no `any`
- `camelCase` vars/functions, `PascalCase` components/types, `UPPER_SNAKE_CASE` constants
- `cn()` from `@/lib/ui/cn` for className merging
- Structured JSON errors from API routes
- Demo data fallback on API failures

## Next.js 16 Notes

- `cookies()` from `next/headers` returns a Promise — must `await`
- `useSearchParams()` requires Suspense boundary
- ESLint 9 flat config (`eslint.config.mjs`)
