---
name: NotionWork
description: Tatoma work Notion workspace access. USE WHEN notion, work docs, project pages, database query, search notion, find doc, create page, update page, meeting notes, project status, wiki.
---

# NotionWork - Work Workspace Access

Query and manage the Tatoma work Notion workspace. Search pages, query databases, read content, and create/update documentation.

## Quick Commands

| Command | Action |
|---------|--------|
| "search notion for X" | Search pages by title/content |
| "find the project roadmap" | Locate specific page |
| "query the tasks database" | Query database with filters |
| "create a page for X" | Create new page |
| "update the meeting notes" | Modify existing page |
| "what's in the wiki about X" | Search knowledge base |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **SearchPages** | "search notion", "find doc", "where is" | `Workflows/SearchPages.md` |
| **QueryDatabase** | "query database", "list tasks", "show projects" | `Workflows/QueryDatabase.md` |
| **ReadPage** | "read page", "show me", "what's in" | `Workflows/ReadPage.md` |
| **CreatePage** | "create page", "new doc", "add page" | `Workflows/CreatePage.md` |
| **UpdatePage** | "update page", "edit", "add to page" | `Workflows/UpdatePage.md` |

## Examples

**Example 1: Search for a document**
```
User: "Find the Q1 roadmap in Notion"
-> Invokes SearchPages workflow
-> Searches notion-work MCP for "Q1 roadmap"
-> Returns matching pages with links
```

**Example 2: Query a database**
```
User: "Show me open tasks assigned to me"
-> Invokes QueryDatabase workflow
-> Queries Tasks database with filter: status != Done, assignee = Israel
-> Returns filtered results
```

**Example 3: Create meeting notes**
```
User: "Create a page for today's standup notes"
-> Invokes CreatePage workflow
-> Creates page in Meeting Notes section
-> Returns link to new page
```

---

## MCP Tools Used

| Tool | MCP Server | Purpose |
|------|------------|---------|
| `notion_search` | notion-work | Search pages and databases |
| `notion_retrieve_page` | notion-work | Get page content |
| `notion_create_page` | notion-work | Create new pages |
| `notion_update_page` | notion-work | Modify existing pages |
| `notion_query_database` | notion-work | Query database with filters/sorts |
| `notion_create_database` | notion-work | Create new databases |
| `notion_add_comment` | notion-work | Comment on pages |

---

## Database Query Syntax

When querying databases, filters can be applied:

```
Filter by status:
  property: "Status", select: { equals: "In Progress" }

Filter by assignee:
  property: "Assignee", people: { contains: "user-id" }

Filter by date:
  property: "Due Date", date: { on_or_before: "2026-01-10" }

Sort by:
  property: "Created", direction: "descending"
```

---

## Common Databases

| Database | Purpose |
|----------|---------|
| Tasks | Work tasks and to-dos |
| Projects | Project tracking |
| Meeting Notes | Meeting documentation |
| Wiki | Knowledge base |

*Note: Actual database names depend on workspace structure.*

---

## Authentication

Uses Notion's hosted MCP with OAuth. On first use:
1. Browser opens for authentication
2. Select Tatoma workspace
3. Grant access to pages/databases

No manual token management required.
