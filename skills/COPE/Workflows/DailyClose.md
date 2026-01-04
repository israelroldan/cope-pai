# Daily Close Workflow

End-of-day routine to capture state and close loops.

## What Gets Reviewed

1. **Today's Decisions** — Decisions logged today
2. **Priority Status** — What's completed, blocked, still active
3. **Open Loops** — Current waiting items

## Prompts

### Unlogged Decisions
> "Any decisions made today worth capturing?"

Even small decisions have rationale worth recording.

### New Open Loops
> "Anything now waiting on something/someone?"

Capture dependencies before they're forgotten.

### Unresolved Items
> "Anything unresolved that needs a note?"

Quick capture prevents morning fog.

## Commands
```bash
bun run DailyEnd.ts            # Show review
bun run DailyEnd.ts done       # Mark day closed
```

## "Done for the Day"
Say "done for the day" to:
- Set `day_closed: true`
- Set `briefing_done: true`
- Stop all prompts until tomorrow

## Quick Close
If no review needed, just say "done for the day" to close without the full workflow.
