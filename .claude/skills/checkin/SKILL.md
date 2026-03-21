---
name: checkin
description: Start a work session by reading WORKLOG.md, worklogs/roadmap.md, and worklogs/bugs.md, then presenting a summary of active tasks, open bugs, and suggested next work. Use when beginning a new conversation or when the user says "check in", "what's next", "where were we", or "start session".
---

# Session Check-In

Read the following files (skip any that don't exist):

1. `WORKLOG.md` — active tasks, bugs, planned work
2. `worklogs/roadmap.md` — phases and long-term plan
3. `worklogs/bugs.md` — active, deferred, and fixed bugs

Then present a concise summary:

## Summary format

```
## Session Check-In

**Active tasks:** [list active items from WORKLOG.md]
**Open bugs:** [list from bugs.md, or "none"]
**Current phase:** [from roadmap.md]
**Suggested next:** [highest-priority incomplete item]
```

Keep it brief. Don't reproduce the full files — summarize what matters for deciding what to work on. After the summary, ask what the user wants to focus on.
