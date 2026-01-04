# SuggestTime Workflow

**Trigger:** "find time for", "when can we meet", "suggest slot", "schedule something next week"

Finds available time slots that work within all constraints.

## Steps

### 1. Parse Requirements

Extract from query:
- **Duration needed:** "1 hour", "30 minutes", default 30 min
- **Time range:** "next week", "tomorrow", "this week"
- **Participants:** Attendees to check availability for
- **Preferences:** "morning", "afternoon", "after 2pm"

### 2. Get Constraints for Date Range

For each day in range, get:

**School constraints:**
```
get_pickup_time(date) → afternoon cutoff
get_dropoff_time(date) → morning start
```

**Existing events:**
```
list-events(
  calendarId: "primary",
  timeMin: "{range_start}",
  timeMax: "{range_end}",
  timeZone: "Europe/Amsterdam"
)
```

### 3. Build Availability Windows

For each day:

```
Available windows = Work hours
  - School morning block (until arrival at work)
  - School afternoon block (from pickup departure)
  - Existing calendar events
  - Buffer time between events (5 min default)
```

### 4. Filter by Duration

Keep only windows that fit requested duration:

```python
for window in available_windows:
    if window.duration >= requested_duration + buffer:
        valid_slots.append(window)
```

### 5. Rank Suggestions

Score each slot:

| Factor | Weight | Scoring |
|--------|--------|---------|
| Preferred time (10:00, 14:00) | +2 | Matches preference |
| Morning slot | +1 | Generally preferred |
| Avoid lunch (12:00-13:00) | -1 | Unless specified |
| Adjacent to existing meeting | -1 | Context switching |
| Buffer from school constraint | +1 | Safer margin |
| Day of week | varies | Mon-Tue preferred over Fri |

### 6. Present Options

Return top 3-5 options with context:

```markdown
**Available slots for 1-hour meeting next week:**

1. **Monday 10:00-11:00** (Recommended)
   ✓ Clear morning, no conflicts
   ✓ Preferred time slot

2. **Tuesday 14:00-15:00**
   ✓ Free slot
   ⚠️ Must end by 14:25 for pickup → shortened to 14:00-14:20

3. **Wednesday 10:00-11:00**
   ✓ Free slot
   ℹ️ Half-day (pickup at 12:10)

4. **Thursday 11:00-12:00**
   ✓ Free slot
   ℹ️ After Team Standup

Would you like me to book one of these?
```

## Multi-Participant Mode

If attendees specified and their calendars are visible:

### Get Participant Availability

```
get-freebusy(
  timeMin: "{range_start}",
  timeMax: "{range_end}",
  items: [
    { id: "primary" },
    { id: "{attendee_email}" }
  ]
)
```

### Find Overlapping Free Time

```markdown
**Matching availability with Sarah:**

1. **Monday 10:00-11:00**
   ✓ Both free

2. **Tuesday 14:00-14:20**
   ✓ Both free (shortened for pickup)

3. **Thursday 11:00-12:00**
   ⚠️ Sarah has "tentative" - Product Review
```

## Output Formats

### Standard Suggestions

```markdown
**Finding 30-minute slot this week...**

Best options:
1. Tomorrow (Tue) 10:00 ✓ Recommended
2. Tomorrow (Tue) 14:00 ✓ Before pickup
3. Wednesday 10:00 ⚠️ Half-day
4. Thursday 11:00 ✓ After standup

Reply with a number to book, or "none" for more options.
```

### With Participant

```markdown
**Finding time with Sarah (1 hour):**

Both available:
1. Monday 10:00-11:00 ✓
2. Thursday 11:00-12:00 ✓

Sarah busy:
- Tuesday all day (offsite)
- Wednesday PM (workshop)

Book option 1 or 2?
```

### No Availability

```markdown
**No 2-hour slots available next week**

Constraints:
- Mon: Full day booked
- Tue: Only 1hr gaps
- Wed/Fri: Half-days (school)
- Thu: Back-to-back meetings

Suggestions:
1. Split into two 1-hour sessions
2. Look at week of Jan 13
3. Request time from existing meetings
```

## Preferences from Config

Load from `Config/calendars.yaml`:

```yaml
preferences:
  preferred_times: ["10:00", "14:00"]
  avoid_times: ["12:00", "13:00"]
  min_meeting_gap: 5
```

## Error Handling

| Scenario | Response |
|----------|----------|
| No slots found | Explain why, suggest alternatives |
| Participant calendar private | Note "couldn't check {name}'s calendar" |
| School MCP down | Warn "school constraints not verified" |
| Very far future | "Looking at {month} - schedule may change" |
