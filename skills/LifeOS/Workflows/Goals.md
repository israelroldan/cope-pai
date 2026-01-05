# Goals Workflow

View and track goals and objectives.

## Trigger

- "my goals"
- "quarterly goals"
- "what am I working toward"
- "goal progress"

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Goals | `collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a` |

## Steps

1. **Query Goals Database**
   ```
   mcp__notion-personal__notion-search(
     query: "goals",
     data_source_url: "collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a"
   )
   ```

   Filter results for active goals (Status != "Completed")

2. **Format Output**
   ```
   ACTIVE GOALS

   Q1 2026:
   - [Goal] - [Progress %]
     Key results: [list]

   2026:
   - [Annual Goal] - [Progress %]

   Someday:
   - [Long-term goal]
   ```

3. **Link to Projects**
   - Show which projects support each goal

## Goal Properties

| Property | Type | Values |
|----------|------|--------|
| Goal | title | Goal name |
| Status | status | Not started, In progress, Completed |
| Timeframe | select | Q1 2026, Q2 2026, 2026, Someday |
| Progress | number | 0-100% |
| Key Results | relation | Link to Tasks |
| Area | relation | Link to Areas |

## Goal Actions

### Add Goal
```
User: "add goal: Learn Spanish basics"
```

```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-811f-a2e7-000b753d5c5a" },
  pages: [{
    properties: {
      "Goal": "Learn Spanish basics",
      "Status": "Not started",
      "Timeframe": "Q1 2026",
      "Progress": 0
    }
  }]
)
```

### Update Progress
```
User: "update goal Learn Spanish progress to 40%"
```

```
mcp__notion-personal__notion-update-page(
  data: {
    page_id: "[goal_page_id]",
    command: "update_properties",
    properties: {
      "Progress": 40
    }
  }
)
```

### Query by Timeframe
```
User: "goals for Q1"
```

Search and filter for Q1 goals.

## COPE Integration

Goals inform:
- Week focus (current quarter goals)
- Priority decisions (does this support a goal?)
- Weekly review (progress check)

### WeekEnd Review
During COPE WeekEnd workflow:
```
mcp__notion-personal__notion-search(
  query: "Q1 2026",
  data_source_url: "collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a"
)
```

Summarize progress on current quarter goals.
