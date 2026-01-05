# Omi Lifelog Integration Plan

**Created:** 2026-01-04
**Purpose:** Access Israel's lifelog data from the Omi wearable recording device

---

## Background

Omi is an open-source AI wearable from Based Hardware that captures conversations, provides transcriptions, summaries, and action items. Israel uses this device for continuous lifelog recording.

---

## Integration Options

### Option 1: MCP Server (Recommended)

The cleanest integration path - Omi provides native Model Context Protocol support for Claude.

#### Hosted Endpoint (Easiest)

```json
{
  "mcpServers": {
    "omi": {
      "type": "sse",
      "url": "https://api.omi.me/v1/mcp/sse",
      "headers": {
        "Authorization": "Bearer omi_dev_your_api_key_here"
      }
    }
  }
}
```

#### Docker Local Deployment

```json
{
  "mcpServers": {
    "omi": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "OMI_API_KEY=your_key",
        "omiai/mcp-server"
      ]
    }
  }
}
```

#### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `get_memories` | Retrieve memories with optional category filtering (default limit: 100) |
| `get_conversations` | Fetch conversation list with transcripts, timestamps, geolocation |
| `create_memory` | Add new memory entries with specified category |
| `edit_memory` | Update existing memory content by ID |
| `delete_memory` | Remove memories by ID |

#### Pros
- Native Claude integration
- Natural language queries ("What did I discuss yesterday?")
- No custom code to maintain
- Real-time access to lifelog

#### Cons
- Requires MCP configuration
- Limited to provided tools

---

### Option 2: Custom REST API Skill

Build a PAI skill that calls the Omi Developer API directly.

#### API Details

```
Base URL: https://api.omi.me/v1/dev
Authentication: Bearer token in Authorization header
```

#### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/v1/dev/user/memories` | Retrieve memories |
| POST | `/v1/dev/user/memories` | Create a memory |
| POST | `/v1/dev/user/memories/batch` | Create up to 25 memories |
| GET | `/v1/dev/user/conversations` | Retrieve conversations |
| POST | `/v1/dev/user/conversations` | Create from text |
| GET | `/v1/dev/user/action-items` | Retrieve action items |
| POST | `/v1/dev/user/action-items` | Create an action item |

#### Query Parameters (Memories)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 25 | Max memories to return |
| `offset` | integer | 0 | Skip N memories |
| `categories` | string | - | Comma-separated filter (e.g., "personal,work") |

#### Example Request

```bash
curl -H "Authorization: Bearer omi_dev_your_api_key" \
  "https://api.omi.me/v1/dev/user/memories?limit=50&offset=0&categories=personal,work"
```

#### Example Response

```json
[
  {
    "id": "mem_789ghi",
    "content": "Discussed project roadmap for Q1 with team members...",
    "category": "interesting"
  },
  {
    "id": "mem_456def",
    "content": "Reminder to call mom on her birthday next week",
    "category": "system"
  }
]
```

#### Rate Limits

- Per minute: 100 requests per API key
- Per day: 10,000 requests per user

#### Pros
- Full control over queries and logic
- Can build custom workflows
- Offline caching possible

#### Cons
- More code to maintain
- Manual API calls required

---

## Setup Steps

### For MCP Server (Recommended)

1. **Generate API Key**
   - Open Omi app
   - Navigate to Settings → Developer → MCP
   - Create and copy the key (cannot be viewed again)

2. **Configure Claude Code**
   - Add MCP server config to `~/.claude/settings.json` or Claude Code MCP settings
   - Use either hosted SSE endpoint or Docker deployment

3. **Test Integration**
   - Ask: "What are my recent Omi memories?"
   - Ask: "What conversations did I have today?"

### For Custom Skill

1. **Generate API Key**
   - Open Omi app
   - Navigate to Settings → Developer → Create Key
   - Save to `$PAI_DIR/.env` as `OMI_API_KEY`

2. **Create Skill**
   ```
   $PAI_DIR/skills/Omi/
   ├── SKILL.md
   ├── Workflows/
   │   ├── GetMemories.md
   │   ├── GetConversations.md
   │   └── SearchLifelog.md
   └── lib/
       └── omi-client.ts
   ```

3. **Implement API Client**
   - TypeScript client for REST API
   - Handle auth, pagination, error handling

---

## Recommendation

**Start with Option 1 (MCP Server)** because:
- Zero custom code required
- Native Claude integration
- Omi maintains the server
- Can always add custom skill later for advanced use cases

---

## Sources

- [Omi MCP Documentation](https://docs.omi.me/doc/developer/MCP)
- [Omi Developer API Overview](https://docs.omi.me/doc/developer/api/overview)
- [Omi Integrations Guide](https://docs.omi.me/doc/integrations)
- [GitHub - BasedHardware/omi](https://github.com/BasedHardware/omi)
- [Omi API Guides](https://www.omi.me/blogs/api-guides)
