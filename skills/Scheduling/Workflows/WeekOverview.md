# WeekOverview Workflow

**Trigger:** "week overview", "what's my week", "next week", "this week"

Provides a high-level view of the week's schedule with school constraints.

## Steps

### 1. Determine Week Range

- **"this week":** Current week Mon-Fri (or remaining days)
- **"next week":** Following Mon-Fri
- **Specific:** "week of Jan 13"

### 2. Get School Schedule

Call magister MCP:

```
get_week_schedule() → Full week with pickup/dropoff times
```

Map Philippe's fixed schedule:
- Mon/Tue/Thu: 8:30-14:45
- Wed/Fri: 8:30-12:30

### 3. Get Calendar Events

Call google-calendar-work MCP:

```
list-events(
  calendarId: "primary",
  timeMin: "{week_start}T00:00:00",
  timeMax: "{week_end}T23:59:59",
  timeZone: "Europe/Amsterdam"
)
```

### 4. Calculate Daily Summary

For each day:
- Count meetings
- Calculate total meeting hours
- Identify pickup constraint
- Flag conflicts or heavy days

### 5. Format Overview

```markdown
📅 Week of January 6-10

| Day | Meetings | Hours | Pickup | Notes |
|-----|----------|-------|--------|-------|
| Mon | 4 | 3.5h | 14:45 | |
| Tue | 3 | 2.5h | 14:45 | |
| Wed | 2 | 1.5h | 12:10 | ⚠️ Half-day |
| Thu | 5 | 4.5h | 14:45 | ⚠️ Heavy |
| Fri | 1 | 0.5h | 12:10 | ⚠️ Half-day |

**Highlights:**
- Wednesday & Friday are half-days (Philippe 12:30)
- Thursday is packed - consider moving something
- Total: 15 meetings, 12.5 hours

**School Notes:**
- Amélie: [any schedule notes from MCP]
- Philippe: Normal week
```

## Output Formats

### Compact View

```markdown
📅 This Week

Mon: 4 meetings │ leave 14:25
Tue: 3 meetings │ leave 14:25
Wed: 2 meetings │ leave 12:10 ⚠️
Thu: 5 meetings │ leave 14:25 ⚠️ heavy
Fri: 1 meeting  │ leave 12:10 ⚠️
```

### Detailed View

```markdown
📅 Week of January 6-10

**Monday, Jan 6**
🏫 Leave 08:15 (Amélie 1st period)
💼 09:30 Team Standup
💼 11:00 1:1 Sarah
💼 14:00 Sprint Planning
💼 14:30 Quick sync
🏫 Leave 14:25 (Philippe 14:45)

**Tuesday, Jan 7**
🏫 Leave 08:15 (Amélie 1st period)
💼 10:00 Design Review
💼 11:00 Product Sync
💼 15:00 Interview ⚠️ after pickup!
🏫 Leave 14:25 (Philippe 14:45)

...
```

### Visual Calendar

```markdown
📅 Week Overview

       09  10  11  12  13  14  15  16  17
Mon    ░░  ██  ░░  ░░  ░░  ██  ██  ▓▓  --
Tue    ░░  ██  ██  ░░  ░░  ░░  ██  ▓▓  --
Wed    ░░  ██  ░░  ▓▓  --  --  --  --  --
Thu    ░░  ██  ██  ██  ██  ██  ▓▓  --  --
Fri    ░░  ██  ░░  ▓▓  --  --  --  --  --

██ = Meeting  ░░ = Free  ▓▓ = Pickup block  -- = Unavailable
```

## Insights

Add smart observations:

```markdown
**Insights:**

⚠️ **Thursday is overloaded** (4.5 hours of meetings)
   Consider: Move Sprint Retro to Friday morning?

⚠️ **Wednesday conflict:** Product Demo at 11:30 runs until 12:30
   But pickup requires leaving at 12:10
   → Need to leave demo early or arrange alternate pickup

✓ **Friday is light** - good day for focus work

💡 **Free slots available:**
   - Monday 10:00-11:00
   - Tuesday 14:00 (30 min before pickup)
   - Friday 09:30-11:30 (2 hours)
```

## Error Handling

| Error | Response |
|-------|----------|
| Calendar MCP down | Show school schedule only |
| School MCP down | Show calendar only, warn about pickup times |
| No events | "Clear week! School pickup times: ..." |

## Integration

Called by:
- COPE `WeekStart.md` workflow (Monday kickoff)
- Direct user request
- Can be scheduled as Monday morning summary
