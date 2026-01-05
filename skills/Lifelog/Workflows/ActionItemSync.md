# ActionItemSync Workflow

Sync action items detected in the lifelog to COPE open loops.

## Trigger

- "action items from lifelog"
- "sync lifelog tasks"
- Daily briefing (automatic)

## Steps

1. **Query Existing Lifelog Tasks**
   Search LifeOS Tasks for items already synced from lifelog:
   ```
   mcp__notion-personal__notion-search(
     query: "lifelog",
     data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
   )
   ```
   Extract lifelog_ids from task notes to prevent duplicates.

2. **Query Lifelog Action Items**
   ```
   get_memories(categories: "action_item")
   ```
   Or parse from conversation summaries

3. **Filter New Items**
   - Skip items with lifelog_id already in existing tasks
   - Filter by timestamp (since last briefing)

4. **Create LifeOS Tasks**
   For each new action item:
   ```
   mcp__notion-personal__notion-create-pages(
     parent: { data_source_id: "2dff8fbf-cf75-81ec-9d5a-000bd513a35c" },
     pages: [{
       properties: {
         "Task": "[action item text]",
         "Status": "Not started",
         "Priority": "Medium Priority ",
         "Tags": "Lifelog"
       },
       content: "Source: Lifelog\nMemory ID: [memory_id]\nContext: [conversation summary]"
     }]
   )
   ```

5. **Track Processed IDs**
   - Lifelog_id stored in task content for deduplication
   - No separate state file needed

6. **Report Results**
   ```
   Synced [n] action items from lifelog

   New open loops:
   - [action item 1]
   - [action item 2]
   ```

## Deduplication

- Check existing open loops for similar text before creating
- Use lifelog_id to prevent re-syncing
- If duplicate detected, skip silently

## Daily Briefing Integration

When called during briefing:
- Run sync silently
- Only report count: "Action items: [n] (synced)"
- Full list available via "action items from lifelog"
