---
name: School
description: Amélie & Philippe school schedules and scheduling constraints. USE WHEN school, pickup, dropoff, schedule meeting, book time, calendar, availability, when can I, free slot, afternoon meeting, end of day, kids, children. Amélie pickup is a HARD CONSTRAINT. Philippe pickup is handled by wife (not a constraint unless explicitly mentioned).
---

# School - Amélie & Philippe's Schedules

School logistics for both children. **Only Amélie's pickup is a hard constraint** on Israel's calendar.

## CRITICAL: Scheduling Constraints

**Morning:** Israel handles dropoffs (varies by day)
**Afternoon:**
- **Amélie:** Israel picks up → HARD CONSTRAINT
- **Philippe:** Wife picks up → NOT a constraint (unless Israel explicitly says he's doing it)

When scheduling meetings:
1. Check Amélie's schedule (hard constraint)
2. Philippe's schedule is informational only
3. Flag Amélie pickup conflicts proactively

## Examples

**Example: Scheduling a late meeting**
```
User: "Can I schedule a 4pm meeting tomorrow?"
→ Calls get_pickup_time for tomorrow
→ If pickup requires leaving at 3:40pm → CONFLICT
→ "Amélie's last class ends at 4pm. You need to leave by 3:40pm for pickup."
```

**Example: Checking availability**
```
User: "When am I free Thursday afternoon?"
→ Calls get_pickup_time for Thursday
→ Returns availability window ending at departure time
```

**Example: Morning planning**
```
User: "What time do I need to leave tomorrow?"
→ Calls get_dropoff_time via Magister MCP
→ Applies 45-min drive time from home
→ Returns departure time with buffer
```

**Example: Afternoon pickup**
```
User: "When should I leave work to pick up Amélie?"
→ Calls get_pickup_time via Magister MCP
→ Applies 20-min drive from work
→ Returns departure time
```

**Example: Combined morning dropoff**
```
User: "What time tomorrow morning?"
→ Calls get_dropoff_time for Amélie
→ If Amélie starts after 9:00 (2nd period), it's a combined run
→ "Amélie has 2nd period. You're taking both kids. Leave by 8:10 for Philippe's 8:30 start."
```

**Example: Philippe's afternoon**
```
User: "When does Philippe finish Wednesday?"
→ Fixed schedule lookup: Wednesday = 12:30
→ "Philippe finishes at 12:30 on Wednesdays"
```

---

## Children

### Amélie (daughter)
| Field | Value |
|-------|-------|
| Schedule | Variable (via Magister MCP) |
| Commute from home | 45 min |
| Commute home→school→work | 65 min total |

### Philippe (son)
| Field | Value |
|-------|-------|
| Schedule | Fixed (see below) |
| Commute from home | 10 min |

**Philippe's Fixed Schedule:**
| Day | Start | End |
|-----|-------|-----|
| Monday | 8:30 | 14:45 |
| Tuesday | 8:30 | 14:45 |
| Wednesday | 8:30 | 12:30 |
| Thursday | 8:30 | 14:45 |
| Friday | 8:30 | 12:30 |

---

## Daily Logistics

### Morning Routes

**Driver:** Israel

**Scenario A: Amélie has 1st period (normal)**
- Israel takes Amélie only
- Philippe gets to school separately (wife takes him)
- Route: Home → Amélie's school (45 min) → Work (20 min)

**Scenario B: Amélie has 2nd period start (late start)**
- Israel takes BOTH children
- Route: Home → Philippe's school (10 min) → Amélie's school → Work
- Must leave earlier to accommodate both dropoffs

**How to detect:** Check Amélie's first class via MCP. If after ~9:00, it's likely 2nd period.

### Afternoon Routes

**Amélie pickup (Israel):** ← HARD CONSTRAINT
| Leg | From | To | Duration |
|-----|------|-----|----------|
| 1 | Work | Amélie's school | 20 min |
| 2 | Amélie's school | Home | 45 min |

**Philippe pickup (Wife):** ← NOT a constraint on Israel
- Wife handles Philippe pickup by default
- Only becomes Israel's constraint if explicitly mentioned

---

## Time Calculations

When asked about departure times:

### Morning (dropoff)

**Amélie only (1st period):**
```
Leave home = Amélie's first class - 45 min - buffer
```

**Both kids (Amélie 2nd period):**
```
Leave home = Philippe's start (8:30) - 10 min - buffer = ~8:10
Then drop Amélie after Philippe
```

### Afternoon (pickup)

**Amélie (Israel's constraint):**
```
Leave work = Amélie's last class end - 20 min
```

**Philippe (Wife handles - NOT Israel's constraint):**
```
Mon/Tue/Thu: ends 14:45
Wed/Fri: ends 12:30
```
*Philippe's times are informational only. Wife picks him up.*

**Default buffer:** 10 minutes (arrive slightly early)

---

## MCP Integration

This skill uses the `magister` MCP server for live schedule data:

| MCP Tool | Use For |
|----------|---------|
| `get_schedule` | Full day schedule |
| `get_week_schedule` | Week overview |
| `get_dropoff_time` | First class time |
| `get_pickup_time` | Last class end time |

---

## Quick Responses

| Query | Response Pattern |
|-------|------------------|
| "What time school tomorrow?" | First class time |
| "When do I leave?" | Calculate with drive time |
| "Pick up time?" | Last class end + context |
| "Week schedule?" | Full week from MCP |
| "Any cancelled classes?" | Check schedule for cancellations |

---

## Work Calendar Integration

**Always check Amélie's schedule when:**
- Scheduling any afternoon meeting
- Planning end-of-day activities
- Checking afternoon availability
- Someone asks "can you meet at X time"

**Hard stops (Amélie only):**

Amélie's schedule varies daily - always check via Magister MCP:
```
get_pickup_time(date) → Amélie's last class end time
Leave work = pickup_time - 20 min
```

*Philippe is NOT a constraint - wife handles his pickup.*

**Example hard stop calculation:**
| Amélie ends | Leave work by |
|-------------|---------------|
| 15:00 | 14:40 |
| 15:30 | 15:10 |
| 16:00 | 15:40 |

**Early release days:** Check for shortened school days that require earlier pickup
