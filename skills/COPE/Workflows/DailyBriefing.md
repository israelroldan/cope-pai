# Daily Briefing Workflow

Morning routine to set up the day.

## What Gets Surfaced

1. **School Logistics** — Dropoff/pickup times (from School skill)
2. **Calendar Overview** — Today's events from all calendars (from Scheduling skill)
3. **Slack Digest** — Overnight activity from key channels (from Slack skill)
4. **Top Priorities** — Active items from state.yaml
5. **Open Loops** — Things waiting on something/someone (includes Slack commitments)
6. **Inbox** — Unprocessed items needing attention
7. **Week Focus** — Current week's theme

## Briefing Order

### 1. School & Logistics
```
🏫 SCHOOL
   Leave by 08:15 for Amélie (1st period 9:00)
   Pickup: 14:45 (Philippe ends 14:45)
```

### 2. Calendar
```
📅 CALENDAR
   💼 Work:
      09:30 Team Standup (30min)
      14:00 Sprint Planning (1hr) ⚠️ ends after pickup!

   🏠 Home:
      18:00 Family dinner (Family)
```

### 3. Slack Digest
```
📱 SLACK OVERNIGHT
   #founders-talk: 3 messages (Sander on Q1 planning)
   #product: API refactor discussion (7 messages)

   💬 DMs: Maarten sent doc for review

   ⚠️ PENDING RESPONSES
      → Thomas: deployment question (2d, no response)

   📝 COMMITMENTS DETECTED
      → "Review PR" (promised to Thomas yesterday)
```

### 4. Conflicts & Warnings
```
⚠️ CONFLICT: Sprint Planning ends 15:00, pickup at 14:45
   → Leave meeting early or arrange alternate pickup
```

### 5. Priorities & Focus
```
📋 PRIORITIES
   1. Finish API review
   2. Prep for sprint planning

🎯 THE ONE THING: What makes today successful?
```

## Integration Points

**School skill:**
- `get_dropoff_time(today)` → morning logistics
- `get_pickup_time(today)` → afternoon constraint

**Scheduling skill:**
- `DailyAgenda` workflow → merged calendar view
- Flags conflicts between calendar and school

**Slack skill:**
- `DailyDigest` workflow → overnight channel activity
- `CommitmentScan` workflow → detected promises
- `ResponseTracker` workflow → pending responses
- Commitments get added to open loops

## The Key Question

> "What's the single most important thing today?"

This forces focus. Pick ONE thing that, if done, makes the day successful.

## Commands
```bash
bun run DailyStart.ts          # Show briefing
bun run DailyStart.ts done     # Mark complete
```

## When to Skip
Say "skip briefing" or "briefing done" if:
- Already know what to focus on
- Continuing from yesterday
- Time-sensitive task waiting

## Marking Complete
Once briefing is done, say "briefing done" to:
- Set `briefing_done: true` in daily.yaml
- Stop session-start prompts for the day
