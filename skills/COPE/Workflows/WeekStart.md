# Week Start Workflow

Use this workflow on Monday to set up the week.

## Steps

### 1. Review Last Week's Carries
```
What items carried over from last week?
- Check weekly.yaml end_of_week.carries
- Decide: still relevant? priority changed?
```

### 2. Set Top 3 Priorities
```
What are the 3 most important outcomes this week?
- Be specific and measurable
- Consider dependencies and blockers
- Align with larger goals
```

### 3. Identify Blockers
```
What could prevent progress?
- External dependencies
- Missing information
- Resource constraints
```

### 4. Set Weekly Focus
```
One sentence that captures the week's theme.
Example: "Ship the authentication system"
```

## Commands
```bash
bun run WeeklyReview.ts start           # Show prompts
bun run WeeklyReview.ts set-focus "..." # Set focus
bun run WeeklyReview.ts set-top3 a b c  # Set top 3
bun run WeeklyReview.ts start --done    # Mark complete
```

## Questions to Ask
- "What would make this week a success?"
- "What's the one thing that moves everything else forward?"
- "What am I avoiding that I should tackle?"
