---
name: wrapup
description: End a work session by updating WORKLOG.md, creating or updating a dated archive in worklogs/YYYY-MM-DD.md, and updating worklogs/roadmap.md and worklogs/bugs.md as needed. Use when the user says "wrap up", "end session", "log this", "update worklog", or when a significant chunk of work has been completed.
---

# Session Wrap-Up

Review what was accomplished this session, then update the worklog files.

## Steps

1. **Identify completed work** — look at recent git commits, file changes, and conversation context to build the list of what was done.

2. **Update WORKLOG.md:**
   - Mark completed tasks with `[x]`
   - Add any new tasks or bugs discovered during work
   - Update context notes if key files changed
   - Add the dated archive to the Archive list at the bottom

3. **Create/update `worklogs/YYYY-MM-DD.md`** (today's date) with:
   - One-line summary at top
   - A section per completed task: priority, what was done, files created/modified
   - Architecture decisions section (if any)
   - Remaining tasks section (if session ended with incomplete work)
   - `## Session Complete` at the end

4. **Update `worklogs/roadmap.md`** if:
   - A phase was completed (mark items `[x]`)
   - New phases or icebox items were identified

5. **Update `worklogs/bugs.md`** if:
   - New bugs were found (add to Active)
   - Bugs were fixed (move to Fixed)
   - Bugs are deferred (move to Deferred with reason)

## Rules

- Don't invent work that wasn't done — only log actual changes
- Keep the dated archive factual: files touched, decisions made
- WORKLOG.md should stay lean — archive completed sections promptly
- Ask the user to confirm before writing if anything is ambiguous
