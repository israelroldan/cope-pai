# Explore Workflow

Discover and map the LifeOS database structure.

## Trigger

- "explore lifeos"
- "show lifeos databases"
- "what's in my lifeos"
- "map lifeos structure"

## Purpose

Run this workflow after connecting notion-personal to:
1. Discover all databases in LifeOS
2. Get database IDs for configuration
3. Understand property structures
4. Identify what needs to be added (Decisions db, waiting_on property)

## Steps

1. **Search for Databases**
   ```
   notion_search(filter: { property: "object", value: "database" })
   ```

2. **For Each Database, Get Structure**
   ```
   notion_retrieve_database(database_id: "[id]")
   ```
   - List properties and their types

3. **Output Database Map**
   ```
   LIFEOS DATABASES

   1. Inbox (id: abc123)
      Properties: Name (title), Created (date)

   2. Tasks (id: def456)
      Properties: Name (title), Status (select), Priority (select), Due (date), Project (relation)

   3. Projects (id: ghi789)
      Properties: Name (title), Status (select), Area (relation), Progress (number)

   ...
   ```

4. **Identify Gaps**
   ```
   SETUP NEEDED:
   - [ ] Add "waiting_on" property to Tasks (for open loops)
   - [ ] Create Decisions database
   ```

5. **Save Configuration**
   Write database IDs to `Config/databases.yaml`:
   ```yaml
   databases:
     inbox: "abc123"
     tasks: "def456"
     projects: "ghi789"
     journal: "jkl012"
     goals: "mno345"
     decisions: null  # To be created
   ```

## Post-Exploration

After running this workflow:
1. Review the database map
2. Confirm property names match expected
3. Create missing databases/properties
4. Update COPE to use these database IDs
