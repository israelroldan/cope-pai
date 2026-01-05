# Channel Catchup Workflow

Deep dive into a specific channel's recent activity.

## Trigger

- "catch up on #channel"
- "what happened in #founders-talk"
- "summarize #product since Monday"

## Process

### 1. Determine Scope

Parse the request for:
- Channel name (required)
- Time range (default: since last check or 24h)
- Specific topic filter (optional)

### 2. Fetch Messages

```
conversations_history(
  channel: channel_id,
  oldest: start_timestamp,
  limit: 200
)
```

### 3. Fetch Thread Details

For messages with replies:
```
conversations_replies(thread_ts)
```

### 4. Analyze Content

Group messages by:
- **Threads** — Active discussions
- **Decisions** — Conclusions reached
- **Questions** — Open items
- **Mentions of you** — Direct relevance
- **Action items** — Things assigned/committed

### 5. Generate Summary

## Output Format

```
📺 #founders-talk CATCHUP
   Period: Jan 2-4 (48 messages, 8 threads)

🎯 KEY DECISIONS
   → Q1 budget approved at 50k
   → Decided to delay feature X to Q2

💬 ACTIVE THREADS
   1. "Platform architecture" (12 replies)
      → Discussing microservices vs monolith
      → No conclusion yet, your input requested

   2. "Client feedback summary" (5 replies)
      → Sander shared NPS results
      → Action: review by Friday

📣 YOU WERE MENTIONED
   → Maarten: "Israel, can you look at the API docs?"
   → Thread about performance (tagged for expertise)

❓ OPEN QUESTIONS
   → "Should we migrate to new provider?"
   → "Timeline for mobile app?"

📋 ACTION ITEMS
   → Review API docs (assigned to you)
   → Send client update (assigned to Sander)
```

## Summarization Depth

Based on channel priority and message volume:

| Priority | Messages | Depth |
|----------|----------|-------|
| Critical | Any | Full thread summaries |
| High | <50 | Full thread summaries |
| High | >50 | Key threads only |
| Medium | Any | Highlights only |
| Low | Any | One-liner + counts |

## Time Range Parsing

| Input | Interpretation |
|-------|----------------|
| "since Monday" | Monday 00:00 to now |
| "last 24h" | Now - 24 hours |
| "this week" | Monday to now |
| "yesterday" | Yesterday 00:00 to 23:59 |
| (none) | Since last catchup or 24h |

## Interactive Follow-up

After summary, offer:
- "expand thread 1" — Full details on specific thread
- "show messages about X" — Filter to topic
- "who said what about Y" — Attribution search

## State Tracking

Catchup state is session-ephemeral. When catching up:
- Default to 24h lookback if no specific time range given
- User can specify "since Monday", "last 48h", etc.
