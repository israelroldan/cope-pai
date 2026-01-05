# CreateMemory Workflow

Create a new memory entry in the Omi lifelog.

## Trigger

- "remember that [content]"
- "save this: [content]"
- "note that [content]"
- "add to my memories: [content]"

## Steps

1. **Parse Content**
   - Extract the memory content
   - Detect appropriate category (personal/work/interesting)

2. **Confirm with User** (optional for ambiguous requests)
   - "Save as [category] memory: '[content]'?"

3. **Create Memory**
   ```
   create_memory(content: "[content]", category: "[category]")
   ```

4. **Confirm Creation**
   ```
   ✅ Memory saved: "[excerpt]"
   Category: [category]
   ```

## Category Detection

| Signal | Category |
|--------|----------|
| Work context, meetings, projects | `work` |
| Personal reminders, family | `personal` |
| Ideas, observations | `interesting` |
| Default fallback | `personal` |

## Notes

- Keep memories concise but complete
- Add context if the raw input is ambiguous
- Memories can be edited/deleted later via Omi app or API
