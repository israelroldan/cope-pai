---
name: Scheduling
description: Calendar management across Work and Home contexts with school constraint awareness. USE WHEN calendar, schedule meeting, book time, availability, what's on today, free at, create event, when can I meet, find time, agenda, week overview. Integrates with School skill for hard constraints.
---

# Scheduling - Unified Calendar Management

Manages calendar operations across Work and Home contexts, respecting school pickup/dropoff as hard constraints. Single interface for all scheduling needs.

## Quick Commands

| Command | Action |
|---------|--------|
| "what's on my calendar today" | Show daily agenda |
| "am I free at 2pm tomorrow?" | Check availability |
| "schedule a meeting with X" | Create event with context detection |
| "find time for a 1:1 next week" | Suggest available slots |
| "what does my week look like" | Week overview |
| "show my work calendar" | List work events |

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **DailyAgenda** | "what's on today", "calendar today", "agenda" | `Workflows/DailyAgenda.md` |
| **CheckAvailability** | "am I free", "availability", "can I meet at" | `Workflows/CheckAvailability.md` |
| **CreateEvent** | "schedule", "book", "create event", "add to calendar" | `Workflows/CreateEvent.md` |
| **SuggestTime** | "find time for", "when can we meet", "suggest slot" | `Workflows/SuggestTime.md` |
| **WeekOverview** | "week overview", "what's my week", "next week" | `Workflows/WeekOverview.md` |

## Examples

**Example 1: Daily agenda with school integration**
```
User: "What's on today?"
→ Invokes DailyAgenda workflow
→ Queries work calendar via google-calendar-work MCP
→ Queries school times via magister MCP
→ Returns merged view:

📅 Today (Monday, Jan 6)

🏫 School
   08:15 - Leave for Amélie dropoff

💼 Work
   09:30 - Team Standup (30min)
   14:00 - Sprint Planning (1hr)

⚠️ Leave by 14:25 for pickup (Philippe ends 14:45)
```

**Example 2: Availability check with constraints**
```
User: "Am I free Thursday at 3pm?"
→ Invokes CheckAvailability workflow
→ Checks work calendar
→ Checks school pickup constraint
→ "No - you need to leave by 14:25 for Philippe pickup (ends 14:45)"
```

**Example 3: Context-aware event creation**
```
User: "Schedule a sync with the team tomorrow at 10am"
→ Invokes CreateEvent workflow
→ Detects "team" + weekday 10am = Work context
→ Checks for conflicts
→ Creates event via google-calendar-work MCP
→ "Created 'Team Sync' tomorrow 10:00-10:30 on Work calendar"
```

**Example 4: Smart time suggestions**
```
User: "Find time for a 1:1 with Sarah next week"
→ Invokes SuggestTime workflow
→ Queries availability for the week
→ Applies school constraints
→ Returns ranked options:
  1. Monday 11:00 ✓ Clear morning slot
  2. Tuesday 14:00 ✓ Before pickup window
  3. Wednesday 10:00 ⚠️ Half-day (pickup 12:10)
```

---

## Calendar Configuration

Calendars are defined in `Config/calendars.yaml`:

### Work Calendar
| Field | Value |
|-------|-------|
| Provider | google-calendar-work MCP |
| Hours | Mon-Fri 9:00-17:00 |
| Signals | @tatoma.eu emails, "meeting", "1:1", "standup", "sync" |

### Home Calendars (iCloud via ical-home MCP)

| Calendar | Purpose | Routing Signals |
|----------|---------|-----------------|
| **Israel** | Personal appointments | "dentist", "doctor", "my appointment" |
| **Family** | Shared family events | "family", "vacation", "trip", "dinner" |
| **Amélie** | Amélie's activities | "amélie", "piano", "her lesson" |
| **Philippe** | Philippe's activities | "philippe", "soccer", "his practice" |

**Context-only calendars (read, no write):**
- Holidays in Netherlands → shown with Family view
- Birthdays → reminders only, never blocks availability

---

## Smart Routing (Home Calendars)

When creating home events, the target calendar is auto-detected:

```
"Add dentist Friday 10am"        → Israel (personal)
"Family dinner Saturday 7pm"     → Family
"Amélie piano Tuesday 4pm"       → Amélie
"Philippe soccer practice"       → Philippe
"Book something next week"       → Israel (fallback)
```

**Explicit override:** Say "add to [Calendar] calendar" to bypass routing:
```
"Add birthday party to Family calendar"
```

**Ambiguity:** If signals match multiple calendars, prompt for clarification:
```
"Amélie and Philippe dentist" → Ask: Israel (personal) or separate events?
```

---

## Context Detection

| Signal | Inferred Context |
|--------|------------------|
| Weekday 9-5 | Work |
| Weekend | Home |
| @tatoma.eu attendees | Work |
| "meeting", "1:1", "standup" | Work |
| "family", "personal", "appointment" | Home |
| Child name mentioned | Home → child's calendar |

---

## Constraints Integration

**School constraints:**
- **Amélie pickup** → HARD CONSTRAINT (Israel picks up)
- **Amélie dropoff** → Blocks morning (Israel drives)
- **Philippe pickup** → NOT a constraint (wife handles)
- **Philippe dropoff** → Only constrains when Amélie has 2nd period (combined run)

Source: School skill via magister MCP

**Constraint priority:**
1. Amélie pickup/dropoff (immovable)
2. Existing calendar events (all calendars)
3. Configured work hours
4. Buffer preferences

*Philippe's schedule is informational only unless Israel explicitly mentions he's handling pickup.*

---

## MCP Tools Used

| Tool | MCP Server | Purpose |
|------|------------|---------|
| `list-events` | google-calendar-work | Query work events |
| `create-event` | google-calendar-work | Create work events |
| `get-freebusy` | google-calendar-work | Check work availability |
| `list_events` | ical-home | Query home events |
| `create_event` | ical-home | Create home events |
| `list_calendars` | ical-home | List available calendars |
| `get_pickup_time` | magister | School pickup constraint |
| `get_dropoff_time` | magister | School dropoff constraint |
