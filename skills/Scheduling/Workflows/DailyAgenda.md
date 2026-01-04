# DailyAgenda Workflow

**Trigger:** "what's on today", "calendar today", "agenda", "my day"

Produces a unified view of calendar events and school logistics for a given day.

## Steps

### 1. Determine Target Date

- Default: today
- Parse date from query: "tomorrow", "Monday", "Jan 15"
- Convert to ISO format for MCP calls

### 2. Get School Constraints

Call magister MCP for school logistics:

```
get_dropoff_time(date) → morning departure time
get_pickup_time(date) → afternoon constraint
```

Calculate:
- Morning: When to leave for dropoff
- Afternoon: Hard stop for pickup

### 3. Get Calendar Events

Call google-calendar-work MCP:

```
list-events(
  calendarId: "primary",
  timeMin: "{date}T00:00:00",
  timeMax: "{date}T23:59:59",
  timeZone: "Europe/Amsterdam"
)
```

### 4. Merge and Format

Combine school and calendar into unified view:

```
📅 {Day}, {Date}

🏫 School
   {dropoff_time} - Leave for {child} dropoff

💼 Work
   {time} - {event_title} ({duration})
   {time} - {event_title} ({duration})

🏠 Home (if home calendar enabled)
   {time} - {event_title}

⚠️ Leave by {pickup_departure} for pickup ({child} ends {pickup_time})
```

### 5. Flag Conflicts

Check for:
- Events overlapping with pickup departure time
- Back-to-back meetings without buffer
- Double-booked time slots

Add warning icons:
- ⚠️ Conflict with school constraint
- ⏰ Tight transition (< 5 min buffer)

## Output Format

```markdown
📅 Monday, January 6

🏫 School
   08:15 - Leave for Amélie dropoff (1st period 9:00)

💼 Work
   09:30 - Team Standup (30min)
   11:00 - 1:1 with Sarah (45min)
   14:00 - Sprint Planning (1hr) ⚠️

⚠️ Sprint Planning ends 15:00 but pickup requires leaving by 14:25
   → Philippe ends at 14:45

💡 Suggestion: Ask to end Sprint Planning 30min early
```

## Error Handling

| Error | Response |
|-------|----------|
| Calendar MCP unavailable | Show school info only, note "Work calendar unavailable" |
| School MCP unavailable | Show calendar only, warn "School times not verified" |
| No events | "No events scheduled for {date}" + school times |

## Integration

This workflow is called by:
- COPE `DailyBriefing.md` workflow
- Direct user request
