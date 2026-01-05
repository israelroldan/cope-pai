# UpdatePage Workflow

Modify an existing Notion page - update properties or append content.

## Trigger

- "update the X page"
- "add to the meeting notes"
- "change status of X to..."

## Steps

1. **Identify Page**
   - Search by title if needed
   - Confirm correct page before modifying

2. **Determine Update Type**
   - Property update (status, assignee, date, etc.)
   - Content append (add blocks)
   - Content replace (less common)

3. **Apply Update**

   For properties:
   ```
   notion_update_page(
     page_id: "[id]",
     properties: { "Status": { select: { name: "Done" } } }
   )
   ```

   For content:
   ```
   notion_append_block_children(
     block_id: "[page_id]",
     children: [ ...new blocks... ]
   )
   ```

4. **Confirm Update**
   ```
   Updated: [Page Title]
   Changes: [what was modified]
   Link: [Notion URL]
   ```

## Common Updates

| Request | Action |
|---------|--------|
| "mark as done" | Update Status property |
| "assign to X" | Update Assignee property |
| "add notes: ..." | Append content blocks |
| "update due date to..." | Update Date property |

## Notes

- Always confirm before destructive changes
- Show diff for property updates
- Append is safer than replace for content
