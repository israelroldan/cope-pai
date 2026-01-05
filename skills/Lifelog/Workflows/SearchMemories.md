# SearchMemories Workflow

Search the lifelog for specific memories by topic, person, or timeframe.

## Trigger

- "memories about [topic]"
- "did I mention [thing]"
- "recall [topic]"
- "what did I say about [topic]"

## Steps

1. **Parse Query**
   - Extract search terms
   - Identify time constraints ("last week", "yesterday")
   - Identify category filters if mentioned

2. **Query Memories**
   ```
   get_memories(limit: 50, categories: "[if specified]")
   ```

3. **Filter Results**
   - Match against search terms in content
   - Apply time filter if specified
   - Rank by relevance (term frequency, recency)

4. **Format Output**
   ```
   🔍 MEMORIES: "[search term]"

   [Date]: "[Memory excerpt]"
   [Date]: "[Memory excerpt]"

   Found [n] matching memories
   ```

## Notes

- If no matches found, suggest broadening search
- For person-specific searches, also check conversations
- Truncate long memory content, offer to show full text
