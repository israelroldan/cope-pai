# Daily Briefing Workflow

Morning routine to set up the day.

## What Gets Surfaced

1. **School Logistics** — Dropoff/pickup times (from School skill)
2. **Calendar Overview** — Today's events from all calendars (from Scheduling skill)
3. **Email Digest** — Unread emails, VIP messages (from Email skill)
4. **Slack Digest** — Overnight activity from key channels (from Slack skill)
5. **Lifelog Digest** — Overnight conversations and memories (from Lifelog skill)
6. **Top Priorities** — Active tasks from LifeOS Tasks database
7. **Open Loops** — Tasks with "Waiting On" property (includes Slack commitments, lifelog action items)
8. **Inbox** — Unprocessed items from LifeOS Notes database
9. **Week Focus** — Current quarter goals from LifeOS Goals database

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

### 3. Email Digest
```
EMAIL (Tatoma)
   Unread: 5 (2 from VIPs)
   * Sander: "Q1 Budget Review" - action needed
   * Thomas: "Deployment status"

   Pending responses: 2
      → "API specs" to Robin Radar (2 days overdue)
```

### 4. Slack Digest
```
SLACK OVERNIGHT
   #founders-talk: 3 messages (Sander on Q1 planning)
   #product: API refactor discussion (7 messages)

   DMs: Maarten sent doc for review

   PENDING RESPONSES
      → Thomas: deployment question (2d, no response)

   COMMITMENTS DETECTED
      → "Review PR" (promised to Thomas yesterday)
```

### 5. Lifelog Digest
```
LIFELOG OVERNIGHT
   Conversations: 2
   * Evening discussion about weekend plans

   New memories: 1
   "Remember to check garden irrigation"

   Action items: 1 (synced to open loops)
```

### 6. Conflicts & Warnings
```
CONFLICT: Sprint Planning ends 15:00, pickup at 14:45
   → Leave meeting early or arrange alternate pickup
```

### 7. Priorities & Focus
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

**Email skill:**
- `InboxDigest` workflow → unread count, VIP messages
- `TrackResponses` workflow → pending email responses
- Surfaces emails needing action

**Slack skill:**
- `DailyDigest` workflow → overnight channel activity
- `CommitmentScan` workflow → detected promises
- `ResponseTracker` workflow → pending responses
- Commitments get added to open loops

**Lifelog skill:**
- `LifelogDigest` workflow → overnight conversations and memories
- `ActionItemSync` workflow → syncs detected action items to open loops
- Surfaces key memories and commitments from conversations

**LifeOS skill (Notion):**
- Priorities, open loops, inbox, and goals from Notion databases
- Replaces state.yaml as the source of truth

## LifeOS Queries

### Query Priorities (Tasks with High Priority)
```
mcp__notion-personal__notion-search(
  query: "priority",
  data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
)
```
Filter results for Status != "Done" and Priority = "High Priority"

### Query Open Loops (Tasks with Waiting On)
```
mcp__notion-personal__notion-search(
  query: "waiting",
  data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
)
```
Filter for tasks where "Waiting On" property is not empty

### Query Inbox Items
```
mcp__notion-personal__notion-search(
  query: "inbox",
  data_source_url: "collection://2dff8fbf-cf75-8171-b984-000b1a6487f3"
)
```
Filter for Status = "Inbox"

### Query Week Focus (Current Quarter Goals)
```
mcp__notion-personal__notion-search(
  query: "Q1 2026",
  data_source_url: "collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a"
)
```
Show progress on current quarter goals

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
- Create/update today's Journal entry in LifeOS with briefing status
- Stop session-start prompts for the day

```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-816e-8222-000ba6610bff" },
  pages: [{
    properties: {
      "Entry": "[Date - Day of Week]",
      "date:Date:start": "[today YYYY-MM-DD]",
      "date:Date:is_datetime": 0
    },
    content: "## Morning Briefing\nBriefing completed at [time]."
  }]
)
```
