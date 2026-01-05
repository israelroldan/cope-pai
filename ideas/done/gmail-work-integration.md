# Gmail Integration Plan (Tatoma - Work)

**Created:** 2026-01-04
**Purpose:** Access Tatoma work email via Gmail/Google Workspace

---

## Background

Tatoma uses Google Workspace. This integration enables searching emails, reading messages, sending emails, managing labels, and handling attachments through Claude.

---

## Integration Options

### Option 1: Gmail AutoAuth MCP Server (Recommended)

Full-featured Gmail MCP with auto-authentication.

#### Quick Install (Smithery)

```bash
npx -y @smithery/cli install @gongrzhe/server-gmail-autoauth-mcp --client claude
```

#### Manual Install

```json
{
  "mcpServers": {
    "gmail-work": {
      "command": "npx",
      "args": ["@gongrzhe/server-gmail-autoauth-mcp"],
      "env": {
        "GMAIL_OAUTH_PATH": "~/.gmail-mcp/tatoma/"
      }
    }
  }
}
```

#### Available Tools

| Tool | Purpose |
|------|---------|
| `send_email` | Send messages with attachments |
| `draft_email` | Create unsent drafts |
| `read_email` | Retrieve message content |
| `search_emails` | Query with Gmail syntax |
| `download_attachment` | Save attachments locally |
| `modify_email` | Add/remove labels |
| `delete_email` | Permanently remove messages |
| `create_label` | Create custom labels |
| `batch_modify_emails` | Process up to 50 emails at once |
| `create_filter` | Set automated rules |

---

### Option 2: Official Claude Gmail Integration

Claude has native Gmail integration (beta).

#### Setup

1. In Claude.ai → Settings → Integrations
2. Connect Google Account
3. Select Tatoma Google Workspace account
4. Grant permissions

#### Capabilities

- Search emails
- Read message content
- Understand calendar context
- Minimal data access (only retrieves what's needed)

#### Limitations

- Claude.ai only (not Claude Code)
- Read-focused (limited write actions)
- Beta feature

---

### Option 3: Gmail REST API

Direct API integration for custom workflows.

#### API Details

```
Base URL: https://gmail.googleapis.com/gmail/v1
Authentication: OAuth 2.0
```

#### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users/me/messages` | List messages |
| GET | `/users/me/messages/{id}` | Get message |
| POST | `/users/me/messages/send` | Send message |
| POST | `/users/me/drafts` | Create draft |
| GET | `/users/me/labels` | List labels |
| POST | `/users/me/messages/{id}/modify` | Add/remove labels |

#### Required Scopes

| Scope | Purpose |
|-------|---------|
| `gmail.readonly` | Read emails |
| `gmail.send` | Send emails |
| `gmail.modify` | Modify labels/archive |
| `gmail.compose` | Create drafts |
| `gmail.labels` | Manage labels |

---

## Setup Steps

### For Gmail AutoAuth MCP (Recommended)

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project: "Claude Gmail - Tatoma"
   - Enable Gmail API

2. **Create OAuth Credentials**
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Desktop app
   - Download JSON as `gcp-oauth.keys.json`

3. **Configure OAuth Consent**
   - Add your Tatoma email as test user
   - Or get admin to approve for org-wide use

4. **Store Credentials**
   ```bash
   mkdir -p ~/.gmail-mcp/tatoma
   mv gcp-oauth.keys.json ~/.gmail-mcp/tatoma/
   ```

5. **Authenticate**
   ```bash
   cd ~/.gmail-mcp/tatoma
   npx @gongrzhe/server-gmail-autoauth-mcp auth
   ```
   Browser opens → Sign in with Tatoma account → Authorize

6. **Configure MCP Server**
   ```json
   {
     "mcpServers": {
       "gmail-work": {
         "command": "npx",
         "args": ["@gongrzhe/server-gmail-autoauth-mcp"],
         "env": {
           "GMAIL_CREDENTIALS_PATH": "~/.gmail-mcp/tatoma/credentials.json",
           "GMAIL_OAUTH_PATH": "~/.gmail-mcp/tatoma/gcp-oauth.keys.json"
         }
       }
     }
   }
   ```

7. **Test Integration**
   - Ask: "Search my work email for messages from boss@tatoma.com"
   - Ask: "Show me unread emails from today"

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GMAIL_CREDENTIALS_PATH` | Path to OAuth credentials |
| `GMAIL_OAUTH_PATH` | Path to GCP OAuth keys |

---

## Gmail Search Syntax

The MCP server supports Gmail's full search syntax:

| Query | Purpose |
|-------|---------|
| `from:alice@example.com` | From specific sender |
| `to:me` | Sent to you |
| `subject:meeting` | Subject contains "meeting" |
| `after:2026/01/01` | After date |
| `before:2026/01/07` | Before date |
| `is:unread` | Unread messages |
| `is:starred` | Starred messages |
| `has:attachment` | Has attachments |
| `label:important` | Specific label |
| `in:inbox` | In inbox |
| `larger:5M` | Larger than 5MB |

Combine: `from:boss@tatoma.com after:2026/01/01 has:attachment`

---

## Security Considerations

### For Work Email

1. **OAuth Credentials Location**
   ```bash
   # Keep in secure location
   chmod 600 ~/.gmail-mcp/tatoma/*
   ```

2. **Never Commit Credentials**
   ```bash
   echo "*.json" >> ~/.gmail-mcp/.gitignore
   ```

3. **Minimal Scopes**
   - Start with `gmail.readonly`
   - Add `gmail.send` only when needed

4. **Token Refresh**
   - OAuth tokens auto-refresh
   - Credentials stored locally only

5. **Google Workspace Admin**
   - If required, get IT approval for OAuth app
   - May need domain-wide delegation

---

## Use Cases

### Email Triage
```
"Show me unread emails from today, summarize each"
"Which emails need a response?"
```

### Search & Retrieve
```
"Find the contract PDF Alice sent last month"
"Search for emails about Project X"
```

### Drafting
```
"Draft a reply to the last email from Bob"
"Create a follow-up email for the meeting yesterday"
```

### Batch Operations
```
"Archive all newsletters from this week"
"Label all emails from @client.com as 'Client'"
```

---

## Recommendation

**Use Gmail AutoAuth MCP** because:
- Full Gmail API access
- Auto-authentication flow
- Batch processing (50 emails at once)
- All Gmail features (search, send, labels, filters)
- Local credential storage

---

## Sources

- [Gmail AutoAuth MCP Server](https://github.com/GongRzhe/Gmail-MCP-Server)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Claude Gmail Integration](https://support.claude.com/en/articles/11088742-using-the-gmail-and-google-calendar-integrations)
- [Gmail Search Operators](https://support.google.com/mail/answer/7190)
