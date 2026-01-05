# GetConversations Workflow

Retrieve and search conversation transcripts from the lifelog.

## Trigger

- "what did I discuss with [person]"
- "conversations about [topic]"
- "meeting with [person]"
- "what happened in the call"

## Steps

1. **Parse Query**
   - Extract person names
   - Extract topic keywords
   - Identify time constraints

2. **Query Conversations**
   ```
   get_conversations(limit: 20)
   ```

3. **Filter and Match**
   - Search transcripts for person mentions
   - Match topic keywords in summary/transcript
   - Apply time filters

4. **Format Output**
   ```
   💬 CONVERSATIONS: "[search context]"

   [Date, Duration]: [Summary]
   Participants: [detected names]
   Key points:
   - [point 1]
   - [point 2]

   [Show transcript? y/n]
   ```

## Notes

- Conversation transcripts can be long; summarize first
- Offer to show full transcript on request
- Geolocation data available if relevant
