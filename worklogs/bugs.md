# Bugs

## Active

(none)

## Deferred

- [ ] Follower goal widget does not show live number when loaded as an OBS browser source
  - **Reason**: Will be fixed by Twitch Real-time Architecture (Phase 3.3) — EventSub + SSE will replace polling

## Fixed

- [x] **Unhide message doesn't restore it in OBS widget** — Widget was removing messages from state on hide, so unhide had nothing to restore. Fixed: widget now keeps messages in state and uses `hiddenMessageIds` filtering only (matching dashboard behavior). _(Jan 25, 2026)_
