# Personal Email Integration Plan

**Created:** 2026-01-04
**Purpose:** Access all personal email accounts (iCloud, Gmail, custom IMAP)

---

## Background

Israel has three personal email accounts:
1. **iCloud Mail** - Primary Apple ecosystem email
2. **Personal Gmail** - Google personal account
3. **Custom IMAP** - Self-hosted or other provider

This plan covers integrating all three into Claude.

---

## Account 1: iCloud Mail

### Option 1A: iCloud Mail MCP Server (Recommended)

Purpose-built MCP server for iCloud Mail.

#### Installation

```bash
git clone https://github.com/minagishl/icloud-mail-mcp.git
cd icloud-mail-mcp
pnpm install
pnpm run build
```

#### Configuration

```json
{
  "mcpServers": {
    "icloud-mail": {
      "command": "node",
      "args": ["/path/to/icloud-mail-mcp/dist/index.js"],
      "env": {
        "ICLOUD_EMAIL": "your-email@icloud.com",
        "ICLOUD_APP_PASSWORD": "xxxx-xxxx-xxxx-xxxx"
      }
    }
  }
}
```

#### Available Tools

| Tool | Purpose |
|------|---------|
| `get_messages` | Retrieve emails from mailbox |
| `send_email` | Send new emails |
| `search_messages` | Search by criteria |
| `delete_messages` | Remove emails |
| `move_messages` | Move between folders |
| `set_flags` | Mark read/unread, flag |
| `auto_organize` | Auto-sort by rules |
| `get_mailboxes` | List all mailboxes |
| `create_mailbox` | Create new folder |
| `delete_mailbox` | Remove folder |
| `test_connection` | Verify setup |

---

### Option 2: iCloud MCP Server (Full Suite)

Includes calendar, contacts, and email.

#### Configuration

```json
{
  "mcpServers": {
    "icloud": {
      "command": "npx",
      "args": ["icloud-mcp"],
      "env": {
        "ICLOUD_EMAIL": "your-email@icloud.com",
        "ICLOUD_APP_PASSWORD": "xxxx-xxxx-xxxx-xxxx"
      }
    }
  }
}
```

#### Capabilities

- Email (IMAP/SMTP)
- Calendar (CalDAV)
- Contacts (CardDAV)

---

## Account 2: Personal Gmail

Use the same Gmail AutoAuth MCP as work, but with personal Google account.

### Configuration

```json
{
  "mcpServers": {
    "gmail-personal": {
      "command": "npx",
      "args": ["@gongrzhe/server-gmail-autoauth-mcp"],
      "env": {
        "GMAIL_CREDENTIALS_PATH": "~/.gmail-mcp/personal/credentials.json",
        "GMAIL_OAUTH_PATH": "~/.gmail-mcp/personal/gcp-oauth.keys.json"
      }
    }
  }
}
```

### Setup Steps

1. **Reuse or Create GCP Project**
   - Can use same GCP project as work Gmail
   - Or create separate: "Claude Gmail - Personal"

2. **Store Credentials Separately**
   ```bash
   mkdir -p ~/.gmail-mcp/personal
   # Copy OAuth keys to this directory
   ```

3. **Authenticate with Personal Account**
   ```bash
   cd ~/.gmail-mcp/personal
   npx @gongrzhe/server-gmail-autoauth-mcp auth
   ```
   Select your personal Gmail account (not Tatoma)

4. **Available Tools**
   Same as work Gmail: `send_email`, `search_emails`, `read_email`, `draft_email`, etc.

---

## Account 3: Custom IMAP Server

For self-hosted or other IMAP-based email providers.

### Configuration

```json
{
  "mcpServers": {
    "email-custom": {
      "command": "npx",
      "args": ["mcp-email-server"],
      "env": {
        "IMAP_HOST": "mail.yourdomain.com",
        "IMAP_PORT": "993",
        "IMAP_USER": "you@yourdomain.com",
        "IMAP_PASS": "your-password",
        "SMTP_HOST": "mail.yourdomain.com",
        "SMTP_PORT": "587",
        "SMTP_SECURE": "true"
      }
    }
  }
}
```

### Common IMAP Server Settings

| Provider | IMAP Host | IMAP Port | SMTP Host | SMTP Port |
|----------|-----------|-----------|-----------|-----------|
| Fastmail | imap.fastmail.com | 993 | smtp.fastmail.com | 587 |
| ProtonMail (Bridge) | 127.0.0.1 | 1143 | 127.0.0.1 | 1025 |
| Zoho | imap.zoho.com | 993 | smtp.zoho.com | 587 |
| Yahoo | imap.mail.yahoo.com | 993 | smtp.mail.yahoo.com | 587 |
| Self-hosted | mail.yourdomain.com | 993 | mail.yourdomain.com | 587 |

### Setup Steps

1. **Get IMAP/SMTP Credentials**
   - Check your email provider's settings
   - May need app-specific password

2. **Store Credentials**
   ```bash
   echo "CUSTOM_IMAP_HOST=mail.yourdomain.com" >> $PAI_DIR/.env
   echo "CUSTOM_IMAP_USER=you@yourdomain.com" >> $PAI_DIR/.env
   echo "CUSTOM_IMAP_PASS=your-password" >> $PAI_DIR/.env
   ```

3. **Test Connection**
   ```bash
   # Verify IMAP connectivity
   openssl s_client -connect mail.yourdomain.com:993
   ```

### Available Tools

| Tool | Purpose |
|------|---------|
| `get_messages` | Retrieve emails |
| `send_email` | Send emails |
| `search_messages` | Search mailbox |
| `move_messages` | Move between folders |
| `delete_messages` | Remove emails |
| `get_folders` | List mailboxes |

---

## Setup Steps (iCloud)

### 1. Generate App-Specific Password

**Required** - iCloud doesn't support direct password auth.

1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in with your Apple ID
3. Navigate to **Sign-In and Security**
4. Click **App-Specific Passwords**
5. Click **Generate App-Specific Password**
6. Label it: "Claude Mail" or "Cope Mail"
7. Copy the 16-character password (shown once!)
8. Store securely

### 2. Store Credentials

```bash
echo "ICLOUD_EMAIL=your-email@icloud.com" >> $PAI_DIR/.env
echo "ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx" >> $PAI_DIR/.env
```

### 3. Install MCP Server

```bash
git clone https://github.com/minagishl/icloud-mail-mcp.git
cd icloud-mail-mcp
pnpm install
pnpm run build
```

### 4. Configure MCP

```json
{
  "mcpServers": {
    "icloud-mail": {
      "command": "node",
      "args": ["/path/to/icloud-mail-mcp/dist/index.js"],
      "env": {
        "ICLOUD_EMAIL": "${ICLOUD_EMAIL}",
        "ICLOUD_APP_PASSWORD": "${ICLOUD_APP_PASSWORD}"
      }
    }
  }
}
```

### 5. Test Connection

```bash
# In the MCP server directory
pnpm run test
```

Or ask Claude: "Test my iCloud email connection"

### 6. Verify Integration

- Ask: "Show me my recent personal emails"
- Ask: "Search for emails from mom"

---

## iCloud Mail Server Details

| Service | Host | Port | Security |
|---------|------|------|----------|
| IMAP | imap.mail.me.com | 993 | SSL/TLS |
| SMTP | smtp.mail.me.com | 587 | STARTTLS |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ICLOUD_EMAIL` | Your iCloud email address |
| `ICLOUD_APP_PASSWORD` | App-specific password (16 chars) |

---

## Security Considerations

### For Personal Email

1. **App-Specific Password**
   - Never use your main Apple ID password
   - App password only grants mail access
   - Can be revoked anytime at appleid.apple.com

2. **Credential Storage**
   ```bash
   # Secure permissions
   chmod 600 $PAI_DIR/.env
   ```

3. **Token Revocation**
   - If compromised, revoke at appleid.apple.com
   - Generate new app-specific password
   - Update `$PAI_DIR/.env`

4. **Privacy**
   - Personal emails may contain sensitive info
   - Consider read-only access initially
   - Be mindful of what you ask Claude to process

---

## Use Cases

### Personal Email Management
```
"Show me unread personal emails"
"Any emails from family this week?"
```

### Search & Find
```
"Find the receipt from Amazon last month"
"Search for emails about flight confirmation"
```

### Organization
```
"Move newsletters to the Newsletters folder"
"Mark all emails from bank as important"
```

### Quick Replies
```
"Draft a reply to mom's last email"
"Send a quick note to dad saying I'll call tonight"
```

---

## Full Email Configuration

Run all 4 email accounts (1 work + 3 personal) simultaneously:

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
    },
    "gmail-personal": {
      "command": "npx",
      "args": ["@gongrzhe/server-gmail-autoauth-mcp"],
      "env": {
        "GMAIL_CREDENTIALS_PATH": "~/.gmail-mcp/personal/credentials.json",
        "GMAIL_OAUTH_PATH": "~/.gmail-mcp/personal/gcp-oauth.keys.json"
      }
    },
    "icloud-mail": {
      "command": "node",
      "args": ["/path/to/icloud-mail-mcp/dist/index.js"],
      "env": {
        "ICLOUD_EMAIL": "${ICLOUD_EMAIL}",
        "ICLOUD_APP_PASSWORD": "${ICLOUD_APP_PASSWORD}"
      }
    },
    "email-custom": {
      "command": "npx",
      "args": ["mcp-email-server"],
      "env": {
        "IMAP_HOST": "${CUSTOM_IMAP_HOST}",
        "IMAP_PORT": "993",
        "IMAP_USER": "${CUSTOM_IMAP_USER}",
        "IMAP_PASS": "${CUSTOM_IMAP_PASS}",
        "SMTP_HOST": "${CUSTOM_SMTP_HOST}",
        "SMTP_PORT": "587"
      }
    }
  }
}
```

### Context Routing

Create a PAI skill to route:

```markdown
## Email Router

When user mentions:
- "work email", "tatoma", "office" → Use gmail-work
- "personal gmail", "google personal" → Use gmail-personal
- "icloud", "apple mail" → Use icloud-mail
- "custom email", "[domain name]" → Use email-custom
- Ambiguous → Ask which mailbox
```

---

## Comparison: All Email Accounts

| Aspect | Gmail (Work) | Gmail (Personal) | iCloud | Custom IMAP |
|--------|--------------|------------------|--------|-------------|
| Protocol | REST API | REST API | IMAP | IMAP |
| Auth | OAuth 2.0 | OAuth 2.0 | App password | Password/App password |
| Search | Gmail syntax | Gmail syntax | IMAP search | IMAP search |
| Labels | Full | Full | Folders only | Folders only |
| Batch Ops | 50 at once | 50 at once | Sequential | Sequential |

---

## Environment Variables Summary

```bash
# Work Gmail (OAuth - no env vars, uses credential files)
# ~/.gmail-mcp/tatoma/credentials.json
# ~/.gmail-mcp/tatoma/gcp-oauth.keys.json

# Personal Gmail (OAuth - no env vars, uses credential files)
# ~/.gmail-mcp/personal/credentials.json
# ~/.gmail-mcp/personal/gcp-oauth.keys.json

# iCloud Mail
ICLOUD_EMAIL=your-email@icloud.com
ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Custom IMAP
CUSTOM_IMAP_HOST=mail.yourdomain.com
CUSTOM_IMAP_USER=you@yourdomain.com
CUSTOM_IMAP_PASS=your-password
CUSTOM_SMTP_HOST=mail.yourdomain.com
```

---

## Recommendation

| Account | MCP Server | Why |
|---------|------------|-----|
| Gmail (Work) | Gmail AutoAuth MCP | Full Gmail API, batch ops |
| Gmail (Personal) | Gmail AutoAuth MCP | Same as work, separate auth |
| iCloud | iCloud Mail MCP | Purpose-built for Apple |
| Custom IMAP | Generic IMAP MCP | Works with any provider |

---

## Sources

- [Gmail AutoAuth MCP Server](https://github.com/GongRzhe/Gmail-MCP-Server)
- [iCloud Mail MCP Server](https://github.com/minagishl/icloud-mail-mcp)
- [iCloud MCP Server (Full Suite)](https://lobehub.com/mcp/mike-tih-icloud-mcp)
- [Generic IMAP MCP Server](https://github.com/ai-zerolab/mcp-email-server)
- [Apple App-Specific Passwords](https://support.apple.com/en-us/HT204397)
- [iCloud Mail Server Settings](https://support.apple.com/en-us/HT202304)
