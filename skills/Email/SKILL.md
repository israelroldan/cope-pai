---
name: Email
description: Email management for Tatoma work account. USE WHEN inbox, unread, search email, send email, draft, reply, compose, organize inbox, email from, find email, check email, pending responses. Integrates with COPE daily briefings.
---

# Email - Tatoma Work Email Management

Manages Tatoma work email (Gmail) with full inbox management, search, compose, and COPE daily briefing integration.

## Quick Commands

| Command | Action |
|---------|--------|
| "check my email" | Show unread summary |
| "any emails from Sander?" | Search by sender |
| "find emails about project X" | Search by content |
| "draft email to Thomas" | Compose new email |
| "reply to that email" | Reply to recent/specified email |
| "archive newsletters" | Batch organize |
| "what emails need a response?" | Show pending replies |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **InboxDigest** | "check email", "inbox", "unread", daily briefing | `Workflows/InboxDigest.md` |
| **SearchEmail** | "find email", "search for", "emails about", "email from" | `Workflows/SearchEmail.md` |
| **ReadEmail** | "read email", "show me the email", "open email" | `Workflows/ReadEmail.md` |
| **ComposeEmail** | "draft", "send email", "reply to", "compose", "email to" | `Workflows/ComposeEmail.md` |
| **OrganizeInbox** | "archive", "label", "organize", "move to", "delete" | `Workflows/OrganizeInbox.md` |
| **TrackResponses** | "pending responses", "what needs reply", briefing integration | `Workflows/TrackResponses.md` |

## Examples

**Example 1: Daily email check**
```
User: "Check my email"
-> Invokes InboxDigest workflow
-> Queries gmail-work MCP for unread
-> Returns:

📧 EMAIL (Tatoma)
   Unread: 5 (2 from VIPs)
   ⭐ Sander: "Q1 Budget Review" - action needed
   ⭐ Thomas: "Deployment status"

   3 other unread messages
```

**Example 2: Search and reply**
```
User: "Find emails from Robin Radar about API specs"
-> Invokes SearchEmail workflow
-> Query: "from:*@robinradar.com subject:API"
-> Returns matching emails with snippets

User: "Reply to the latest one"
-> Invokes ComposeEmail workflow
-> Opens draft with quoted content
```

**Example 3: Batch organize**
```
User: "Archive all newsletters from last week"
-> Invokes OrganizeInbox workflow
-> Query: "label:newsletter after:2025/12/28"
-> Batch archives matching emails
-> "Archived 12 newsletter emails"
```

---

## Account Configuration

Defined in `Config/accounts.yaml`:

| Setting | Value |
|---------|-------|
| Provider | gmail-work MCP |
| Email | israel@tatoma.eu |
| VIP Senders | Sander, Maarten, Thomas |
| Response timeout | 48 hours |

---

## MCP Tools Used

| Tool | MCP Server | Purpose |
|------|------------|---------|
| `search_emails` | gmail-work | Query with Gmail syntax |
| `read_email` | gmail-work | Fetch message content |
| `send_email` | gmail-work | Send messages |
| `draft_email` | gmail-work | Create unsent drafts |
| `modify_email` | gmail-work | Add/remove labels |
| `batch_modify_emails` | gmail-work | Bulk label/archive operations |

---

## Gmail Search Syntax

The skill supports full Gmail search operators:

| Query | Purpose |
|-------|---------|
| `from:alice@example.com` | From specific sender |
| `to:me` | Sent to you |
| `subject:meeting` | Subject contains word |
| `after:2026/01/01` | After date |
| `before:2026/01/07` | Before date |
| `is:unread` | Unread messages |
| `is:starred` | Starred messages |
| `has:attachment` | Has attachments |
| `label:important` | Specific label |

Combine: `from:sander@tatoma.eu after:2026/01/01 is:unread`

---

## COPE Integration

### Daily Briefing

InboxDigest workflow is called during COPE daily briefing:

```
📧 EMAIL (Tatoma)
   Unread: 5 (2 from VIPs)
   ⭐ Sander: "Q1 Budget Review" - awaiting response
   ⭐ Thomas: "Deployment status update"

   ⚠️ Pending responses: 2
      - "API specs" to Robin Radar (2 days overdue)
```

### Response Tracking

TrackResponses workflow monitors outgoing emails awaiting replies:
- Tracks emails sent to external recipients
- Flags as overdue after 48 hours (configurable)
- Surfaces in daily briefing

### State Tracking

Email state is managed within sessions. For persistent tracking:
- **Pending responses** → Added to LifeOS Tasks with "Waiting On" = recipient email
- **Digest history** → Session-ephemeral (no need to persist)

---

## Future Phases

- **Study Stars** - Own company email account
- **Personal** - Home/personal email context
