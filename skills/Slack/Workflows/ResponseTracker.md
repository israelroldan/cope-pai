# Response Tracker Workflow

Monitors questions you asked and flags when responses are overdue.

## Purpose

When you ask someone a question or make a request in Slack, this workflow:
1. Detects the question/request
2. Monitors for a response
3. Alerts if response is overdue

## Detection Patterns

### Questions (explicit)
- Contains "?"
- "What do you think..."
- "Thoughts?"
- "Any updates on..."

### Requests (implicit)
- "Can you..."
- "Could you..."
- "Would you mind..."
- "Please..."
- "Let me know..."
- "When you get a chance..."

## Process

### 1. Detect Outgoing Questions

```
conversations_search_messages(
  from: me,
  patterns: question_patterns,
  since: 7d
)
```

### 2. Check for Responses

For each detected question:
```
conversations_replies(thread_ts)
# or
conversations_history(channel, since: question_ts)
```

Look for:
- Direct reply in thread
- Mention of you after the question
- Message from the person you asked

### 3. Evaluate Response Status

```yaml
pending_response:
  question: "What's the status on the API changes?"
  asked_to: "Thomas Verhappen"
  channel: "#product"
  asked_at: "2026-01-02T14:30:00"
  timeout_hours: 48
  status: "pending"  # pending | responded | expired
  thread_link: "https://..."
```

### 4. Alert on Timeout

If `now - asked_at > timeout_hours` and no response:

```
⚠️ PENDING RESPONSE (overdue)
   You asked Thomas about API changes (3 days ago)
   → No response in thread
   → Consider: nudge, ask in person, or drop
```

## Timeout Rules

Per-person timeouts from `Config/people.yaml`:
- Co-founders: 24h (they're busy but responsive)
- Direct reports: 48h (give them time)
- Default: 48h

## State Tracking

Pending responses tracked in LifeOS Tasks database:

```
mcp__notion-personal__notion-create-pages(
  parent: { data_source_id: "2dff8fbf-cf75-81ec-9d5a-000bd513a35c" },
  pages: [{
    properties: {
      "Task": "Response: [question summary]",
      "Status": "In Progress",
      "Priority": "Low Priority ",
      "Waiting On": "[person_name]",
      "Tags": "Slack Response"
    },
    content: "Channel: [channel]\nAsked: [timestamp]\nThread: [link]"
  }]
)
```

When resolved, update task status to "Done".

## Output in Briefing

```
⏳ AWAITING RESPONSES

Overdue:
   → Thomas: API changes status (3d, no response)
   → #product: Auth flow question (2d, no response)

Pending (not yet due):
   → Maarten: Budget approval (asked 12h ago)
```

## Commands

| Command | Action |
|---------|--------|
| "they responded" | Mark specific item resolved |
| "drop that question" | Remove from tracking |
| "nudge Thomas" | Send follow-up message |
| "what am I waiting on" | List all pending |

## Integration with Commitment Scan

If someone asks YOU a question and you said "I'll get back to you":
- CommitmentScan tracks your promise
- ResponseTracker tracks THEIR expectation
- Both surface if you haven't followed up

## Smart Features

### Thread vs Channel Response
- If asked in thread: only thread replies count
- If asked in channel: any reply mentioning you counts

### Conversation Close Detection
- If thread continues on different topic: mark resolved
- If you sent follow-up message: reset timeout

### Auto-Resolution
- Emoji reaction from them (thumbs up, check): mark resolved
- "Thanks" / "Got it" from them: mark resolved
