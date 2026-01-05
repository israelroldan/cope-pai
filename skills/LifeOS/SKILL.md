---
name: LifeOS
description: Personal life operating system via Notion. USE WHEN tasks, inbox, projects, goals, habits, journal, decisions, open loops, priorities, areas, capture, quick add, what's on my plate, personal planning. COPE backend - replaces YAML state files.
---

# LifeOS - Personal Operating System

The central operating database for personal life management. Built on the LifeOS Notion template, this skill serves as the **backend for COPE** - all state lives here instead of YAML files.

## Quick Commands

| Command | Action |
|---------|--------|
| "add to inbox: X" | Quick capture to Inbox |
| "my tasks today" | Show today's tasks |
| "open loops" | Show items waiting on something |
| "log decision: X because Y" | Add to Decisions database |
| "add priority: X" | Create prioritized task |
| "show projects" | List active projects |
| "journal: X" | Add to daily journal |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **QuickCapture** | "add to inbox", "capture", "quick add" | `Workflows/QuickCapture.md` |
| **TasksToday** | "tasks today", "what's on my plate", "priorities" | `Workflows/TasksToday.md` |
| **OpenLoops** | "open loops", "waiting on", "blocked" | `Workflows/OpenLoops.md` |
| **LogDecision** | "log decision", "decided", "decision:" | `Workflows/LogDecision.md` |
| **Projects** | "projects", "project status", "active projects" | `Workflows/Projects.md` |
| **Journal** | "journal", "reflect", "daily note" | `Workflows/Journal.md` |
| **Goals** | "goals", "quarterly goals", "what am I working toward" | `Workflows/Goals.md` |
| **Explore** | "explore lifeos", "show databases", "what's in lifeos" | `Workflows/Explore.md` |

## Examples

**Example 1: Quick capture**
```
User: "Add to inbox: Research MCP server options"
-> Invokes QuickCapture workflow
-> Creates item in Inbox database
-> "Added to Inbox: Research MCP server options"
```

**Example 2: Daily tasks**
```
User: "What's on my plate today?"
-> Invokes TasksToday workflow
-> Queries Tasks database, filters by today/priority
-> Returns:

TASKS TODAY
   1. [P1] Finish API review
   2. [P2] Prep for sprint planning
   3. [ ] Reply to Thomas

   Open loops: 2
   Inbox items: 5
```

**Example 3: Log decision**
```
User: "Log decision: Using REST instead of GraphQL because simpler for MVP"
-> Invokes LogDecision workflow
-> Creates entry in Decisions database
-> "Logged: Using REST instead of GraphQL"
```

---

## COPE Integration

**LifeOS IS the COPE backend.** All state lives in Notion databases:

| COPE Concept | LifeOS Location | Data Source ID |
|--------------|-----------------|----------------|
| Priorities | Tasks (priority property) | `collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c` |
| Open Loops | Tasks (waiting_on property) | `collection://2dff8fbf-cf75-81ec-9d5a-000bd513a35c` |
| Inbox | Notes database | `collection://2dff8fbf-cf75-8171-b984-000b1a6487f3` |
| Decisions | Decisions database | `collection://8df780cc-91fe-4c51-9c59-d8f20c7dbd7b` |
| Daily Rhythm | Journal entries | `collection://2dff8fbf-cf75-816e-8222-000ba6610bff` |
| Weekly Reviews | Journal entries | `collection://2dff8fbf-cf75-816e-8222-000ba6610bff` |
| Week Focus | Goals database | `collection://2dff8fbf-cf75-811f-a2e7-000b753d5c5a` |

### State Sync

COPE workflows read/write directly to LifeOS:
- `DailyBriefing` → Queries Tasks, Inbox, Open Loops
- `DailyClose` → Updates Journal, syncs action items
- `WeekEnd` → Creates weekly review in Journal

---

## MCP Tools Used

| Tool | MCP Server | Purpose |
|------|------------|---------|
| `notion_search` | notion-personal | Search across LifeOS |
| `notion_query_database` | notion-personal | Query Tasks, Projects, etc. |
| `notion_create_page` | notion-personal | Add inbox items, tasks, decisions |
| `notion_update_page` | notion-personal | Update task status, properties |
| `notion_retrieve_page` | notion-personal | Read page content |

---

## Database Structure

*Note: Actual database IDs stored in `Config/databases.yaml` after exploration.*

### Core Databases (from LifeOS template)

| Database | Purpose | Key Properties |
|----------|---------|----------------|
| **Inbox** | Quick capture | Title, Created |
| **Tasks** | All tasks | Title, Status, Priority, Due, Project, waiting_on* |
| **Projects** | Multi-step work | Title, Status, Area, Progress |
| **Areas** | Life areas | Title, Description |
| **Goals** | Objectives | Title, Timeframe, Status, Progress |
| **Journal** | Daily reflections | Date, Content, Mood |

### Decisions Database

| Database | Purpose | Properties |
|----------|---------|------------|
| **Decisions** | Decision log | Decision (title), Rationale, Date, Context, Outcome, Tags |

---

## Setup Requirements

1. **Connect notion-personal MCP** (OAuth to personal workspace)
2. **Grant access** to LifeOS pages when prompted

Database IDs are already configured in `Config/databases.yaml`.

---

## Authentication

Uses Notion hosted MCP with OAuth:
1. First use opens browser
2. Select **personal workspace** (not work!)
3. Grant access to LifeOS pages

---

## Privacy

LifeOS contains personal data. The notion-personal MCP is separate from notion-work to maintain workspace isolation.
