# CheckAvailability Workflow

**Trigger:** "am I free", "availability", "can I meet at", "when am I free"

Checks availability for a specific time or time range, applying all constraints.

## Steps

### 1. Parse Request

Extract from query:
- **Specific time:** "am I free at 2pm tomorrow"
- **Time range:** "when am I free Thursday afternoon"
- **Duration needed:** "do I have an hour free tomorrow"

Default duration: 30 minutes (from config)

### 2. Get School Constraints

Call magister MCP:

```
get_pickup_time(date) → afternoon hard stop
get_dropoff_time(date) → morning constraint
```

Calculate blocked windows:
- Morning: 00:00 to (dropoff + travel to work)
- Afternoon: (pickup departure) to 23:59

### 3. Get Calendar Events

Call google-calendar-work MCP:

```
list-events(
  calendarId: "primary",
  timeMin: "{date}T{start_hour}:00:00",
  timeMax: "{date}T{end_hour}:00:00",
  timeZone: "Europe/Amsterdam"
)
```

Or for specific time check:

```
get-freebusy(
  timeMin: "{datetime}",
  timeMax: "{datetime + duration}",
  items: [{ id: "primary" }]
)
```

### 4. Apply Constraints

Layer constraints in order:
1. School pickup/dropoff (immovable)
2. Existing calendar events
3. Configured work hours (9:00-17:00)
4. Buffer preferences

### 5. Determine Availability

**For specific time query:**
```
Available: ✓ Yes, you're free at {time}
          or
Blocked: ✗ No - {reason}
  - "Team Standup" (9:30-10:00)
  - School pickup requires leaving by 14:25
```

**For range query:**
```
Thursday afternoon availability:
- 12:00-13:00 ✓ Free (lunch break)
- 13:00-14:00 ✓ Free
- 14:00-14:25 ✓ Free (25 min window)
- 14:25+ ✗ Blocked: School pickup
```

## Output Formats

### Specific Time Check

```markdown
**2pm Thursday: NOT AVAILABLE**

Reason: You need to leave by 13:25 for Philippe pickup (ends 14:45)

Nearest available slots:
- 11:00-12:00 (1 hour)
- 12:30-13:25 (55 min)
```

### Range Query

```markdown
**Thursday Availability**

Morning (after 9:30 arrival):
- 09:30-10:30 ✓ 1 hour
- 10:30-11:00 ✗ Team Standup
- 11:00-12:00 ✓ 1 hour

Afternoon:
- 12:00-13:00 ✓ 1 hour
- 13:00-14:25 ✓ 1hr 25min
- 14:25+ ✗ School pickup (Philippe 14:45)
```

### Week Overview

```markdown
**Free 1-hour slots this week:**

Monday:    10:00, 14:00
Tuesday:   09:30, 11:00, 14:00
Wednesday: 09:30, 10:30 (half-day, pickup 12:10)
Thursday:  11:00, 13:00
Friday:    10:00 (half-day, pickup 12:10)
```

## Error Handling

| Scenario | Response |
|----------|----------|
| Weekend query | Check home calendar if enabled, note "outside work hours" |
| Past time | "That time has passed. Did you mean {next occurrence}?" |
| School MCP down | Add disclaimer: "⚠️ School times not verified" |

## Context Awareness

Consider calendar context when checking:
- Work hours: Default to work calendar
- Evening/weekend: Check home calendar if enabled
- Ambiguous: Check both and note which is queried
