# ReadEmail Workflow

**Trigger:** "read email", "show me the email", "open email", "read the first one"

Fetches and displays full email content with formatting.

---

## When This Runs

- **After search:** "read the first one", "show me that email"
- **Direct request:** "read the email from Sander about budget"
- **From digest:** "read the starred email from Thomas"

---

## Workflow Steps

### 1. Identify Email to Read

**From search context:**
- "the first one" → Use stored search results[0]
- "the budget email" → Match by subject keyword

**Direct request:**
- "email from Sander about budget" → Search first, then read

### 2. Fetch Email Content

Call gmail-work MCP:

```
read_email(
  id: "{email_id}"
)
```

### 3. Parse Email Structure

Extract:
- **Headers:** From, To, CC, Date, Subject
- **Body:** Plain text or HTML (prefer plain text)
- **Attachments:** List with names and sizes
- **Thread info:** Part of thread? Previous messages?

### 4. Format Output

```
📧 Email Details

From: Sander Kok <sander@tatoma.eu>
To: israel@tatoma.eu
Date: January 4, 2026 at 10:30 AM
Subject: Q1 Budget Review

---

Hi Israel,

Please review the attached Q1 budget proposal. Key changes:

1. Increased AI tooling budget (+15%)
2. New contractor allocation for Gynzy project
3. Reduced travel budget (-20%)

Let me know your thoughts by EOD Friday.

Thanks,
Sander

---

📎 Attachments:
   - Q1_Budget_2026.pdf (245 KB)
   - Breakdown.xlsx (89 KB)
```

### 5. Enable Actions

After reading, enable follow-up:
- "reply to this" → ComposeEmail with context
- "archive this" → OrganizeInbox
- "forward to Thomas" → ComposeEmail as forward
- "download the PDF" → Download attachment

### 6. Store Context

Save for follow-up commands:
```yaml
current_email:
  id: "abc123"
  thread_id: "xyz789"
  from: "sander@tatoma.eu"
  subject: "Q1 Budget Review"
  has_attachments: true
```

---

## Thread Display

If email is part of a thread, offer context:

```
📧 Email Details (3 messages in thread)

[Latest message shown above]

---
📜 Thread History:

> Jan 3 - Israel: "Sure, I'll review it tomorrow"
> Jan 2 - Sander: "When can you review the budget?"
```

---

## Attachment Handling

List attachments with actions:

```
📎 Attachments:
   - Q1_Budget_2026.pdf (245 KB)
     → "download the PDF" to save locally
   - Breakdown.xlsx (89 KB)
```

Use `download_attachment` MCP tool when requested.

---

## Output Format

**Standard email:**
```
📧 Email Details

From: {sender_name} <{sender_email}>
To: {recipients}
Date: {formatted_date}
Subject: {subject}

---

{body_content}

---

{attachments_if_any}
```

**Minimal (in search results):**
```
{subject} ({date})
→ {snippet}
```

---

## Error Handling

| Error | Response |
|-------|----------|
| Email not found | "Couldn't find that email. It may have been deleted." |
| No context | "Which email? Try 'read email from [sender] about [topic]'" |
| Ambiguous | "Found multiple matches. Did you mean: [list options]" |
