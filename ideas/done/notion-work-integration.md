# Notion Integration Plan (Work)

**Created:** 2026-01-04
**Purpose:** Access Israel's work Notion workspace for projects, docs, and tasks

---

## Background

Notion is used for work documentation, project management, and knowledge bases. This integration enables querying pages, searching content, creating/updating pages, and managing databases through Claude.

---

## Integration Options

### Option 1: Official Notion MCP Server (Recommended)

Notion provides an official MCP server with 21 tools for full workspace access.

#### Quick Setup via Claude Code

```bash
claude mcp add --transport sse notion https://mcp.notion.com/sse
```

This uses Notion's hosted MCP server with OAuth authentication.

#### NPM Installation (Self-Hosted)

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

#### Docker Installation

```json
{
  "mcpServers": {
    "notion": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxx",
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

Key operations:
- `notion_search` - Search pages and databases by title
- `notion_retrieve_page` - Get page content
- `notion_create_page` - Create new pages
- `notion_update_page` - Modify existing pages
- `notion_query_database` - Query database with filters/sorts
- `notion_create_database` - Create new databases
- `notion_add_comment` - Comment on pages

---

### Option 2: Notion REST API

Direct API integration for custom workflows.

#### API Details

```
Base URL: https://api.notion.com/v1
Authentication: Bearer token
API Version: 2022-06-28 (or latest)
```

#### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/search` | Search pages and databases |
| GET | `/pages/{page_id}` | Retrieve a page |
| PATCH | `/pages/{page_id}` | Update page properties |
| POST | `/pages` | Create a page |
| GET | `/databases/{database_id}` | Retrieve database |
| POST | `/databases/{database_id}/query` | Query database |
| GET | `/blocks/{block_id}/children` | Get page content blocks |
| PATCH | `/blocks/{block_id}/children` | Append content blocks |

#### Example: Search Pages

```bash
curl -X POST 'https://api.notion.com/v1/search' \
  -H 'Authorization: Bearer ntn_xxxxxxxxxxxx' \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  -d '{"query": "Project Roadmap", "filter": {"property": "object", "value": "page"}}'
```

#### Example Response

```json
{
  "results": [
    {
      "id": "page-id-here",
      "object": "page",
      "created_time": "2026-01-01T00:00:00.000Z",
      "properties": {
        "title": {
          "title": [{"plain_text": "Q1 Project Roadmap"}]
        }
      }
    }
  ]
}
```

---

## Setup Steps

### For Hosted MCP (Easiest)

1. **Add MCP Server**
   ```bash
   claude mcp add --transport sse notion https://mcp.notion.com/sse
   ```

2. **Authenticate**
   - Browser opens for OAuth consent
   - Select work workspace
   - Grant access to pages/databases

3. **Test Integration**
   - Ask: "Search my Notion for project roadmap"
   - Ask: "What's in my Tasks database?"

### For Self-Hosted MCP (More Control)

1. **Create Internal Integration**
   - Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click "+ New integration"
   - Name: "Claude Work Integration"
   - Select your **work workspace**
   - Copy the Internal Integration Token

2. **Share Pages with Integration**
   - Open each page/database you want accessible
   - Click ••• menu → Add connections
   - Search and select your integration
   - Repeat for all relevant pages

3. **Store Token**
   ```bash
   echo "NOTION_WORK_TOKEN=ntn_xxxxxxxxxxxx" >> $PAI_DIR/.env
   ```

4. **Configure MCP Server**
   - Add config to Claude settings (see NPM or Docker options above)

5. **Test Integration**
   - Ask: "List my Notion pages"
   - Ask: "Query my Projects database"

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_TOKEN` | Integration secret token |
| `OPENAPI_MCP_HEADERS` | Alternative: JSON with auth headers |

---

## Security Considerations

### For Work Workspace

- **Create dedicated integration** - Don't reuse personal integration
- **Principle of least privilege** - Only share necessary pages
- **Read-only option** - Create read-only integration for sensitive data
- **Audit access** - Regularly review which pages are shared

### Token Security

```bash
# Never commit tokens to git
echo "NOTION_WORK_TOKEN=..." >> .env
echo ".env" >> .gitignore
```

---

## Multi-Workspace Setup

If using both work and personal Notion, create separate integrations:

```json
{
  "mcpServers": {
    "notion-work": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_WORK_TOKEN}"
      }
    }
  }
}
```

Then set environment variable before launching Claude:
```bash
export NOTION_WORK_TOKEN="ntn_work_xxxx"
```

---

## Recommendation

**Use Notion's hosted MCP** (`https://mcp.notion.com/sse`) because:
- Official Notion support
- OAuth flow (no manual token management)
- Automatic updates
- 21 tools available out of the box

For stricter security requirements, use the **self-hosted NPM server** with a dedicated internal integration.

---

## Sources

- [Official Notion MCP Server](https://github.com/makenotion/notion-mcp-server)
- [Notion MCP Documentation](https://developers.notion.com/docs/mcp)
- [Notion's Hosted MCP Server Blog](https://www.notion.com/blog/notions-hosted-mcp-server-an-inside-look)
- [Notion API Authorization](https://developers.notion.com/docs/authorization)
- [Notion Help - MCP](https://www.notion.com/help/notion-mcp)
