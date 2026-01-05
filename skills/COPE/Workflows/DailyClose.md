# Daily Close Workflow

End-of-day routine to capture state and close loops.

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Tasks | `collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c` |
| Decisions | `collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b` |
| Journal | `collection://2dff8fbf-cf75-816e-8222-000ba6610bff` |

## What Gets Reviewed

1. **Today's Decisions** — Decisions logged today (from LifeOS Decisions database)
2. **Priority Status** — What's completed, blocked, still active (from LifeOS Tasks)
3. **Open Loops** — Current waiting items (Tasks with "Waiting On" property)
4. **Lifelog Capture** — Conversations and memories from today (from Lifelog skill)
5. **Action Items** — New items detected from today's conversations

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

### Lifelog Sync
> "Any action items from today's conversations?"

Runs `ActionItemSync` workflow to capture commitments made in conversations.
Shows summary of today's lifelog:
```
LIFELOG TODAY
   Conversations: 4 (2hr 15min total)
   Notable: Meeting with Sander, Call with Robin Radar
   Action items synced: 3
```

## Commands
```bash
bun run DailyEnd.ts            # Show review
bun run DailyEnd.ts done       # Mark day closed
```

## "Done for the Day"
Say "done for the day" to:
- Create/update today's Journal entry with day close summary
- Stop all prompts until tomorrow

## Quick Close
If no review needed, just say "done for the day" to close without the full workflow.

## LifeOS Integration

### Query Today's Decisions
```
mcp__notion-personal__notion-search(
  query: "[today's date]",
  data_source_url: "collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b",
  filters: {
    created_date_range: {
      start_date: "[today YYYY-MM-DD]"
    }
  }
)
```

### Query Today's Task Progress
```
mcp__notion-personal__notion-search(
  query: "tasks",
  data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
)
```
Filter for tasks modified today

### Create/Update Journal Entry
First, search for today's entry:
```
mcp__notion-personal__notion-search(
  query: "[today YYYY-MM-DD]",
  data_source_url: "collection://2dff8fbf-cf75-816e-8222-000ba6610bff"
)
```

If no entry exists, create one:
```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-816e-8222-000ba6610bff" },
  pages: [{
    properties: {
      "Entry": "[Date - Day of Week]",
      "date:Date:start": "[today YYYY-MM-DD]",
      "date:Date:is_datetime": 0,
      "Mood": "[mood if specified]",
      "Rating": "[rating if specified]"
    },
    content: "## Day Close\n\n### What Got Done\n- [list of completed tasks]\n\n### Decisions Made\n- [decisions logged today]\n\n### Open Loops\n- [items waiting on something]\n\n### Reflection\n[optional reflection]"
  }]
)
```

If entry exists, append to it:
```
mcp__notion-personal__notion-update-page(
  data: {
    page_id: "[journal_page_id]",
    command: "insert_content_after",
    selection_with_ellipsis: "[last content]...",
    new_str: "\n\n## Day Close\n\n### What Got Done\n- [list of completed tasks]\n\n### Reflection\n[optional reflection]"
  }
)
```
