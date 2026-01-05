# Journal Workflow

Daily journaling and reflection.

## Trigger

- "journal: X"
- "daily reflection"
- "add to journal"
- "how was today"

## Database Reference

| Database | Data Source ID |
|----------|----------------|
| Journal | `collection://2dff8fbf-cf75-816e-8222-000ba6610bff` |

## Steps

1. **Find Today's Entry**
   Search for today's date:
   ```
   mcp__notion-personal__notion-search(
     query: "[today's date YYYY-MM-DD]",
     data_source_url: "collection://2dff8fbf-cf75-816e-8222-000ba6610bff"
   )
   ```

2. **Create Entry if Needed**
   If no entry exists for today:
   ```
   mcp__notion-personal__notion-create-pages(
     parent: { data_source_id: "2dff8fbf-cf75-816e-8222-000ba6610bff" },
     pages: [{
       properties: {
         "Entry": "[Date - Day of Week]",
         "date:Date:start": "[today YYYY-MM-DD]",
         "date:Date:is_datetime": 0,
         "Mood": "[mood if specified]",
         "Rating": "[rating if specified]"
       },
       content: "[journal content]"
     }]
   )
   ```

3. **Append to Existing Entry**
   If entry exists, update content:
   ```
   mcp__notion-personal__notion-update-page(
     data: {
       page_id: "[journal_page_id]",
       command: "insert_content_after",
       selection_with_ellipsis: "[last content]...",
       new_str: "\n\n[new journal content]"
     }
   )
   ```

4. **Confirm**
   ```
   Added to today's journal.
   ```

## Journal Properties

| Property | Type | Values |
|----------|------|--------|
| Entry | title | Date or title |
| Date | date | Entry date |
| Mood | multi_select | Normal, Super Happy, Worried, Anxious, Disappointed, Grateful, Sad, Happy |
| Rating | select | 1-5 stars |
| Photo of the day | file | Optional image |

## Daily Close Integration

During COPE daily close, create/update journal with day summary:
```
JOURNAL TODAY

Captured: 3 entries
Last entry: "Good progress on API review..."

Add reflection? [y/n]
```

Creates structured daily close entry:
- What got done
- What's carrying over
- Reflections
- Mood/energy rating

## Weekly Review

During COPE week end:
- Query journal entries for the week
- Summarize patterns in mood/energy
- Highlight key reflections
- Create weekly summary entry
