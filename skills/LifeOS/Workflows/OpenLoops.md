# OpenLoops Workflow

Show items that are waiting on something or someone.

## Trigger

- "open loops"
- "what am I waiting on"
- "blocked items"

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Tasks | `collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c` |

## Steps

1. **Search Tasks with Waiting On**
   ```
   mcp__notion-personal__notion-search(
     query: "waiting on",
     data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
   )
   ```

   Filter results for tasks where:
   - Status != "Done"
   - "Waiting On" property is not empty

2. **Format Output**
   ```
   OPEN LOOPS

   1. [Task] - waiting on: [person/thing]
      Since: [date added]

   2. [Task] - waiting on: [person/thing]
      Since: [date added]

   Total: [n] open loops
   ```

3. **Flag Stale Loops**
   - Highlight items waiting > 7 days (compare createdTime)

## Creating Open Loops

To add an open loop:
```
User: "Add open loop: API specs waiting on Robin Radar"
```

Creates task in LifeOS:
```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-81ec-9d5a-000bd513a35c" },
  pages: [{
    properties: {
      "Task": "API specs",
      "Waiting On": "Robin Radar",
      "Status": "In progress"
    }
  }]
)
```

## Closing Loops

When resolved:
```
User: "Close loop: API specs received"
```

Updates the task:
```
mcp__notion-personal__notion-update-page(
  data: {
    page_id: "[task_page_id]",
    command: "update_properties",
    properties: {
      "Waiting On": "",
      "Status": "Done"
    }
  }
)
```
