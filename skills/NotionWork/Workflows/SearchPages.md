# SearchPages Workflow

Search the work Notion workspace for pages by title or content.

## Trigger

- "search notion for X"
- "find the X doc"
- "where is the X page"

## Steps

1. **Parse Query**
   - Extract search terms
   - Identify any filters (page vs database)

2. **Search Notion**
   ```
   notion_search(query: "[search terms]", filter: { property: "object", value: "page" })
   ```

3. **Format Results**
   ```
   NOTION SEARCH: "[query]"

   Found [n] pages:
   1. [Page Title] - [parent/location]
      Last edited: [date]
   2. [Page Title] - [parent/location]
      Last edited: [date]
   ```

4. **Offer Actions**
   - "Read page 1"
   - "Open in Notion" (provide link)

## Notes

- Search matches title and content
- Results sorted by relevance
- Maximum 10 results shown by default
