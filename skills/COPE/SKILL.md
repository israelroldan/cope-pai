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

## State Files

Located in `.cope/` directory of current project:

- `state.yaml` — priorities, open loops, inbox
- `decisions.yaml` — decision log with rationale
- `daily.yaml` — daily rhythm state
- `weekly.yaml` — weekly rhythm state

## Tools

- `GetContext.ts` — Read current state
- `UpdateState.ts` — Modify priorities/loops/inbox
- `LogDecision.ts` — Append decision with rationale

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

## Reference

- Full framework: `Framework.md`
- Behavioral guidelines: `ChiefOfStaff.md`
