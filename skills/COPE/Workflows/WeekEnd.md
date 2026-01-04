# Week End Review Workflow

Use this workflow on Friday to close out the week.

## Steps

### 1. Capture Wins
```
What got done this week?
- Completed priorities
- Progress made
- Problems solved
```

### 2. Identify Carries
```
What moves to next week?
- Incomplete priorities
- New items that emerged
- Blocked items
```

### 3. Extract Learnings
```
What did you learn?
- What worked well?
- What didn't work?
- What would you do differently?
```

### 4. Rate the Week (Optional)
```
1 = Terrible, nothing worked
2 = Below expectations
3 = Okay, met minimum
4 = Good, solid progress
5 = Great, exceeded goals
```

## Commands
```bash
bun run WeeklyReview.ts end             # Show review
bun run WeeklyReview.ts win "..."       # Log win
bun run WeeklyReview.ts carry "..."     # Log carry
bun run WeeklyReview.ts learning "..."  # Log learning
bun run WeeklyReview.ts end --done      # Mark complete
```

## Questions to Ask
- "What am I proud of this week?"
- "What would I do differently?"
- "What's the one thing to carry forward?"
