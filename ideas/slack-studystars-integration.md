# Slack Integration Plan (StudyStars - Entrepreneurship)

**Created:** 2026-01-04
**Purpose:** Access StudyStars Slack workspace for startup communication, team coordination, and project management

---

## Background

StudyStars is Israel's entrepreneurship company. As founder/owner, Israel likely has full admin access, making bot installation straightforward. This integration enables full Slack automation capabilities.

---

## Integration Options

### Option 1: korotovsky/slack-mcp-server (Recommended)

Feature-rich MCP server supporting multiple auth methods.

#### Installation via Docker

```json
{
  "mcpServers": {
    "slack-studystars": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "SLACK_MCP_XOXB_TOKEN=${SLACK_STUDYSTARS_BOT}",
        "-e", "SLACK_MCP_ADD_MESSAGE_TOOL=true",
        "ghcr.io/korotovsky/slack-mcp-server:latest"
      ]
    }
  }
}
```

#### Installation via Go

```bash
go install github.com/korotovsky/slack-mcp-server/cmd/slack-mcp-server@latest
```

Config:
```json
{
  "mcpServers": {
    "slack-studystars": {
      "command": "slack-mcp-server",
      "env": {
        "SLACK_MCP_XOXB_TOKEN": "${SLACK_STUDYSTARS_BOT}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "true"
      }
    }
  }
}
```

#### Available Tools

| Tool | Purpose |
|------|---------|
| `conversations_history` | Fetch channel/DM messages |
| `conversations_replies` | Retrieve thread conversations |
| `conversations_add_message` | Post messages (enabled for your own workspace) |
| `conversations_search_messages` | Search with filters |
| `channels_list` | List workspace channels |

---

### Option 2: Composio Slack MCP

Managed OAuth solution.

```bash
npx @composio/mcp-server-slack setup
```

Follow OAuth flow to authorize StudyStars workspace.

---

### Option 3: Custom Slack Bot (Full Control)

As workspace owner, you can create a full-featured bot.

#### API Details

```
Base URL: https://slack.com/api
Authentication: Bearer token (xoxb-*)
```

#### Recommended Scopes (Full Access)

| Scope | Purpose |
|-------|---------|
| `channels:history` | Read public channel messages |
| `channels:read` | List public channels |
| `channels:manage` | Create/archive channels |
| `groups:history` | Read private channel messages |
| `groups:read` | List private channels |
| `im:history` | Read DMs |
| `im:read` | List DMs |
| `chat:write` | Post messages |
| `chat:write.public` | Post to any public channel |
| `users:read` | List users |
| `users:read.email` | Access user emails |
| `search:read` | Search messages |
| `files:read` | Access files |
| `reactions:read` | Read reactions |
| `reactions:write` | Add reactions |

#### Advanced Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/conversations.create` | Create channel |
| POST | `/conversations.invite` | Invite users to channel |
| POST | `/conversations.archive` | Archive channel |
| POST | `/files.upload` | Upload file |
| POST | `/reminders.add` | Create reminder |
| POST | `/chat.scheduleMessage` | Schedule message |

---

## Authentication Methods

### Method A: Bot Token (Recommended for Your Workspace)

As workspace owner, you have full control.

1. **Create Slack App**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name: "StudyStars AI Assistant" or "Cope Bot"
   - Select StudyStars workspace

2. **Add Comprehensive Scopes**
   - Go to OAuth & Permissions
   - Add all scopes from the table above
   - No approval needed (you're the admin)

3. **Install to Workspace**
   - Click "Install to Workspace"
   - Authorize (instant, you're the owner)
   - Copy Bot User OAuth Token (`xoxb-*`)

4. **Add Bot to All Channels**
   ```
   /invite @StudyStars AI Assistant
   ```
   Or use API to auto-join public channels.

### Method B: User Token (Your Identity)

Actions appear as you.

1. Create Slack App
2. Add User Token Scopes
3. Install and copy `xoxp-*` token

### Method C: Browser Tokens (Quick Start)

Same as Tatoma - extract from browser for immediate testing.

---

## Setup Steps

### For Bot Token (Recommended)

1. **Create Slack App**
   - api.slack.com/apps → Create New App
   - Name: "Cope" or "StudyStars AI"
   - Workspace: StudyStars

2. **Configure Bot**
   - Add all recommended scopes
   - Enable Socket Mode (optional, for events)
   - Install to workspace

3. **Store Token**
   ```bash
   echo "SLACK_STUDYSTARS_BOT=xoxb-..." >> $PAI_DIR/.env
   ```

4. **Configure MCP Server**
   ```json
   {
     "mcpServers": {
       "slack-studystars": {
         "command": "docker",
         "args": [
           "run", "--rm", "-i",
           "-e", "SLACK_MCP_XOXB_TOKEN=${SLACK_STUDYSTARS_BOT}",
           "-e", "SLACK_MCP_ADD_MESSAGE_TOOL=true",
           "ghcr.io/korotovsky/slack-mcp-server:latest"
         ]
       }
     }
   }
   ```

5. **Invite Bot to Channels**
   ```
   /invite @Cope
   ```

6. **Test Integration**
   - Ask: "What's happening in #general?"
   - Ask: "Post 'Hello team!' to #random"

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SLACK_STUDYSTARS_BOT` | Bot OAuth token (xoxb-*) |
| `SLACK_STUDYSTARS_USER` | User OAuth token (xoxp-*, optional) |
| `SLACK_MCP_ADD_MESSAGE_TOOL` | Enable posting (safe for your own workspace) |

---

## Dual Workspace Configuration

To run both Tatoma and StudyStars simultaneously:

```json
{
  "mcpServers": {
    "slack-tatoma": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "SLACK_MCP_XOXB_TOKEN=${SLACK_TATOMA_BOT}",
        "-e", "SLACK_MCP_ADD_MESSAGE_TOOL=true",
        "ghcr.io/korotovsky/slack-mcp-server:latest"
      ]
    },
    "slack-studystars": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "SLACK_MCP_XOXB_TOKEN=${SLACK_STUDYSTARS_BOT}",
        "-e", "SLACK_MCP_ADD_MESSAGE_TOOL=true",
        "ghcr.io/korotovsky/slack-mcp-server:latest"
      ]
    }
  }
}
```

### Context Routing

Create a PAI skill to route requests:

```markdown
## Slack Router

When user mentions:
- "tatoma", "work", "day job" → Use slack-tatoma (read-only)
- "studystars", "startup", "my company" → Use slack-studystars (full access)
```

---

## Startup-Specific Use Cases

### Team Communication
```
"Post standup reminder to #engineering"
"What did the team discuss yesterday?"
```

### Customer Support Monitoring
```
"Show me recent messages in #customer-feedback"
"Search for messages mentioning 'bug' this week"
```

### Investor Updates
```
"Draft a message for #investors channel about Q1 progress"
```

### Hiring/Team
```
"What's the latest in #hiring?"
"Post job update to #general"
```

### Automation Ideas
```
"Every Monday, summarize #product-ideas from last week"
"Alert me when someone posts in #urgent"
```

---

## Advanced: Slack Bot with Events

For real-time notifications and automation:

1. **Enable Socket Mode**
   - App Settings → Socket Mode → Enable

2. **Subscribe to Events**
   - Event Subscriptions → Enable
   - Add: `message.channels`, `message.groups`, `app_mention`

3. **Get App-Level Token**
   - Basic Information → App-Level Tokens
   - Create token with `connections:write` scope

4. **Build Event Handler**
   - Use Slack Bolt framework (Node.js/Python)
   - React to mentions, keywords, etc.

---

## Security Considerations

### For Your Own Workspace

Since you own StudyStars, you can be more permissive:

1. **Enable Message Posting** - Safe in your own workspace
2. **Full Scopes** - No approval bottleneck
3. **Bot in All Channels** - Easier management

### Still Recommended

1. **Separate Tokens** - Don't mix with Tatoma
2. **Audit Logging** - Bot actions are logged
3. **Token Rotation** - Refresh periodically

---

## Comparison: Tatoma vs StudyStars

| Aspect | Tatoma (Work) | StudyStars (Startup) |
|--------|---------------|----------------------|
| Admin Access | Full (admin) | Full (owner) |
| App Approval | Instant | Instant |
| Recommended Auth | Bot token | Bot token |
| Message Posting | Enabled | Enabled |
| Scopes | Comprehensive | Comprehensive |
| Use Cases | Full automation | Full automation |

Both workspaces use identical setup since Israel is admin on both.

---

## Recommendation

**Use bot token with full scopes** because:
- You're the workspace owner
- No approval process
- Stable, long-lived tokens
- Full automation capabilities
- Proper audit trail
- Can enable message posting safely

---

## Sources

- [korotovsky/slack-mcp-server](https://github.com/korotovsky/slack-mcp-server)
- [Composio Slack MCP Guide](https://composio.dev/blog/how-to-use-slack-mcp-server-with-claude-flawlessly)
- [Slack Token Types](https://docs.slack.dev/authentication/tokens)
- [Slack OAuth Scopes](https://docs.slack.dev/reference/scopes/)
- [Slack Bolt Framework](https://slack.dev/bolt-js/concepts)
- [Slack API Documentation](https://api.slack.com/)
