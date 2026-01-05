# CreatePage Workflow

Create a new page in the work Notion workspace.

## Trigger

- "create a page for X"
- "new doc about..."
- "add a page to..."

## Steps

1. **Determine Location**
   - Ask where to create the page if not specified
   - Options: under existing page, in database, at root

2. **Gather Content**
   - Title (required)
   - Initial content (optional)
   - Properties if database page (status, assignee, etc.)

3. **Create Page**
   ```
   notion_create_page(
     parent: { page_id: "[id]" } or { database_id: "[id]" },
     properties: { title: [...] },
     children: [ ...content blocks... ]
   )
   ```

4. **Confirm Creation**
   ```
   Created: [Page Title]
   Location: [Parent page/database]
   Link: [Notion URL]
   ```

## Templates

| Type | Default Structure |
|------|-------------------|
| Meeting Notes | Date, Attendees, Agenda, Notes, Action Items |
| Project Page | Overview, Goals, Timeline, Status |
| Doc | Title, Content |

## Notes

- Offer templates for common page types
- Set sensible defaults for database properties
- Return link to edit in Notion
