# AGENTS.md

This repository is a Next.js (App Router) project for a streaming dashboard
and OBS-ready widgets. Follow the conventions below when adding features.

## Quick Discovery Checklist

- Project manifest: `package.json` (Next.js + TypeScript).
- Lint config: `.eslintrc.json` (Next Core Web Vitals).
- Entrypoints: `app/` (App Router), `app/api/` for routes.
- Shared UI: `components/`, data helpers in `lib/`.
- No test runner configured yet.

## Commands (Build/Lint/Test)

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start production: `npm run start`
- Lint: `npm run lint`
- Tests: none configured yet (add and document when present).

### Running a Single Test (when a runner is added)

- Jest: `npm test -- path/to/file.test.ts` or `npm test -- -t "name"`
- Vitest: `npx vitest path/to/file.test.ts` or `npx vitest -t "name"`

## Code Style Guidelines

Follow the existing Next.js + TypeScript patterns in `app/` and `components/`.

### General

- Respect existing patterns before introducing new ones.
- Prefer small, composable functions; avoid large monoliths.
- Keep public APIs stable; avoid breaking changes without migration notes.
- Add comments only for non-obvious logic or tricky constraints.

### Formatting

- Use spaces, not tabs.
- Wrap lines at 100–120 chars when possible.
- Keep imports grouped and sorted; no unused imports.
- Prefer CSS classes in `app/globals.css`; inline style only for layout tweaks.

### Imports

- Use the `@/*` alias for absolute imports.
- Group imports: React/Next, third-party, local modules.
- Avoid circular dependencies; refactor if discovered.

### Naming

- Use `camelCase` for variables/functions in JS/TS.
- Use `PascalCase` for classes/components/types.
- Use `UPPER_SNAKE_CASE` for constants if the language expects it.
- Use clear, specific names; avoid single-letter identifiers.

### Types

- Prefer explicit types for API payloads and shared data.
- Avoid `any`; document why if needed.
- Use literal unions for known value sets.

### Error Handling

- Validate inputs in API routes; return structured errors.
- Surface errors in UI with fallbacks (demo data is acceptable).
- Log server errors with context (request + upstream response).

### Testing

- No test runner yet; add Jest or Vitest as needed.
- Favor unit tests for data helpers and API utilities once added.

### Frontend Defaults

- Use semantic HTML with accessible labels.
- Keep components small; prefer composition over inheritance.
- Keep visual tokens in CSS variables; avoid new inline colors.

### Backend Defaults

- API routes live in `app/api/*/route.ts`.
- Keep network fetch logic in API routes, not client components.
- Validate query params before calling upstream APIs.

## Repo-Specific Rules

- No `.cursor/rules/` or `.cursorrules` detected.
- No `.github/copilot-instructions.md` detected.
- If these appear later, merge their guidance here.

## Git Hygiene

- Do not commit secrets, credentials, or `.env` files.
- Keep commits focused; group related changes together.
- Update this file if new tooling or style standards are added.

## File Structure

- `app/layout.tsx`: root layout and fonts.
- `app/page.tsx`: landing page with links.
- `app/dashboard/page.tsx`: main dashboard.
- `app/widgets/*/page.tsx`: OBS browser widgets.
- `app/api/twitch/route.ts`: Twitch Helix proxy.
- `app/api/youtube/route.ts`: YouTube Data API proxy.
- `components/`: shared UI building blocks.
- `lib/demoData.ts`: demo stats fallback.

## Environment Variables

- `TWITCH_CLIENT_ID`: Twitch app client id.
- `TWITCH_CLIENT_SECRET`: Twitch app client secret.
- `TWITCH_APP_ACCESS_TOKEN`: Optional Twitch app access token (client credentials flow will auto-fetch if missing).
- `YOUTUBE_API_KEY`: YouTube Data API key.

## Recommended Defaults for New Code

- Keep everything in TypeScript.
- Prefer server components unless browser-only behavior is needed.
- If adding tests, document single-test commands here.

## When Updating This File

- Add the exact single-test invocation syntax used in CI.
- Capture any formatting rules (Prettier, etc.).
- Record any strict typing rules (tsconfig, eslint rules).
- Note new directory conventions and module boundaries.

## Contact

If you add new tooling or conventions, update this file immediately so
other agents do not guess.
