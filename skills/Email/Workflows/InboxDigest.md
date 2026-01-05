# InboxDigest Workflow

**Trigger:** "check email", "inbox", "unread", "email digest", daily briefing

Generates a summary of unread emails for quick triage, with VIP sender highlighting.

---

## When This Runs

- **Manual:** User asks "check my email", "any new emails?", "inbox"
- **Automatic:** Called during COPE daily briefing

---

## Workflow Steps

### 1. Load Configuration

Read `Config/accounts.yaml` for:
- Enabled accounts (currently: work only)
- VIP sender list
- Briefing settings (labels, max_items)

### 2. Query Unread Emails

Call gmail-work MCP:

```
search_emails(
  query: "is:unread in:inbox",
  maxResults: 20
)
```

### 3. Categorize Results

For each email:
- Check if sender is VIP (from config)
- Check for priority keywords in subject
- Extract: sender, subject, snippet, date, thread_id

### 4. Format Output

**With unread emails:**
```
📧 EMAIL (Tatoma)
   Unread: {count} ({vip_count} from VIPs)

   ⭐ {VIP emails first, with star}
   {sender}: "{subject}"
   → {snippet preview}

   {Regular emails}
   {sender}: "{subject}"

   {If more than max_items}
   ...and {remaining} more
```

**No unread emails:**
```
📧 EMAIL (Tatoma)
   ✓ Inbox clear - no unread emails
```

### 5. Check Pending Responses

Call TrackResponses workflow to append pending reply status.

### 6. Update State

State is session-ephemeral. No persistent storage needed for digest timestamps.

---

## Output Format

```
📧 EMAIL (Tatoma)
   Unread: 5 (2 from VIPs)

   ⭐ Sander Kok: "Q1 Budget Review"
   → Please review the attached budget proposal...

   ⭐ Thomas Verhappen: "Deployment status"
   → The staging deployment completed successfully...

   Robin Radar: "API Integration Questions"
   Newsletter: "Weekly Tech Digest"
   GitHub: "PR Review Requested"

   ⚠️ Pending responses: 1
      - "API specs" to client@robinradar.com (2 days)
```

---

## Error Handling

| Error | Response |
|-------|----------|
| MCP not available | "Gmail MCP not connected. Check configuration." |
| Auth expired | "Gmail authentication expired. Re-authorize in browser." |
| Rate limited | "Gmail rate limit reached. Try again in a few minutes." |
| No results | Show "Inbox clear" message |

---

## Integration Points

- **COPE DailyBriefing:** Called automatically, output inserted after Slack digest
- **TrackResponses:** Called to append pending response status
- **State:** Session-ephemeral (no persistent file)
