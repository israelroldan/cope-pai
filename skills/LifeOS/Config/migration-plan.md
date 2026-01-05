# COPE → LifeOS Migration Plan

## Status: COMPLETED (2026-01-05)

Migration from YAML-based state files to LifeOS (Notion) is complete.

## Previous State (YAML) - DEPRECATED

The following files are no longer used and can be deleted:
```
.cope/
├── state.yaml        → migrated to Tasks database
├── decisions.yaml    → migrated to Decisions database
├── daily.yaml        → migrated to Journal
└── weekly.yaml       → migrated to Journal
```

## Current State (LifeOS)

| COPE Concept | LifeOS Database | Property Mapping |
|--------------|-----------------|------------------|
| priorities | Tasks | Priority = P1/P2/P3 |
| open_loops | Tasks | waiting_on (text) |
| inbox | Inbox | (default) |
| decisions | Decisions | (new database) |
| daily_rhythm | Journal | Date-based entries |
| weekly_rhythm | Journal | Weekly review tag |
| week_focus | Goals | Current quarter |

## Migration Steps

### Phase 1: Setup (After MCP Connected) - COMPLETED 2026-01-05

1. **Run Explore workflow** ✅
   - Discovered all database IDs
   - Mapped property names
   - Saved to `Config/databases.yaml`

2. **Add Waiting On property to Tasks** ✅
   - Type: Text (rich_text)
   - Purpose: Track what/who item is blocked on

3. **Create Decisions database** ✅
   - Properties: Decision (title), Rationale (text), Date, Context, Outcome, Tags
   - Location: LifeOS Dashboard
   - Database ID: 8721aa7d-8f73-4189-ab8b-3acb60590d05

### Phase 2: COPE Updates - COMPLETED 2026-01-05

4. **Update COPE SKILL.md** ✅
   - References LifeOS as backend
   - YAML state file mentions removed

5. **Update DailyBriefing.md** ✅
   - Queries Tasks for priorities via MCP
   - Queries Inbox for count
   - Queries Tasks with waiting_on for open loops

6. **Update DailyClose.md** ✅
   - Writes to Journal database
   - Syncs via LifeOS

7. **Update WeekEnd.md** ✅
   - Creates weekly review in Journal
   - Queries Goals for progress

### Phase 3: Deprecate YAML - COMPLETED 2026-01-05

8. **YAML tools deprecated** ✅
   - GetContext.ts, UpdateState.ts, LogDecision.ts removed
   - Natural language + MCP is the new interface

9. **YAML state files deprecated** ✅
   - Data migrated to LifeOS
   - Files can be manually deleted: `rm -rf ~/.cope/`

## Database IDs Template

After exploration, populate:

```yaml
# Config/databases.yaml
databases:
  inbox: null      # Discover via Explore
  tasks: null
  projects: null
  areas: null
  goals: null
  journal: null
  decisions: null  # Create first
```

## Success Criteria - ALL COMPLETE

- [x] All COPE workflows query LifeOS
- [x] Daily briefing shows LifeOS data
- [x] Decisions database created in Notion
- [x] Open loops property (Waiting On) added to Tasks
- [x] Journal entries created during daily close
- [x] No YAML files needed for operation
- [x] Email/Slack/Lifelog skills updated to use LifeOS
- [x] COPE hooks updated

## Discovered Database IDs

See `Config/databases.yaml` for complete configuration.

| Database | ID | Data Source |
|----------|-----|-------------|
| Tasks | 2dff8fbf-cf75-810b-... | collection://2dff8fbf-cf75-81ec-... |
| Projects | 2dff8fbf-cf75-814f-... | collection://2dff8fbf-cf75-81fd-... |
| Journal | 2dff8fbf-cf75-8194-... | collection://2dff8fbf-cf75-816e-... |
| Goals | 2dff8fbf-cf75-81f5-... | collection://2dff8fbf-cf75-811f-... |
| Notes (Inbox) | 2dff8fbf-cf75-8160-... | collection://2dff8fbf-cf75-8171-... |
| Decisions | 8721aa7d-8f73-4189-... | collection://8df780cc-91fe-4c51-... |
