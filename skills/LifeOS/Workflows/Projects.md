# Projects Workflow

View and manage multi-step projects.

## Trigger

- "show projects"
- "active projects"
- "project status"
- "project: X"

## Steps

1. **Query Projects Database**
   ```
   notion_query_database(
     database_id: "[projects_db_id]",
     filter: {
       property: "Status",
       select: { does_not_equal: "Completed" }
     },
     sorts: [
       { property: "Priority", direction: "ascending" }
     ]
   )
   ```

2. **Format Output**
   ```
   ACTIVE PROJECTS

   1. [Project Name] - [Status]
      Area: [Life Area]
      Progress: [%]
      Next action: [task]

   2. [Project Name] - [Status]
      ...
   ```

3. **Show Project Details** (if specific project requested)
   - Retrieve project page
   - List related tasks
   - Show progress

## Project Actions

| Command | Action |
|---------|--------|
| "create project: X" | New project page |
| "project X status" | Show specific project |
| "complete project: X" | Mark as done |
| "add task to project X: Y" | Create linked task |

## Integration

Projects link to:
- Tasks (via relation)
- Areas (categorization)
- Goals (what it supports)
