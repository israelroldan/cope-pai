---
name: COPE
description: Personal executive layer. USE WHEN user needs to clarify decisions, organize priorities, track open loops, do daily/weekly reviews, or invoke the C-O-P-E framework.
triggers:
  - briefing
  - priorities
  - open loops
  - decision
  - clarify
  - organize
  - prioritize
  - execute
  - weekly review
  - done for the day
  - what should I focus on
---

# C.O.P.E. - Clarify, Organise, Prioritise, Execute

Personal executive layer — a chief of staff AI that reduces cognitive load, sharpens judgment, and ensures what matters gets done.

## Quick Commands

| Command | Action |
|---------|--------|
| "briefing" / "what's on today" | Run daily briefing |
| "briefing done" | Mark briefing complete, stop prompts |
| "done for the day" | Mark day closed |
| "log decision: X because Y" | Add to decision log |
| "add priority: X" | Add to priorities |
| "add open loop: X waiting on Y" | Add open loop |
| "weekly review" | Run week-end retrospective |
| "clarify: X" | Run Clarify workflow on topic |
| "what should I focus on" | Surface top priority |

## The Framework

| Phase | Purpose |
|-------|---------|
| **Clarify** | Define the real problem. Remove ambiguity. Surface assumptions. |
| **Organise** | Place in context. Identify constraints, dependencies, stakeholders. |
| **Prioritise** | Decide what matters now. Rank by impact, urgency, cost of delay. |
| **Execute** | Turn decisions into action. Define ownership, next steps, track progress. |

## Operating Database: LifeOS

**Primary backend is LifeOS** (personal Notion workspace). State lives in Notion, not YAML files.

| COPE Concept | LifeOS Location |
|--------------|-----------------|
| Priorities | Tasks database (priority property) |
| Open Loops | Tasks database (waiting_on property) |
| Inbox | Inbox database |
| Decisions | Decisions database |
| Daily Rhythm | Journal database |
| Week Focus | Goals database |

### How It Works

COPE operates through natural language commands. When you say things like:
- "add to inbox: Research MCP options"
- "log decision: Use REST because simpler for MVP"
- "add priority: Finish API review"

These trigger MCP calls to create/update entries in the LifeOS Notion databases. See the workflow files for specific MCP syntax.

### Legacy State Files (removed)

The `.cope/` YAML files (`state.yaml`, `decisions.yaml`, etc.) and CLI tools have been removed. All state now lives in LifeOS.

## Workflows

- `Clarify.md` — Step through clarification
- `Organise.md` — Context mapping
- `Prioritise.md` — Ranking framework
- `Execute.md` — Action planning
- `DailyBriefing.md` — Morning routine
- `DailyClose.md` — End-of-day routine
- `WeekStart.md` — Monday kickoff
- `WeekMid.md` — Wednesday check
- `WeekEnd.md` — Friday retrospective

## Skill Integrations

COPE orchestrates multiple skills during briefings and reviews:

| Skill | Integration |
|-------|-------------|
| **LifeOS** | Operating database — tasks, inbox, decisions, open loops, journal |
| **School** | Dropoff/pickup constraints in daily briefing |
| **Scheduling** | Calendar events, conflict detection |
| **Email** | Inbox digest, pending responses |
| **Slack** | Channel activity, commitments, response tracking |
| **Lifelog** | Conversations, memories, action item sync to open loops |

## Reference

- Full framework: `Framework.md`
- Behavioral guidelines: `ChiefOfStaff.md`
