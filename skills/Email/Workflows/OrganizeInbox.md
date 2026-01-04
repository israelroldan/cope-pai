# OrganizeInbox Workflow

**Trigger:** "archive", "label", "organize", "move to", "delete", "star", "mark as read"

Performs single and batch email organization operations.

---

## When This Runs

- **Single email:** "archive this email", "star the budget email"
- **Batch:** "archive all newsletters", "label these as 'Project X'"
- **Cleanup:** "mark all as read", "delete old promotions"

---

## Workflow Steps

### 1. Parse Operation

| User says | Operation |
|-----------|-----------|
| "archive" | Remove from inbox, add Archive label |
| "delete" | Move to Trash |
| "star" | Add star |
| "unstar" | Remove star |
| "mark as read" | Mark read |
| "mark as unread" | Mark unread |
| "label as X" | Add label X |
| "remove label X" | Remove label X |
| "move to X" | Add label X, remove from Inbox |

### 2. Identify Target Emails

**Single email (from context):**
- "archive this" → Use current_email.id
- "star that one" → Use last referenced email

**By search:**
- "archive emails from newsletters" → Search first
- "label all from Sander as Important" → Search, then batch

**By selection:**
- "archive the first 3" → Use search results [0:3]

### 3. Confirm Batch Operations

For operations affecting multiple emails:

```
⚠️ Batch Operation

Action: Archive
Matching: 15 emails from "newsletter@*"

Proceed? (yes/no/preview)
```

**Preview shows:**
```
Will archive:
1. "Weekly Tech Digest" (Jan 4)
2. "Product Hunt Daily" (Jan 4)
3. "Morning Brew" (Jan 3)
...and 12 more
```

### 4. Execute Operation

**Single email:**
```
modify_email(
  id: "{email_id}",
  addLabels: ["STARRED"],
  removeLabels: []
)
```

**Batch (up to 50 at a time):**
```
batch_modify_emails(
  ids: ["{id1}", "{id2}", ...],
  addLabels: ["Archive"],
  removeLabels: ["INBOX"]
)
```

### 5. Report Results

```
✅ Archived 15 emails

   Archived:
   - 8 newsletters
   - 5 notifications
   - 2 receipts

   Tip: Create a filter to auto-archive these?
```

---

## Common Operations

### Archive
```
modify_email(
  addLabels: [],
  removeLabels: ["INBOX"]
)
```

### Delete (Trash)
```
modify_email(
  addLabels: ["TRASH"],
  removeLabels: ["INBOX"]
)
```

### Star
```
modify_email(
  addLabels: ["STARRED"],
  removeLabels: []
)
```

### Mark as Read
```
modify_email(
  addLabels: [],
  removeLabels: ["UNREAD"]
)
```

### Add Label
```
modify_email(
  addLabels: ["{label_name}"],
  removeLabels: []
)
```

---

## Batch Query Examples

| Request | Gmail query |
|---------|-------------|
| "archive newsletters" | `label:newsletter OR from:newsletter` |
| "delete promotions older than 30 days" | `category:promotions before:{30_days_ago}` |
| "star emails from VIPs" | `from:(sander@ OR maarten@ OR thomas@)` |
| "mark all as read" | `is:unread` |

---

## Smart Suggestions

After organizing, suggest automation:

```
✅ Archived 12 newsletter emails

💡 Suggestion: Create a filter?
   Match: from:*@newsletter.com
   Action: Skip inbox, apply label "Newsletters"

   Create this filter? (yes/no)
```

---

## Output Format

**Single operation:**
```
✅ {Action} complete
   {Subject} from {Sender}
```

**Batch operation:**
```
✅ {Action} {count} emails

   {Breakdown by category if applicable}
```

**With suggestion:**
```
✅ {Result}

💡 Suggestion: {automation opportunity}
   Create filter? (yes/no)
```

---

## Error Handling

| Error | Response |
|-------|----------|
| No emails match | "No emails found matching that criteria." |
| Label doesn't exist | "Label '{name}' doesn't exist. Create it?" |
| Rate limited | "Gmail rate limit. Processed {n} of {total}. Continue in 1 minute?" |
| Batch too large | "Found 200 emails. Process in batches of 50?" |

---

## Safety Guards

1. **Confirm deletes** - Always confirm before delete operations
2. **Batch limit** - Warn if >50 emails affected
3. **Important emails** - Warn before archiving starred/important
4. **Undo info** - "Archived. Undo within Gmail in next 30 seconds."
