# Commitment Scan Workflow

Parses your Slack messages for implicit promises and commitments.

## Purpose

Israel is prone to forgetting commitments made in conversation. This workflow:
1. Scans your outgoing messages for promise patterns
2. Extracts the commitment
3. Adds to COPE open loops with Slack context

## Trigger Patterns

Messages from you containing:

| Pattern | Example | Extraction |
|---------|---------|------------|
| "I'll..." | "I'll review that PR today" | Review PR |
| "I will..." | "I will send the doc" | Send doc |
| "Let me..." | "Let me check on that" | Check on [topic] |
| "I can..." | "I can have that ready by Friday" | Have [thing] ready |
| "I'm going to..." | "I'm going to refactor that" | Refactor [thing] |
| "Will do" | "Will do!" | [Previous message context] |
| "On it" | "On it" | [Previous message context] |
| "I'll get back to you" | "I'll get back to you on that" | Follow up on [topic] |
| "Remind me" | "Remind me to..." | [The reminder] |

## Process

### 1. Scan Recent Messages

```
conversations_search_messages(
  from: me,
  since: last_scan or 24h,
  patterns: commitment_patterns
)
```

### 2. Extract Context

For each matching message:
- Get the thread context (what prompted the commitment)
- Identify who you made the commitment to
- Determine the channel/DM

### 3. Parse Commitment

Extract:
```yaml
commitment:
  action: "Review PR for authentication"
  to: "Thomas Verhappen"
  channel: "#product"
  thread_ts: "1704365400.123456"
  detected_at: "2026-01-04T14:30:00"
  original_message: "I'll review that PR today"
  deadline_hint: "today"  # If mentioned
```

### 4. Add to COPE Open Loops

Via COPE UpdateState tool:
```yaml
open_loops:
  - item: "Review PR for authentication"
    source: "slack:#product"
    waiting_on: null  # You own this
    context: "Committed to Thomas on 2026-01-04"
    slack_link: "https://tatoma.slack.com/archives/C123/p1704365400123456"
```

### 5. Dedupe

Before adding:
- Check if similar commitment already exists
- Update existing if found (refresh timestamp)
- Skip if already marked complete

## Output in Briefing

```
📝 COMMITMENTS DETECTED (since last scan)

1. "Review PR for authentication"
   → To Thomas in #product, yesterday
   → Deadline hint: "today"

2. "Send updated design doc"
   → To Sander in DM, 2 days ago
   → No deadline mentioned

⚠️ These have been added to your open loops.
```

## Manual Override

Commands:
- "that's not a commitment" — Remove false positive
- "I did that already" — Mark complete
- "add commitment: X" — Manual add

## Scan Frequency

- **Automatic**: During daily briefing
- **On demand**: "scan my commitments" / "what did I promise"

## False Positive Handling

Some patterns might catch non-commitments. Reduce noise by:
1. Requiring context (must be in response to a request)
2. Ignoring certain channels (e.g., #random)
3. Learning from dismissals
