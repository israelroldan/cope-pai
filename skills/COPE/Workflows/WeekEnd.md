# Week End Review Workflow

Use this workflow on Friday to close out the week.

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Tasks | `collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c` |
| Goals | `collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a` |
| Journal | `collection://2dff8fbf-cf75-816e-8222-000ba6610bff` |
| Decisions | `collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b` |

## Steps

### 1. Capture Wins
```
What got done this week?
- Completed priorities
- Progress made
- Problems solved
```

### 2. Identify Carries
```
What moves to next week?
- Incomplete priorities
- New items that emerged
- Blocked items
```

### 3. Extract Learnings
```
What did you learn?
- What worked well?
- What didn't work?
- What would you do differently?
```

### 4. Lifelog Week Summary
```
LIFELOG WEEK SUMMARY
   Conversations: 23 (12hr total)
   Notable: 3 meetings with founders, 2 client calls
   Action items: 8 detected, 5 completed
   Key memories: [top 3 by category]
```

Reviews lifelog for the week to surface:
- Key conversations and their outcomes
- Commitments made and fulfilled
- Insights or memories worth remembering

### 5. Rate the Week (Optional)
```
1 = Terrible, nothing worked
2 = Below expectations
3 = Okay, met minimum
4 = Good, solid progress
5 = Great, exceeded goals
```

## Commands
```bash
bun run WeeklyReview.ts end             # Show review
bun run WeeklyReview.ts win "..."       # Log win
bun run WeeklyReview.ts carry "..."     # Log carry
bun run WeeklyReview.ts learning "..."  # Log learning
bun run WeeklyReview.ts end --done      # Mark complete
```

## Questions to Ask
- "What am I proud of this week?"
- "What would I do differently?"
- "What's the one thing to carry forward?"

## LifeOS Integration

### Query Week's Completed Tasks
```
mcp__notion-personal__notion-search(
  query: "done completed",
  data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c",
  filters: {
    created_date_range: {
      start_date: "[Monday of this week YYYY-MM-DD]",
      end_date: "[today YYYY-MM-DD]"
    }
  }
)
```
Filter for Status = "Done"

### Query Week's Decisions
```
mcp__notion-personal__notion-search(
  query: "decision",
  data_source_url: "collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b",
  filters: {
    created_date_range: {
      start_date: "[Monday of this week YYYY-MM-DD]"
    }
  }
)
```

### Query Goal Progress
```
mcp__notion-personal__notion-search(
  query: "Q1 2026",
  data_source_url: "collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a"
)
```
Review progress on current quarter goals

### Query Open Loops (Carries)
```
mcp__notion-personal__notion-search(
  query: "waiting",
  data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
)
```
Items carrying to next week

### Create Weekly Review Journal Entry
```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-816e-8222-000ba6610bff" },
  pages: [{
    properties: {
      "Entry": "Week [N] Review - [Date Range]",
      "date:Date:start": "[Friday YYYY-MM-DD]",
      "date:Date:is_datetime": 0,
      "Rating": "[1-5 rating]"
    },
    content: "## Week [N] Review\n\n### Wins\n- [completed tasks and achievements]\n\n### Goal Progress\n- [goal]: [progress %] → [notes]\n\n### Decisions Made\n- [list of week's decisions]\n\n### Carries to Next Week\n- [incomplete items]\n- [open loops]\n\n### Learnings\n- What worked: [notes]\n- What didn't: [notes]\n- Do differently: [notes]\n\n### Week Rating: [1-5]\n[Optional reflection]"
  }]
)
```
