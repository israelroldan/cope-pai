# Slack Integration Plan (Tatoma - Work)

**Created:** 2026-01-04
**Purpose:** Access Tatoma Slack workspace for work communication, channel history, and team collaboration

---

## Background

Tatoma is Israel's day job. **Israel is a workspace admin**, enabling full bot installation without approval bottlenecks. This integration enables querying Slack channels, searching messages, reading threads, and posting messages through Claude.

---

## Integration Options

### Option 1: korotovsky/slack-mcp-server (Recommended)

The most feature-rich Slack MCP server with 30,000+ monthly users. Supports multiple auth methods and transports.

#### Installation via Docker

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
    "slack-tatoma": {
      "command": "slack-mcp-server",
      "env": {
        "SLACK_MCP_XOXB_TOKEN": "${SLACK_TATOMA_BOT}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "true"
      }
    }
  }
}
```

#### Available Tools

| Tool | Purpose |
|------|---------|
| `conversations_history` | Fetch channel/DM messages with date or count pagination |
| `conversations_replies` | Retrieve thread conversations |
| `conversations_add_message` | Post messages (disabled by default) |
| `conversations_search_messages` | Search with filters (date, user, content) |
| `channels_list` | List workspace channels |

#### Resources

| URI | Content |
|-----|---------|
| `slack://tatoma/channels` | CSV of all channels |
| `slack://tatoma/users` | CSV of all users |

---

### Option 2: Composio Slack MCP

Managed OAuth-based solution with simpler setup.

#### Setup

```bash
# Visit mcp.composio.dev, search for Slack
# Copy the setup command for Claude
npx @composio/mcp-server-slack setup
```

#### Available Actions

- Message retrieval from channels and threads
- Posting messages and replies
- Message search by keyword, timestamp, sender
- User and channel listing
- Message reactions (add/remove)
- Reminder creation
- Message scheduling

---

### Option 3: Slack Bot Token (REST API)

Create a dedicated Slack app with bot token for API access.

#### API Details

```
Base URL: https://slack.com/api
Authentication: Bearer token (xoxb-*)
```

#### Required Scopes

| Scope | Purpose |
|-------|---------|
| `channels:history` | Read public channel messages |
| `channels:read` | List public channels |
| `groups:history` | Read private channel messages (if needed) |
| `groups:read` | List private channels |
| `im:history` | Read DMs (if needed) |
| `chat:write` | Post messages |
| `users:read` | List users and profiles |
| `search:read` | Search messages |

#### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/conversations.list` | List channels |
| GET | `/conversations.history` | Get channel messages |
| GET | `/conversations.replies` | Get thread replies |
| POST | `/chat.postMessage` | Send message |
| GET | `/search.messages` | Search messages |
| GET | `/users.list` | List users |

#### Example: Get Channel History

```bash
curl -H "Authorization: Bearer xoxb-your-token" \
  "https://slack.com/api/conversations.history?channel=C1234567890&limit=100"
```

---

## Authentication Methods

### Method A: Browser Tokens (Stealth Mode)

No Slack app installation required. Uses your existing session.

1. **Open Slack in browser** (not desktop app)
2. **Open Developer Tools** (F12)
3. **Go to Application → Cookies**
4. **Find and copy:**
   - `d` cookie → `SLACK_MCP_XOXD_TOKEN`
   - Find `xoxc-*` token in network requests → `SLACK_MCP_XOXC_TOKEN`

**Pros:** No permissions needed, no app approval
**Cons:** Tokens expire, need refresh periodically

### Method B: Bot Token (Official)

1. **Create Slack App**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name: "Claude Integration"
   - Select Tatoma workspace

2. **Add Bot Scopes**
   - Go to OAuth & Permissions
   - Add Bot Token Scopes (see required scopes above)

3. **Install to Workspace**
   - Click "Install to Workspace"
   - Authorize permissions
   - Copy Bot User OAuth Token (`xoxb-*`)

4. **Invite Bot to Channels**
   - In each channel: `/invite @Claude Integration`

**Pros:** Official, stable, proper audit trail
**Cons:** Requires workspace admin approval, limited to invited channels

### Method C: User Token

Uses your personal Slack identity.

1. Create Slack App (same as above)
2. Add User Token Scopes instead of Bot Scopes
3. Install and authorize
4. Copy User OAuth Token (`xoxp-*`)

**Pros:** Full access to everything you can see
**Cons:** Actions appear as you, security concerns

---

## Setup Steps

### For korotovsky MCP (Recommended)

1. **Get Browser Tokens**
   - Open Slack web in browser
   - Extract `xoxc` and `xoxd` tokens (see Method A above)

2. **Store Tokens**
   ```bash
   echo "SLACK_TATOMA_XOXC=xoxc-..." >> $PAI_DIR/.env
   echo "SLACK_TATOMA_XOXD=xoxd-..." >> $PAI_DIR/.env
   ```

3. **Configure MCP Server**
   - Add Docker or Go config (see above)

4. **Test Integration**
   - Ask: "List my Slack channels"
   - Ask: "What's the latest in #engineering?"

### For Bot Token Approach

1. **Create Slack App** at api.slack.com/apps
2. **Request Admin Approval** (if required)
3. **Add Scopes and Install**
4. **Invite Bot to Channels**
5. **Store Token**
   ```bash
   echo "SLACK_TATOMA_BOT_TOKEN=xoxb-..." >> $PAI_DIR/.env
   ```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SLACK_TATOMA_BOT` | Bot OAuth token (xoxb-*) |
| `SLACK_MCP_ADD_MESSAGE_TOOL` | Enable posting (set to `true`) |
| `SLACK_MCP_LOG_LEVEL` | Logging: debug/info/warn/error |

---

## Security Considerations

### For Work Slack

1. **Message Posting Disabled by Default**
   - korotovsky server requires explicit `SLACK_MCP_ADD_MESSAGE_TOOL=true`
   - Consider channel-specific: `SLACK_MCP_ADD_MESSAGE_TOOL=C123,C456`

2. **Read-Only Recommended Initially**
   - Start with search/read only
   - Add write access after testing

3. **Token Security**
   ```bash
   # Never commit tokens
   echo "SLACK_TATOMA_*" >> .gitignore
   ```

4. **Audit Trail**
   - Bot tokens create audit logs
   - Browser tokens appear as your actions

5. **Admin Policies**
   - Check if Tatoma allows third-party Slack apps
   - May need IT approval for bot installation

---

## Workspace-Specific Notes

### Tatoma Considerations

- You're admin → instant bot installation
- Same approach as StudyStars
- Enable message posting if desired
- Full scopes available

---

## Recommendation

**Use bot token with full scopes** because:
- You're a workspace admin (no approval needed)
- Stable, long-lived tokens
- Full automation capabilities
- Proper audit trail
- Can enable message posting

Same approach as StudyStars for consistency across both workspaces.

---

## Sources

- [korotovsky/slack-mcp-server](https://github.com/korotovsky/slack-mcp-server)
- [Composio Slack MCP Guide](https://composio.dev/blog/how-to-use-slack-mcp-server-with-claude-flawlessly)
- [Slack Token Types](https://docs.slack.dev/authentication/tokens)
- [Slack OAuth Scopes](https://docs.slack.dev/reference/scopes/)
- [Slack API Documentation](https://api.slack.com/)
