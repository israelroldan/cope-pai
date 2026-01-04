# SearchEmail Workflow

**Trigger:** "find email", "search email", "emails about", "email from", "any emails about"

Searches emails using Gmail query syntax with natural language translation.

---

## When This Runs

- **Manual:** User asks "find emails from Sander", "search for budget emails", "any emails about the API?"

---

## Workflow Steps

### 1. Parse User Query

Extract search intent from natural language:

| User says | Gmail query |
|-----------|-------------|
| "emails from Sander" | `from:sander@tatoma.eu` |
| "emails about budget" | `subject:budget OR body:budget` |
| "emails from last week" | `after:{7_days_ago}` |
| "unread from Thomas" | `from:thomas@tatoma.eu is:unread` |
| "emails with attachments" | `has:attachment` |
| "starred emails" | `is:starred` |

### 2. Build Gmail Query

Combine extracted filters:

```
search_emails(
  query: "{constructed_query}",
  maxResults: 10
)
```

### 3. Handle VIP Senders

If searching by name (not email):
- Look up in `Config/accounts.yaml` VIP list
- Expand "Sander" → "sander@tatoma.eu"
- Expand "Thomas" → "thomas@tatoma.eu"

### 4. Execute Search

Call gmail-work MCP:

```
search_emails(
  query: "from:sander@tatoma.eu after:2026/01/01",
  maxResults: 10
)
```

### 5. Format Results

```
🔍 Search: "from:sander@tatoma.eu"
   Found: 8 emails

   1. "Q1 Budget Review" (Jan 4, unread)
      → Please review the attached budget...

   2. "Re: Team meeting" (Jan 3)
      → Sounds good, let's schedule for...

   3. "Quarterly planning" (Jan 2)
      → Here's the draft for Q1...

   [Show first 5, then "...and 3 more"]
```

### 6. Enable Follow-up

Store search context for follow-up commands:
- "read the first one" → ReadEmail with result[0]
- "reply to that" → ComposeEmail with result context

---

## Query Translation Examples

| Natural language | Gmail query |
|-----------------|-------------|
| "emails from Sander this week" | `from:sander@tatoma.eu after:{monday}` |
| "unread emails about deployment" | `is:unread (subject:deployment OR deployment)` |
| "emails to Robin Radar" | `to:*@robinradar.com` |
| "starred from last month" | `is:starred after:{30_days_ago}` |
| "PDFs from Thomas" | `from:thomas@tatoma.eu has:attachment filename:pdf` |

---

## Output Format

**With results:**
```
🔍 Search: "{query}"
   Found: {count} emails

   {numbered list with subject, date, snippet}
```

**No results:**
```
🔍 Search: "{query}"
   No emails found matching this search.

   Try:
   - Broader date range
   - Different keywords
   - Check spelling of sender name
```

---

## Error Handling

| Error | Response |
|-------|----------|
| Invalid query syntax | "Couldn't parse that search. Try: 'emails from [name]' or 'emails about [topic]'" |
| No results | Suggest alternatives |
| Too many results | Show first 10, offer to narrow search |

---

## Context Preservation

After search, store in session:
```yaml
last_search:
  query: "from:sander@tatoma.eu"
  results:
    - id: "abc123"
      subject: "Q1 Budget Review"
    - id: "def456"
      subject: "Re: Team meeting"
```

Enables: "read the first one", "reply to the budget email"
