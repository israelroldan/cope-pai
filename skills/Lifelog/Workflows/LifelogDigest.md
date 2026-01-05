# LifelogDigest Workflow

Generates a digest of recent lifelog activity for daily briefing integration.

## Trigger

- "what happened yesterday"
- "recent conversations"
- Daily briefing (automatic)

## Steps

1. **Query Recent Conversations**
   ```
   get_conversations(limit: 10)
   ```
   - Filter to last 24 hours (or since last briefing)
   - Extract key participants and topics

2. **Query Recent Memories**
   ```
   get_memories(limit: 20)
   ```
   - Filter by recency
   - Group by category

3. **Check for Action Items**
   - Scan conversation summaries for action items
   - Flag any unsynced items

4. **Format Output**
   ```
   LIFELOG OVERNIGHT
      Conversations: [count]
      * [Notable conversation 1]
      * [Notable conversation 2]

      New memories: [count]
      "[Key memory excerpt]"

      Action items: [count] (synced to open loops)
   ```

## State Update

After digest:
- State is session-ephemeral (no persistent file needed)
- Action items synced to LifeOS Tasks database

## Context for Daily Briefing

When invoked as part of COPE daily briefing:
- Keep output concise (max 5 lines)
- Highlight only notable conversations (>10 min or work-related)
- Always mention action item count
