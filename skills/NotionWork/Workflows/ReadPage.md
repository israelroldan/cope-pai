# ReadPage Workflow

Retrieve and display the content of a Notion page.

## Trigger

- "read the X page"
- "show me the content of..."
- "what's in the X doc"

## Steps

1. **Identify Page**
   - If page ID known, use directly
   - Otherwise search by title first

2. **Retrieve Page**
   ```
   notion_retrieve_page(page_id: "[id]")
   ```

3. **Get Content Blocks**
   - Retrieve child blocks for full content
   - Handle nested blocks

4. **Format Output**
   ```
   PAGE: [Title]
   Last edited: [date] by [user]
   ---

   [Page content rendered as markdown]

   ---
   Link: [Notion URL]
   ```

## Content Rendering

| Block Type | Rendering |
|------------|-----------|
| paragraph | Plain text |
| heading_1/2/3 | # / ## / ### |
| bulleted_list | - items |
| numbered_list | 1. items |
| code | ```code``` |
| quote | > quote |
| callout | [icon] callout |
| table | markdown table |

## Notes

- Long pages may be truncated
- Offer to show specific sections
- Include link to view in Notion
