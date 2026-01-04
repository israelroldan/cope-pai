---
name: Slack
description: Proactive work intelligence from Tatoma Slack. USE WHEN daily briefing, catch up on channels, check what's happening at work, track commitments, find discussions, search slack, post message, check responses. Auto-surfaces relevant context.
triggers:
  - slack
  - what's happening at work
  - catch up on
  - any messages
  - did anyone respond
  - post to slack
  - search slack
  - what did I promise
  - commitments
  - founders
  - team discussion
---

# Slack - Proactive Work Intelligence

Tatoma workspace integration with proactive context surfacing, commitment tracking, and response monitoring.

## Quick Commands

| Command | Action |
|---------|--------|
| "catch up on #channel" | Summarize recent channel activity |
| "what's happening at work" | Digest of key channels |
| "did anyone respond to X" | Check for responses |
| "what did I promise" | List detected commitments |
| "post to #channel: message" | Send message to channel |
| "search slack for X" | Search messages |

## Proactive Behaviors

This skill doesn't wait to be asked. It:

1. **Surfaces in Daily Briefing** — Key channel activity overnight
2. **Tracks Commitments** — Parses "I'll...", "I will...", "Let me..." from your messages
3. **Monitors Responses** — Flags when questions go unanswered
4. **Alerts on Topics** — Notifies when tracked topics are discussed

## Channel Priority

| Priority | Channel | Notes |
|----------|---------|-------|
| CRITICAL | #founders-talk | Co-founder discussions |
| CRITICAL | #project-gynzy | Client team (joining soon) |
| HIGH | #product | Israel's work discussions |
| HIGH | #-ai-rollout-project | Robin Radar client |
| MEDIUM | #agency-circle | Platform/product topics only |
| LOW | #wot | Event follow-ups (temporary) |

## Key People (DMs)

| Priority | Person | Role |
|----------|--------|------|
| CRITICAL | Sander Kok | Co-founder |
| CRITICAL | Maarten van den Heuvel-Erp | Co-founder |
| HIGH | Thomas Verhappen | Direct report |

## Tracked Topics

Keywords that trigger proactive alerts:
- platform, product, website, hub
- robin radar, gynzy

## Workflows

- `DailyDigest.md` — Channel summary for daily briefing
- `CommitmentScan.md` — Parse and track promises
- `ResponseTracker.md` — Monitor pending responses
- `ChannelCatchup.md` — Deep dive on specific channel

## MCP Tools Used

| Tool | Purpose |
|------|---------|
| `channels_list` | List workspace channels |
| `conversations_history` | Fetch channel messages |
| `conversations_replies` | Get thread replies |
| `conversations_search_messages` | Search messages |
| `conversations_add_message` | Post messages |

## Config Files

- `Config/channels.yaml` — Channel priorities and settings
- `Config/people.yaml` — Key people to track
- `Config/topics.yaml` — Keywords to monitor

## Integration with COPE

### Daily Briefing Addition
```
📱 SLACK OVERNIGHT
   #founders-talk: 3 new messages (Sander mentioned Q1 planning)
   #product: Discussion about API refactor
   ⚠️ Pending: You asked Thomas about deployment - no response (2d)
```

### Open Loops from Slack
Commitments detected in Slack get added to COPE open loops:
```yaml
- item: "Review PR for authentication"
  source: "slack:#product"
  detected: "2026-01-04"
  context: "You said 'I'll review that PR today'"
```

## Response Timeout

Default: 48 hours before flagging "no response yet"

Configure per-person if needed (e.g., external contacts may need longer).
