# TrackResponses Workflow

**Trigger:** "pending responses", "what needs reply", "overdue emails", daily briefing integration

Monitors sent emails awaiting responses and flags overdue items.

---

## When This Runs

- **Manual:** "what emails need a response?", "any pending replies?"
- **Automatic:** Called during COPE daily briefing
- **After sending:** ComposeEmail adds to tracking after send

---

## Workflow Steps

### 1. Load Tracking State

Query LifeOS Tasks database for items with "Waiting On" containing email addresses:

```
mcp__notion-personal__notion-search(
  query: "waiting email",
  data_source_url: "collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c"
)
```

Filter for tasks where:
- "Waiting On" contains an email address pattern
- Tags include "Email Response"

### 2. Check for Responses

For each tracked thread, search for replies:

```
search_emails(
  query: "in:inbox thread:{thread_id}",
  after: "{sent_timestamp}"
)
```

### 3. Update Status

**Response received:**
- Remove from pending list
- Log: "Response received from {sender}"

**No response yet:**
- Calculate days waiting
- Flag if > timeout_hours (default 48h)

### 4. Format Output

```
⚠️ Pending Responses: 2

🔴 OVERDUE (>48h)
   "API Integration Specs" to Robin Radar
   → Sent Jan 2 (2 days ago)
   → Action: Follow up or close?

🟡 WAITING
   "Contract Review" to legal@partner.com
   → Sent Jan 3 (1 day ago)
   → Expected by: Jan 5
```

### 5. Suggest Actions

For overdue items:
```
Options for "API Integration Specs":
1. Send follow-up reminder
2. Mark as resolved (no response needed)
3. Extend wait time (+48h)
```

---

## Tracking Rules

### What Gets Tracked

From `Config/accounts.yaml`:

```yaml
response_tracking:
  enabled: true
  timeout_hours: 48
  track_external: true
  internal_domains:
    - "@tatoma.eu"
  ignore_patterns:
    - "noreply@"
    - "no-reply@"
```

**Tracked:**
- Emails to external recipients (not @tatoma.eu)
- Not auto-generated (no "noreply" patterns)
- Explicit questions or requests

**Not tracked:**
- Internal team emails
- Newsletters, notifications
- FYI/no-response-needed emails

### When to Track

ComposeEmail adds to tracking when:
1. Sending to external recipient
2. Content suggests response expected:
   - Contains "?" (question)
   - Contains "let me know", "please confirm", "thoughts?"
   - Explicit deadline mentioned

---

## State Management

### Adding to Tracking

After sending to external recipient (from ComposeEmail), create a LifeOS task:

```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-81ec-9d5a-000bd513a35c" },
  pages: [{
    properties: {
      "Task": "Response: {subject}",
      "Status": "In Progress",
      "Priority": "Low Priority ",
      "Waiting On": "{recipient_email}",
      "Tags": "Email Response"
    }
  }]
)
```

### Removing from Tracking

When response received or manually resolved, update the task status:

```
mcp__notion-personal__notion-update-page(
  data: {
    page_id: "{task_page_id}",
    command: "update_properties",
    properties: {
      "Status": "Done"
    }
  }
)
```

---

## Output Format

**For briefing (compact):**
```
⚠️ Pending responses: 2
   - "API specs" to Robin Radar (2 days) 🔴
   - "Contract" to legal@partner.com (1 day)
```

**Detailed view:**
```
📬 Pending Responses

🔴 OVERDUE
   1. "API Integration Specs"
      To: client@robinradar.com
      Sent: January 2, 2026 (2 days ago)
      → Follow up? (yes/no/dismiss)

🟡 WAITING
   2. "Contract Review"
      To: legal@partner.com
      Sent: January 3, 2026 (1 day ago)
      Expected by: January 5
```

**No pending:**
```
✅ No pending responses
   All sent emails have been replied to or resolved.
```

---

## Actions

| Command | Action |
|---------|--------|
| "follow up on #1" | ComposeEmail with follow-up template |
| "dismiss #1" | Remove from tracking |
| "extend #1" | Add 48h to timeout |
| "show thread #1" | ReadEmail with full thread |

---

## Follow-up Templates

When following up on overdue:

```
Hi {name},

Just following up on my email from {date} regarding {subject}.

Let me know if you need any additional information.

Best,
Israel
```

---

## Error Handling

| Error | Response |
|-------|----------|
| State file missing | Create empty state, start fresh |
| Thread deleted | Remove from tracking, log |
| Can't check thread | Keep in tracking, note error |

---

## Integration Points

- **COPE DailyBriefing:** Append pending count and overdue items
- **ComposeEmail:** Add new outgoing emails to tracking
- **InboxDigest:** Cross-reference with unread (response in inbox?)
- **LifeOS Tasks:** Stores pending responses as tasks with "Waiting On" property
