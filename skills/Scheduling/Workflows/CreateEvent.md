# CreateEvent Workflow

**Trigger:** "schedule", "book", "create event", "add to calendar", "set up a meeting"

Creates calendar events with automatic context detection and conflict checking.

## Steps

### 1. Parse Event Details

Extract from query:
- **Title:** Meeting name or generate from context
- **Date/Time:** Parse natural language ("tomorrow at 2pm", "next Monday")
- **Duration:** Explicit or default (30 min work, 60 min home)
- **Attendees:** Email addresses mentioned
- **Location:** If specified

### 2. Detect Calendar Context

**Step 2a: Check for explicit override**

User can specify calendar directly:
- "add to Family calendar" → Family
- "add to work calendar" → Work
- "put on Amélie's calendar" → Amélie

If explicit, skip detection and use specified calendar.

**Step 2b: Determine Work vs Home**

| Signal | Weight | Context |
|--------|--------|---------|
| Weekday 9-5 | Medium | Work |
| Weekend | Medium | Home |
| @tatoma.eu attendees | High | Work |
| "meeting", "1:1", "sync" | Medium | Work |
| "family", "personal" | Medium | Home |
| Child name mentioned | High | Home |

Default to **Work** for ambiguous weekday requests.

**Step 2c: Smart routing for Home calendars**

If Home context detected, route to specific calendar:

| Signals Detected | Target Calendar |
|------------------|-----------------|
| "dentist", "doctor", "haircut", "gym" | Israel (personal) |
| "family", "vacation", "trip", "dinner" | Family |
| "amélie", "piano", "her lesson" | Amélie |
| "philippe", "soccer", "his practice" | Philippe |
| No specific match | Israel (fallback) |

**Step 2d: Handle ambiguity**

If signals match multiple calendars, ask user:

```markdown
📅 Which calendar for "Dentist appointment for kids"?

1. **Israel** - Your personal appointment
2. **Family** - Shared family event
3. **Separate events** - One on Amélie + one on Philippe

Reply with number or calendar name.
```

### 3. Check Constraints

**School constraints:**
```
get_pickup_time(date) → Does event end before departure?
get_dropoff_time(date) → Does event start after arrival?
```

**Calendar conflicts:**
```
get-freebusy(
  timeMin: "{start}",
  timeMax: "{end}",
  items: [{ id: "primary" }]
)
```

### 4. Handle Conflicts

If conflict detected:

```markdown
⚠️ Conflict detected:

Your request: "Team Sync" 14:00-15:00

Conflicts with:
- School pickup: Must leave by 14:25 (Philippe ends 14:45)

Options:
1. Create 14:00-14:20 (shortened)
2. Move to 13:00-14:00
3. Create anyway (arrange alternate pickup)
4. Cancel

Which would you prefer?
```

### 5. Create Event

**For Work calendar** — Call google-calendar-work MCP:

```
create-event(
  calendarId: "primary",
  summary: "{title}",
  start: "{start_iso}",
  end: "{end_iso}",
  timeZone: "Europe/Amsterdam",
  attendees: [{ email: "{attendee}" }],
  location: "{location}"
)
```

**For Home calendars** — Call ical-home MCP:

```
create_event(
  create_event_request: {
    title: "{title}",
    start_time: "{start_iso}",
    end_time: "{end_iso}",
    calendar_name: "{routed_calendar}",  # Israel, Family, Amélie, or Philippe
    location: "{location}",
    notes: "{description}"
  }
)
```

### 6. Confirm Creation

```markdown
✓ Created: "Team Sync"
  📅 Tuesday, January 7
  🕐 14:00-14:30 (30 min)
  📍 Work calendar
  👥 team@company.com

Note: You'll need to leave by 14:25 for pickup - event ends just in time.
```

## Context Detection Examples

| Query | Context | Calendar | Reason |
|-------|---------|----------|--------|
| "Schedule standup tomorrow 9:30" | Work | Work | "standup" keyword |
| "Book dentist Friday 10am" | Home | Israel | "dentist" → personal |
| "Meeting with bob@acme.com" | Work | Work | External email |
| "Add family dinner Saturday" | Home | Family | "family" + "dinner" |
| "Block 2 hours for focus time" | Work | Work | Default weekday |
| "Amélie piano Tuesday 4pm" | Home | Amélie | Child name + activity |
| "Philippe soccer practice" | Home | Philippe | Child name + activity |
| "Vacation next week" | Home | Family | "vacation" → shared |
| "My doctor appointment" | Home | Israel | "my" + "doctor" |
| "Add to Family calendar: party" | Home | Family | Explicit override |

## Duration Defaults

| Context | Default Duration |
|---------|------------------|
| Work meeting | 30 minutes |
| Work 1:1 | 45 minutes |
| Home appointment | 60 minutes |
| Focus time | 120 minutes |

## Output Format

### Success
```markdown
✓ Created: "{title}"
  📅 {date}
  🕐 {time} ({duration})
  📍 {calendar} calendar
  👥 {attendees if any}
```

### With Warning
```markdown
✓ Created: "{title}"
  📅 {date}
  🕐 {time} ({duration})

⚠️ Note: {constraint_warning}
```

### Conflict - Needs Resolution
```markdown
⚠️ Cannot create "{title}" at {time}

Reason: {conflict_description}

Suggestions:
1. {alternative_1}
2. {alternative_2}
3. Create anyway
```

## Error Handling

| Error | Response |
|-------|----------|
| Past time | "That time has passed. Create for next {day}?" |
| Outside work hours | "That's outside work hours. Add to home calendar?" |
| MCP unavailable | "Calendar service unavailable. Try again later." |
| Invalid attendee | "Could not add {email}. Create without attendee?" |
