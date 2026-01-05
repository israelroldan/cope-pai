# QuickCapture Workflow

Quickly add items to the Inbox (Notes database) for later processing.

## Trigger

- "add to inbox: X"
- "capture: X"
- "quick add: X"

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Notes (Inbox) | `collection://2dff8fbf-cf75-8171-b984-000b1a6487f3` |

## Steps

1. **Parse Input**
   - Extract the item text
   - Detect any metadata (tags)

2. **Create Inbox Item**
   ```
   mcp__notion-personal__notion-create-pages(
     parent: { data_source_id: "2dff8fbf-cf75-8171-b984-000b1a6487f3" },
     pages: [{
       properties: {
         "Note": "[item text]",
         "Status": "Inbox"
       }
     }]
   )
   ```

3. **Confirm**
   ```
   Added to Inbox: [item text]
   ```

## Notes Properties

| Property | Type | Values |
|----------|------|--------|
| Note | title | Item text |
| Status | select | Inbox, To Review, Archive |
| Tags | multi_select | Custom tags |
| Created time | created_time | Auto-set |
| Last edited time | last_edited_time | Auto-set |

## Processing Inbox

During daily review, process inbox items:
- Convert to Tasks (with priority, project)
- Archive (if just reference)
- Move to "To Review" (needs more thought)

```
User: "Process inbox item X as task"
```

Creates task from inbox item:
```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-81ec-9d5a-000bd513a35c" },
  pages: [{
    properties: {
      "Task": "[from inbox item]",
      "Priority": "[selected priority]",
      "Status": "Not started"
    }
  }]
)
```

Then archive the inbox item:
```
mcp__notion-personal__notion-update-page(
  data: {
    page_id: "[inbox_item_id]",
    command: "update_properties",
    properties: { "Status": "Archive" }
  }
)
```

## Notes

- Inbox is for quick capture, not task management
- Items should be processed during daily review
- No priority or due date needed - that comes during processing
