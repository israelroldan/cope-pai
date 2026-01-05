# Notion Integration Plan (Personal)

**Created:** 2026-01-04
**Purpose:** Access Israel's personal Notion workspace for notes, journals, and personal projects

---

## Background

Personal Notion workspace for private notes, journals, personal projects, and life management. Requires separate integration from work to maintain workspace isolation.

---

## Integration Options

### Option 1: Official Notion MCP Server (Recommended)

Same MCP server as work, but connected to personal workspace.

#### Quick Setup via Claude Code

```bash
claude mcp add --transport sse notion-personal https://mcp.notion.com/sse
```

During OAuth, select your **personal workspace** instead of work.

#### NPM Installation (Self-Hosted)

```json
{
  "mcpServers": {
    "notion-personal": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_personal_xxxxxxxxxxxx"
      }
    }
  }
}
```

#### Docker Installation

```json
{
  "mcpServers": {
    "notion-personal": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "NOTION_TOKEN=ntn_personal_xxxxxxxxxxxx",
        "mcp/notion"
      ]
    }
  }
}
```

#### Available MCP Tools (21 total)

| Category | Tools |
|----------|-------|
| **Data Sources** | Query, retrieve, create, update data sources |
| **Pages** | Create, update, retrieve, move pages |
| **Search** | Search by title, search by ID |
| **Comments** | Add comments to pages |
| **Templates** | List data source templates |

Personal use cases:
- `notion_search` - Find notes, journal entries
- `notion_retrieve_page` - Read personal docs
- `notion_create_page` - Quick capture thoughts/ideas
- `notion_query_database` - Query habit trackers, reading lists
- `notion_update_page` - Update journals, personal projects

---

### Option 2: Notion REST API

Direct API for custom personal workflows.

#### API Details

```
Base URL: https://api.notion.com/v1
Authentication: Bearer token
API Version: 2022-06-28
```

#### Personal Workflow Examples

**Quick Capture (Create Page)**
```bash
curl -X POST 'https://api.notion.com/v1/pages' \
  -H 'Authorization: Bearer ntn_personal_xxxx' \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{
    "parent": {"database_id": "inbox-db-id"},
    "properties": {
      "Name": {"title": [{"text": {"content": "Quick thought to process"}}]}
    }
  }'
```

**Query Reading List**
```bash
curl -X POST 'https://api.notion.com/v1/databases/{reading-list-id}/query' \
  -H 'Authorization: Bearer ntn_personal_xxxx' \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{
    "filter": {"property": "Status", "select": {"equals": "Reading"}}
  }'
```

---

## Setup Steps

### For Hosted MCP (Easiest)

1. **Add MCP Server**
   ```bash
   claude mcp add --transport sse notion-personal https://mcp.notion.com/sse
   ```

2. **Authenticate**
   - Browser opens for OAuth
   - **Select personal workspace** (not work!)
   - Grant access

3. **Test Integration**
   - Ask: "Search my personal Notion for journal"
   - Ask: "Create a quick note in my Inbox"

### For Self-Hosted MCP (Recommended for Privacy)

1. **Create Internal Integration**
   - Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click "+ New integration"
   - Name: "Claude Personal"
   - Select your **personal workspace**
   - Copy the Internal Integration Token

2. **Share Pages with Integration**
   - Open pages/databases you want accessible
   - Click ••• menu → Add connections
   - Select "Claude Personal" integration

3. **Store Token Separately**
   ```bash
   echo "NOTION_PERSONAL_TOKEN=ntn_personal_xxxx" >> $PAI_DIR/.env
   ```

4. **Configure MCP Server**
   ```json
   {
     "mcpServers": {
       "notion-personal": {
         "command": "npx",
         "args": ["-y", "@notionhq/notion-mcp-server"],
         "env": {
           "NOTION_TOKEN": "${NOTION_PERSONAL_TOKEN}"
         }
       }
     }
   }
   ```

5. **Test Integration**
   - Ask: "What's in my personal Inbox?"

---

## Dual Workspace Configuration

To use both work and personal Notion simultaneously:

### Option A: Two Named MCP Servers

```json
{
  "mcpServers": {
    "notion-work": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_WORK_TOKEN}"
      }
    },
    "notion-personal": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_PERSONAL_TOKEN}"
      }
    }
  }
}
```

### Option B: Context-Based Selection

Create a PAI skill that routes to appropriate workspace:

```markdown
## Notion Router Skill

When user mentions:
- "work", "project", "meeting", "team" → Use notion-work
- "personal", "journal", "reading", "habit" → Use notion-personal
```

---

## Privacy Considerations

### Personal Data Protection

1. **Separate Integration**
   - Never use work integration for personal data
   - Create dedicated "Claude Personal" integration

2. **Selective Sharing**
   - Only share specific pages, not entire workspace
   - Exclude sensitive pages (finances, health, private journals)

3. **Read-Only for Sensitive Areas**
   - Consider read-only access for private content
   - Full access only for active management areas (inbox, tasks)

4. **Local Token Storage**
   ```bash
   # Store in PAI environment, not global
   echo "NOTION_PERSONAL_TOKEN=..." >> $PAI_DIR/.env

   # Ensure .env is gitignored
   echo ".env" >> $PAI_DIR/.gitignore
   ```

### What NOT to Share

Consider excluding from integration:
- Financial planning pages
- Health/medical notes
- Extremely private journals
- Password/credential pages
- Legal documents

---

## Personal Workflow Ideas

### Quick Capture
```
"Add to my Notion inbox: Research MCP server options"
```

### Journal Query
```
"What did I write in my journal last week?"
```

### Reading List Management
```
"Show me books I'm currently reading"
"Mark 'Atomic Habits' as finished"
```

### Habit Tracking
```
"Did I complete my habits yesterday?"
"Log workout for today"
```

### Personal Project Updates
```
"Update my home renovation project status to 'In Progress'"
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_PERSONAL_TOKEN` | Personal workspace integration token |
| `NOTION_WORK_TOKEN` | Work workspace integration token (separate) |

---

## Recommendation

**For maximum privacy:** Use **self-hosted NPM server** with internal integration
- You control what pages are shared
- Token stays local
- No OAuth to external service

**For convenience:** Use **hosted MCP** with careful workspace selection
- Easier setup
- Auto-updates
- Still workspace-isolated via OAuth

---

## Comparison: Work vs Personal Setup

| Aspect | Work | Personal |
|--------|------|----------|
| Integration Name | "Claude Work Integration" | "Claude Personal" |
| Token Variable | `NOTION_WORK_TOKEN` | `NOTION_PERSONAL_TOKEN` |
| MCP Server Name | `notion-work` | `notion-personal` |
| Shared Pages | Projects, Docs, Team wikis | Inbox, Journals, Personal DBs |
| Security Focus | Company data protection | Personal privacy |

---

## Sources

- [Official Notion MCP Server](https://github.com/makenotion/notion-mcp-server)
- [Notion MCP Documentation](https://developers.notion.com/docs/mcp)
- [Notion API Authorization](https://developers.notion.com/docs/authorization)
- [Notion Help - API Integrations](https://www.notion.com/help/create-integrations-with-the-notion-api)
- [How to Connect Claude to Notion](https://www.billprin.com/articles/notion-mcp-claude)
