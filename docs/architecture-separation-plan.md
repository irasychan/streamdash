# Architecture Separation Plan

## Objectives
- Separate routing/composition from feature logic.
- Isolate external integrations (Twitch/YouTube/Discord) from UI.
- Reduce provider nesting and improve state update locality.
- Keep Next.js App Router conventions intact.

## Proposed Target Structure
```
app/                # Routing + page composition only
components/         # Shared UI primitives (shadcn + layout)
features/           # Feature modules (chat, dashboard, widgets, auth)
services/           # External API clients/adapters
state/              # Zustand stores (or context providers if retained)
server/             # Server-only logic (cookies, auth helpers)
lib/                # Cross-cutting utilities + shared types
hooks/              # Generic, reusable hooks only
```

## Boundaries (Rules of the Road)
- app/: only composes feature UIs; no business logic or API calls.
- features/: owns feature types, UI, hooks, and state selectors.
- services/: only external APIs/clients; no React imports.
- state/: global state and selectors; no UI.
- components/: shared UI only; no feature-specific logic.
- server/: server-only helpers; explicitly mark if needed.
- lib/: shared utilities and generic types.

## Phase 0 - Inventory (No Code Changes)
- List current contexts/providers and their consumers.
- List current API routes and the integration they call.
- Identify high-churn state vs low-churn state.

## Phase 1 - Low-Risk Moves
- Move integration helpers into `services/`:
  - `lib/chat/*` adapters into `services/chat/` if not React-bound
  - `lib/discord/*` into `services/discord/`
- Move shared layout components into `components/layout/`.
- Keep import paths using `@/` alias.

## Phase 2 - Feature Modules
- Create `features/chat/`, `features/dashboard/`, `features/widgets/`.
- Move feature UI into `features/*/ui/`.
- Move feature types into `features/*/types.ts` (or keep in `lib/types` if shared).
- Move feature hooks into `features/*/hooks/`.

## Phase 3 - State Refactor
- Introduce `state/` with Zustand (or keep contexts if chosen).
- Migrate high-frequency contexts first (chat status).
- Split hot vs cold slices to reduce rerenders.
- Update consumers to select only needed slices.

## Phase 4 - Route Cleanup
- Ensure `app/` pages only import feature UI.
- API routes should call services + server helpers only.
- Replace any direct UI-to-service calls with feature hooks.

## Mapping Candidates (Initial)
- `contexts/ChatStatusContext.tsx` -> `state/chatStore.ts`
- `contexts/DashboardStatusContext.tsx` -> `state/dashboardStore.ts`
- `components/chat/*` -> `features/chat/ui/*`
- `components/dashboard-layout-client.tsx` -> `components/layout/` or `features/dashboard/ui/`
- `lib/discord/*` -> `services/discord/*`
- `lib/chat/*` -> `services/chat/*`

## Migration Checklist
- [x] Add folder skeletons
- [x] Move low-risk files, update imports
- [x] Add stores and migrate contexts (Zustand)
- [x] Update layout/provider tree
- [x] Validate build and lint
- [x] Move feature UI into feature modules
- [x] Remove backwards-compatible re-exports after migration
- [x] Move services to top-level `services/`
- [x] Move state to top-level `state/`
- [x] Create `server/` for server-only logic

## Risks / Watchouts
- Server/client boundary violations (e.g., importing server code into client components).
- Circular deps between features and services.
- Long import paths if aliases aren't updated.

## Done Criteria
- [x] `app/` contains only layouts/pages with minimal logic.
- [x] Features are encapsulated and discoverable.
- [x] External integrations live in `services/` and are testable in isolation.
- [x] Provider nesting reduced or removed.

## Status: COMPLETE ✓

All objectives achieved. The codebase now follows the proposed target structure with top-level directories for `features/`, `services/`, `state/`, and `server/`. Migration is complete and legacy re-exports have been removed.
