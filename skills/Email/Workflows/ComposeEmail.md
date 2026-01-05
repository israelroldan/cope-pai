# ComposeEmail Workflow

**Trigger:** "draft email", "send email", "reply to", "compose", "email to", "forward"

Creates email drafts or sends emails with context-aware composition.

---

## When This Runs

- **New email:** "email Thomas about the deployment"
- **Reply:** "reply to Sander's email"
- **Forward:** "forward this to Maarten"
- **Draft:** "draft a follow-up to the budget discussion"

---

## Workflow Steps

### 1. Determine Email Type

| User intent | Action |
|-------------|--------|
| "email to X" | New email |
| "reply to X" | Reply (include thread) |
| "forward to X" | Forward (include original) |
| "draft X" | Create draft (don't send) |

### 2. Resolve Recipient

**VIP shorthand:**
- "Thomas" → thomas@tatoma.eu
- "Sander" → sander@tatoma.eu
- "Maarten" → maarten@tatoma.eu

**From context:**
- "reply to that" → Use current_email.from

**Explicit:**
- "email alice@example.com" → Use as-is

### 3. Build Email Context

**For replies:**
```
read_email(id: "{original_email_id}")
```

Extract:
- Original subject (prepend "Re:")
- Thread ID for threading
- Quoted content for context

**For forwards:**
- Original subject (prepend "Fwd:")
- Original body as quoted content

### 4. Compose Content

**User provides content:**
```
User: "Reply to Sander saying I'll review it by Friday"

Subject: Re: Q1 Budget Review
To: sander@tatoma.eu

Hi Sander,

I'll review the budget proposal and get back to you by Friday.

Best,
Israel
```

**User needs help:**
```
User: "draft a reply to Sander"

What would you like to say? Options:
1. Acknowledge receipt
2. Request more info
3. Provide feedback
4. Custom response
```

### 5. Confirm Before Sending

**For send_email:**
```
📧 Ready to Send

To: sander@tatoma.eu
Subject: Re: Q1 Budget Review

---
Hi Sander,

I'll review the budget proposal and get back to you by Friday.

Best,
Israel
---

Send this email? (yes/no/edit)
```

**For draft_email:**
```
📝 Draft Saved

To: sander@tatoma.eu
Subject: Re: Q1 Budget Review

Draft saved. You can edit and send from Gmail.
```

### 6. Execute

**Send immediately:**
```
send_email(
  to: "sander@tatoma.eu",
  subject: "Re: Q1 Budget Review",
  body: "{composed_content}",
  threadId: "{thread_id}"  // for replies
)
```

**Save as draft:**
```
draft_email(
  to: "sander@tatoma.eu",
  subject: "Re: Q1 Budget Review",
  body: "{composed_content}"
)
```

### 7. Track for Responses

If sending to external recipient, create a tracking task in LifeOS:

```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-81ec-9d5a-000bd513a35c" },
  pages: [{
    properties: {
      "Task": "Response: API Integration",
      "Status": "In Progress",
      "Priority": "Low Priority ",
      "Waiting On": "client@robinradar.com",
      "Tags": "Email Response"
    }
  }]
)
```

---

## Email Templates

Common patterns for quick composition:

| Scenario | Template |
|----------|----------|
| Acknowledge | "Got it, thanks! I'll [action] by [time]." |
| Request info | "Could you clarify [topic]? Specifically, I need to understand [question]." |
| Schedule | "How about [day] at [time]? I'm also available [alternatives]." |
| Follow-up | "Just following up on [topic]. Let me know if you need anything from me." |
| Decline | "Thanks for thinking of me. Unfortunately, [reason]. Perhaps [alternative]?" |

---

## Reply Formatting

**Standard reply:**
```
{new_content}

On {date}, {sender} wrote:
> {quoted_original}
```

**Inline reply (if requested):**
```
> Original point 1
Response to point 1

> Original point 2
Response to point 2
```

---

## Output Format

**Confirmation (before send):**
```
📧 Ready to Send

To: {recipient}
CC: {cc_if_any}
Subject: {subject}

---
{body_preview}
---

Send this email? (yes/no/edit)
```

**Success:**
```
✅ Email sent to {recipient}
   Subject: {subject}
```

**Draft saved:**
```
📝 Draft saved
   To: {recipient}
   Subject: {subject}

   Open Gmail to edit and send.
```

---

## Error Handling

| Error | Response |
|-------|----------|
| Unknown recipient | "Who should I send this to? Enter email or name." |
| No content | "What would you like to say?" |
| Send failed | "Couldn't send email: {error}. Draft saved instead." |
| Auth expired | "Gmail auth expired. Please re-authorize." |

---

## Safety Checks

Before sending:
1. **Confirm recipient** - Especially for external emails
2. **Check attachments** - "You mentioned 'attached' but no attachment. Add one?"
3. **Reply-all warning** - "This will reply to 5 people. Continue?"
4. **External warning** - "This is going outside Tatoma. Confirm?"
