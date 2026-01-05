# TasksToday Workflow

Show tasks for today, prioritized.

## Trigger

- "tasks today"
- "what's on my plate"
- "my priorities"
- "what should I focus on"

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Tasks | `collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c` |
| Notes (Inbox) | `collection://2dff8fbf-cf75-8171-b984-000b1a6487f3` |

## Steps

1. **Query Tasks Database**
   Use `notion-search` with the Tasks data source to find active tasks:
   ```
   mcp__notion-personal__notion-search(
     query: "priority tasks",
     data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
   )
   ```

   Then filter results for:
   - Status != "Done"
   - Priority = "High Priority" or Date is today/past

2. **Query Open Loops**
   Search for tasks with "Waiting On" property filled:
   ```
   mcp__notion-personal__notion-search(
     query: "waiting",
     data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
   )
   ```

3. **Query Inbox Count**
   Search Notes database for Status = Inbox:
   ```
   mcp__notion-personal__notion-search(
     query: "inbox",
     data_source_url: "collection://2dff8fbf-cf75-8171-b984-000b1a6487f3"
   )
   ```

4. **Format Output**
   ```
   TASKS TODAY

   [High] Task one
   [Med] Task two
   [ ] Task three (due today)

   Open loops: [n] items waiting
   Inbox: [n] items to process
   ```

## Task Properties

| Property | Type | Values |
|----------|------|--------|
| Task | title | Task name |
| Status | status | Not started, In progress, Done |
| Priority | select | High Priority, Medium Priority, Low Priority |
| Date | date | Due date |
| Project | relation | Link to Projects |
| Waiting On | text | Who/what this is blocked on |
| Completed | checkbox | Done flag |

## Integration with COPE Briefing

This workflow is called during daily briefing to show the priorities section.
