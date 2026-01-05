# QueryDatabase Workflow

Query a Notion database with filters and sorting.

## Trigger

- "query the X database"
- "show me tasks where..."
- "list projects by..."

## Steps

1. **Identify Database**
   - Search for database by name if not specified
   - Or use known database ID

2. **Parse Filters**
   - Extract filter conditions from request
   - Map to Notion filter syntax

3. **Query Database**
   ```
   notion_query_database(
     database_id: "[id]",
     filter: { ... },
     sorts: [{ property: "...", direction: "..." }]
   )
   ```

4. **Format Results**
   ```
   DATABASE: [Database Name]
   Filter: [applied filters]

   | Name | Status | Assignee | Due |
   |------|--------|----------|-----|
   | Task 1 | In Progress | Israel | Jan 10 |
   | Task 2 | To Do | - | Jan 15 |

   Showing [n] of [total] items
   ```

## Common Filters

| Request | Filter |
|---------|--------|
| "open tasks" | status != Done |
| "my tasks" | assignee contains [user] |
| "due this week" | due date <= [end of week] |
| "high priority" | priority = High |

## Notes

- Suggest filters if query is ambiguous
- Paginate if >20 results
- Offer to refine search
