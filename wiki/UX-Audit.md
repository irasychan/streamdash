# UX Audit

Audit of UX issues across the StreamDash dashboard, prioritized for implementation.

## High Priority

| Issue | Page | Description |
|-------|------|-------------|
| Chat UX redesign | Chat | Click-to-select, action bar, keyboard nav, ban confirmation (see [[Chat and Moderation]]) |
| Hardcoded channel | Stats | Stats page uses demo channel instead of user config |
| Save button in danger zone | Settings | Move save out of danger zone to sticky footer |

## Medium Priority

| Issue | Page | Description |
|-------|------|-------------|
| No save confirmation | Settings | Add toast on successful save |
| No reset confirmation | Settings | Add modal before wiping settings |
| Connection summary | Dashboard | Show platform status badges in header |
| No loading/error states | Stats | Add skeleton + error toast |

## Low Priority

| Issue | Page | Description |
|-------|------|-------------|
| Extract widget config forms | Widgets | Move inline forms to separate components |
| Developer-focused quick actions | Dashboard | Replace "Test App Token" with user-relevant actions |
| No data freshness indicator | Dashboard | Show "Updated X seconds ago" |
| No input validation | Settings | Validate channel names, video IDs, goal values |

## Reference: Good UX

The **Widgets page** is well-designed (auto-save, live preview, copy-to-clipboard, visual feedback). Use as reference for other pages.

## Cross-Cutting

- **Inconsistent error handling** — standardize on toast notifications for all API errors
- **No keyboard navigation** — add focus management and tab support (future)
