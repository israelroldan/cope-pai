# LogDecision Workflow

Record a decision with its rationale in the Decisions database.

## Trigger

- "log decision: X because Y"
- "decided: X"
- "decision: X"

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Decisions | `collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b` |

## Steps

1. **Parse Input**
   - Extract decision (what)
   - Extract rationale (why/because)
   - Detect context (project, area)
   - Detect tags (Work, Personal, Technical, Strategic)

2. **Create Decision Entry**
   ```
   mcp__notion-personal__notion-create-pages(
     parent: { data_source_id: "8df780cc-91fe-4c51-9c59-d8f20c7dbd7b" },
     pages: [{
       properties: {
         "Decision": "[what was decided]",
         "Rationale": "[why this choice]",
         "Context": "[project/area context]",
         "date:Date:start": "[today YYYY-MM-DD]",
         "date:Date:is_datetime": 0,
         "Outcome": "Pending",
         "Tags": "[Work, Personal, Technical, or Strategic]"
       }
     }]
   )
   ```

3. **Confirm**
   ```
   Logged decision: [what]
   Rationale: [why]
   ```

## Decision Properties

| Property | Type | Values |
|----------|------|--------|
| Decision | title | What was decided |
| Rationale | text | Why this choice |
| Date | date | When decided |
| Context | text | Project/area context |
| Outcome | select | Pending, Successful, Mixed, Revisit, Failed |
| Tags | multi_select | Work, Personal, Technical, Strategic |

## Reviewing Decisions

```
User: "Show recent decisions"
```

Search decisions:
```
mcp__notion-personal__notion-search(
  query: "decision",
  data_source_url: "collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b",
  filters: {
    created_date_range: {
      start_date: "[7 days ago]"
    }
  }
)
```

## Updating Decision Outcomes

When a decision plays out:
```
User: "Update decision outcome: REST API was successful"
```

```
mcp__notion-personal__notion-update-page(
  data: {
    page_id: "[decision_page_id]",
    command: "update_properties",
    properties: {
      "Outcome": "Successful"
    }
  }
)
```

## Use Cases

- Remembering why you chose something
- Learning from past decisions
- Avoiding decision fatigue on repeated choices
- Weekly review of decision outcomes
