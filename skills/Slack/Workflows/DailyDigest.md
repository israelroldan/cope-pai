# Daily Digest Workflow

Generates Slack summary for inclusion in COPE daily briefing.

## When to Run

- Automatically during daily briefing
- On demand: "what's happening at work" / "slack digest"

## Process

### 1. Gather Channel Activity

For each channel in `Config/channels.yaml`:

```
channels_history(channel, since: last_briefing or 16h ago)
```

Filter based on priority:
- **critical/high**: Always include
- **medium**: Include if activity > threshold
- **low**: Include only if explicitly tracked topic mentioned

### 2. Check DM Activity

For each person in `Config/people.yaml` with `dm_monitoring: true`:

```
conversations_history(dm_channel, since: last_briefing)
```

### 3. Check Response Status

Query ResponseTracker for pending items:
- Questions you asked that haven't been answered
- Requests made to others

### 4. Detect Topic Mentions

Scan messages for keywords in `Config/topics.yaml`:
- Flag any tracked topic discussions
- Note who mentioned and context

## Output Format

```
📱 SLACK OVERNIGHT

#founders-talk (3 messages)
   → Sander: Discussing Q1 planning approach
   → Decision made about budget allocation

#product (7 messages)
   → Thread on API refactor (5 replies)
   → Thomas asked about deployment timeline

💬 DMs
   → Maarten: Sent doc for review (unread)

⚠️ PENDING RESPONSES
   → Thomas: Asked about deployment (2d ago, no response)
   → #product: Your question about auth flow (1d ago)

🔔 TOPIC ALERTS
   → "platform" mentioned 3x in #agency-circle
```

## Summarization Rules

1. **Don't list every message** — Summarize themes
2. **Highlight decisions** — Any clear decisions made
3. **Flag action items** — Things directed at you
4. **Note threads** — Active discussions worth following
5. **Call out silence** — Expected responses that didn't come

## Integration Point

This output gets inserted into COPE DailyBriefing between:
- Calendar section
- Priorities section

```markdown
### 5. Slack Digest
[Output from this workflow]
```

## State Tracking

Digest state is session-ephemeral:
- Default lookback: 16 hours (covers overnight)
- Briefing can be run multiple times; each shows latest activity
- Pending responses tracked in LifeOS Tasks (see ResponseTracker workflow)
