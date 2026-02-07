# UX Audit Report

**Date:** January 26, 2026
**Status:** Draft

---

## Executive Summary

This audit identifies UX pain points across the StreamDash dashboard and proposes fixes prioritized for Phase 3. Issues are categorized by severity and grouped by page.

---

## Issue Categories

- **Critical**: Blocks common workflows or causes confusion
- **Major**: Significant friction in daily use
- **Minor**: Polish items, nice-to-have improvements

---

## 1. Chat Page (Critical Priority)

*Detailed analysis in [chat-ux-redesign.md](./chat-ux-redesign.md)*

### Summary of Chat Issues
| Issue | Severity | Status |
|-------|----------|--------|
| No user context panel | Critical | Proposed |
| No keyboard shortcuts | Major | Proposed |
| Fixed 10min timeout only | Major | Proposed |
| No message filtering/search | Major | Proposed |
| No ban confirmation | Major | Proposed |
| Per-message hover buttons | Minor | Proposed |

---

## 2. Main Dashboard Page

### Issue 2.1: Duplicated Platform Connection UI
**Severity:** Major
**Location:** `app/dashboard/page.tsx:279-462`

**Problem:** The Chat Integrations card duplicates functionality from the Settings page. Users must remember which page to use for what.

**Current State:**
- Dashboard has full connect/disconnect UI with inputs
- Settings has the same platform configuration
- Confusing which is "source of truth"

**Proposed Fix:**
- Dashboard: Show connection status only (read-only)
- Settings: Full configuration
- Add "Configure" link to open Settings

---

### Issue 2.2: No Connection Status Summary
**Severity:** Minor
**Location:** `app/dashboard/page.tsx:214-241`

**Problem:** User must scroll to Chat Integrations to see which platforms are connected.

**Proposed Fix:**
- Add platform status badges in the header card next to "On Air" badge
- Show: Twitch ●, YouTube ●, Discord ○ (filled = connected)

---

### Issue 2.3: Developer-Focused Quick Actions
**Severity:** Minor
**Location:** `app/dashboard/page.tsx:476-494`

**Problem:** "Test App Token" is developer debugging, not useful for streamers.

**Proposed Fix:**
- Remove or move to Settings → Environment section
- Replace with user-relevant actions (e.g., "Open OBS Widget URLs", "Refresh Stats")

---

### Issue 2.4: No Data Freshness Indicator
**Severity:** Minor
**Location:** `app/dashboard/page.tsx:56` (refreshInterval = 20000)

**Problem:** Users don't know when stats were last updated.

**Proposed Fix:**
- Show "Updated X seconds ago" below status line
- Add manual refresh button

---

## 3. Stats Page

### Issue 3.1: Hardcoded Channel Name
**Severity:** Critical
**Location:** `app/dashboard/stats/page.tsx:16-18`

**Problem:** Stats page uses `demoStats.channel` instead of user's configured channel.

**Current Code:**
```typescript
const twitchResponse = await fetch("/api/twitch?channel=" + demoStats.channel);
```

**Proposed Fix:**
- Use `useConfig()` hook like main dashboard does
- Fetch from `config.platforms.twitch.defaultChannel`

---

### Issue 3.2: No Loading/Error States
**Severity:** Major
**Location:** `app/dashboard/stats/page.tsx:31-33`

**Problem:** Errors are silently swallowed, no loading indicator.

**Current Code:**
```typescript
} catch {
  // Keep demo data
}
```

**Proposed Fix:**
- Add loading skeleton while fetching
- Show error toast if API fails
- Indicate when showing demo vs live data

---

### Issue 3.3: Duplicates Main Dashboard
**Severity:** Minor

**Problem:** Stats page shows same 4 metrics as main dashboard cards. Limited value-add.

**Proposed Fix (Phase 5):**
- Add historical graphs (viewer count over time)
- Add session summaries
- Remove from nav until differentiated, or merge into dashboard

---

## 4. Settings Page

### Issue 4.1: Save Button Hidden in Danger Zone
**Severity:** Critical
**Location:** `app/dashboard/settings/page.tsx:341-355`

**Problem:** Users must open "danger zone" to save settings. Counterintuitive.

**Proposed Fix:**
- Move Save button to sticky footer or top header
- Keep only Reset in danger zone
- Or: Auto-save like Widgets page does

---

### Issue 4.2: No Save Confirmation Feedback
**Severity:** Major
**Location:** `app/dashboard/settings/page.tsx:210-218`

**Problem:** After save completes, button just goes back to "no changes". No success toast.

**Proposed Fix:**
- Show toast: "Settings saved successfully"
- Brief green checkmark animation on button

---

### Issue 4.3: Reset Has No Confirmation
**Severity:** Major
**Location:** `app/dashboard/settings/page.tsx:362`

**Problem:** Reset immediately wipes all settings. No "Are you sure?" modal.

**Proposed Fix:**
- Add confirmation dialog before reset
- Show what will be changed

---

### Issue 4.4: No Input Validation
**Severity:** Minor

**Problem:** No validation for channel names, video IDs, or goal numbers.

**Proposed Fix:**
- Validate Twitch channel format (alphanumeric + underscores)
- Validate YouTube video ID format (11 chars)
- Ensure goal target > 0

---

## 5. Widgets Page

### Issue 5.1: Good UX (Reference)
**Severity:** N/A

The Widgets page is well-designed:
- Auto-save on change
- Live preview iframe
- Clear copy-to-clipboard for URLs
- Visual feedback while saving

**Use as reference for other pages.**

---

### Issue 5.2: Forms at Bottom of File
**Severity:** Minor (Code Quality)
**Location:** `app/dashboard/widgets/page.tsx:180-382`

**Problem:** GoalWidgetConfigForm and StatsWidgetConfigForm are defined inline at bottom of page file.

**Proposed Fix:**
- Extract to `features/widgets/components/GoalWidgetConfigForm.tsx`
- Extract to `features/widgets/components/StatsWidgetConfigForm.tsx`

---

## 6. Global Navigation

### Issue 6.1: No Active State Highlighting
**Severity:** Minor

**Problem:** Navigation links don't clearly indicate current page (may already be implemented - verify).

**Verify:** Check sidebar/nav component for active styling.

---

## 7. Cross-Cutting Concerns

### Issue 7.1: Inconsistent Error Handling
**Severity:** Major

**Problem:** Some pages show errors, some silently fail, some show toasts.

**Proposed Fix:**
- Standardize on toast notifications for all API errors
- Add ErrorBoundary component for crash recovery

---

### Issue 7.2: No Keyboard Navigation
**Severity:** Minor

**Problem:** Dashboard is mouse-only (except Chat, which has proposed shortcuts).

**Proposed Fix (Future):**
- Add focus management
- Tab through interactive elements
- Escape to close modals

---

## Prioritized Fix List for Phase 3

### High Priority (Do First)
1. **Chat UX Redesign** - Per chat-ux-redesign.md
2. **Stats page hardcoded channel** - Quick fix
3. **Settings save button location** - Move out of danger zone

### Medium Priority
4. **Settings save confirmation** - Add toast
5. **Settings reset confirmation** - Add modal
6. **Dashboard connection summary** - Status badges in header
7. **Stats loading/error states** - Add feedback

### Low Priority (Phase 4+)
8. Extract widget config forms to separate files
9. Dashboard Quick Actions cleanup
10. Data freshness indicator
11. Input validation

---

## Next Steps

1. [ ] Review this audit with stakeholders
2. [ ] Create issues/tasks for High Priority items
3. [ ] Begin Chat UX Redesign (Phase 3a)
4. [ ] Fix Stats page channel bug (quick win)
5. [ ] Redesign Settings save flow
