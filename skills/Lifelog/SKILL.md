---
name: Lifelog
description: Continuous lifelog access via Omi wearable. USE WHEN memories, lifelog, what did I say, conversations, recall, remember, action items, what happened, yesterday, recent discussions. Integrates with COPE daily briefings and syncs action items to open loops.
---

# Lifelog - Memory & Conversation Access

Access Israel's continuous lifelog from the Omi wearable device. Provides conversational recall, memory search, and action item extraction with COPE integration.

## Quick Commands

| Command | Action |
|---------|--------|
| "what did I discuss yesterday" | Recent conversations digest |
| "any memories about X" | Search lifelog |
| "what action items from my lifelog" | List detected action items |
| "remember that I..." | Create a memory |
| "what happened in my meeting with X" | Conversation search |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **LifelogDigest** | "what happened", "yesterday", "recent", daily briefing | `Workflows/LifelogDigest.md` |
| **SearchMemories** | "memories about", "recall", "remember when", "did I mention" | `Workflows/SearchMemories.md` |
| **GetConversations** | "conversations", "what did I discuss", "meeting with" | `Workflows/GetConversations.md` |
| **CreateMemory** | "remember that", "save this", "note that" | `Workflows/CreateMemory.md` |
| **ActionItemSync** | "action items", "sync lifelog tasks", briefing integration | `Workflows/ActionItemSync.md` |

## Examples

**Example 1: Daily briefing lifelog**
```
User: "What happened yesterday?"
-> Invokes LifelogDigest workflow
-> Queries omi MCP for recent memories and conversations
-> Returns:

🎙️ LIFELOG (Yesterday)
   Conversations: 4
   * Meeting with Sander about Q1 priorities (45 min)
   * Call with Robin Radar team re: API integration

   Memories created: 3
   "Follow up on domain transfer by Friday"

   Action items detected: 2
```

**Example 2: Contextual recall**
```
User: "What did I say about the API design?"
-> Invokes SearchMemories workflow
-> Query: "API design"
-> Returns matching memories with context:
   - Jan 3: "Discussed REST vs GraphQL, decided on REST for simplicity"
   - Jan 2: "Robin Radar needs webhook support for events"
```

**Example 3: Conversation lookup**
```
User: "What did I discuss with Thomas last week?"
-> Invokes GetConversations workflow
-> Searches for conversations mentioning "Thomas"
-> Returns transcripts and summaries
```

---

## MCP Tools Used

| Tool | MCP Server | Purpose |
|------|------------|---------|
| `get_memories` | omi | Retrieve memories with category filter |
| `get_conversations` | omi | Fetch conversation transcripts |
| `create_memory` | omi | Add new memory entries |
| `edit_memory` | omi | Update existing memories |
| `delete_memory` | omi | Remove memories |

---

## Memory Categories

The lifelog organizes memories by category:

| Category | Description |
|----------|-------------|
| `personal` | Personal notes and reminders |
| `work` | Work-related content |
| `interesting` | Notable observations |
| `system` | Auto-generated summaries |

Query with: `get_memories(categories: "work,personal")`

---

## COPE Integration

### Daily Briefing

LifelogDigest workflow is called during COPE daily briefing:

```
🎙️ LIFELOG OVERNIGHT
   Conversations: 2
   * Evening chat about weekend plans

   New memories: 1
   "Remember to check on the garden irrigation"

   Action items: 1 (synced to open loops)
```

### Action Item Sync

ActionItemSync workflow extracts action items and creates LifeOS Tasks:

- Parses action items from conversation summaries
- Creates entries in LifeOS Tasks database with Tags = "Lifelog"
- Stores lifelog_id in task notes for deduplication
- Prevents duplicates via memory ID tracking

### State Tracking

Lifelog sync state is session-ephemeral:
- Processed memory IDs tracked during session
- Deduplication via lifelog_id stored in task notes

---

## Privacy Notes

- The device captures continuous audio; be mindful of sensitive conversations
- Memories and transcripts are stored on the provider's servers
- API access requires explicit developer key authorization
