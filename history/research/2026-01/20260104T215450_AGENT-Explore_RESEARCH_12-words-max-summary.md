---
capture_type: RESEARCH
timestamp: 2026-01-04 22:54:50
executor: Explore
agent_completion: [12 words max summary]
---

# RESEARCH: [12 words max summary]

**Agent:** Explore
**Completed:** 20260104T215450

---

## Agent Output

Perfect! Now I have all the information needed. Let me compile a comprehensive summary based on the SkillSystem.md file and the examples I found.

## Summary of Key Structural Requirements for Creating a New Skill

Based on my analysis of the SkillSystem.md file and skill examples, here are the critical requirements:

### 1. REQUIRED SKILL STRUCTURE

**Directory Layout (TitleCase Mandatory):**
```
SkillName/
├── SKILL.md              # Main skill definition file
├── QuickStartGuide.md    # Optional context files (TitleCase naming)
├── Tools/                # Must always exist (even if empty)
│   └── ToolName.ts       # TypeScript tools/CLI utilities
└── Workflows/            # Work execution workflows
    └── WorkflowName.md   # TitleCase naming required
```

**Naming Convention - MANDATORY TitleCase (PascalCase):**
- Skill directory: `SkillName` (NOT `skill-name` or `skillname`)
- Workflow files: `Create.md`, `UpdateInfo.md` (NOT `create.md` or `update-info.md`)
- Tool files: `ManageServer.ts` (NOT `manage-server.ts`)
- YAML name field: `name: SkillName` (NOT `name: skill-name`)

### 2. SKILL.md FILE STRUCTURE (MANDATORY FORMAT)

**Part 1: YAML Frontmatter**
```yaml
---
name: SkillName
description: [What it does]. USE WHEN [intent triggers using OR]. [Additional capabilities].
---
```

**Rules:**
- `name` field uses **TitleCase only**
- `description` is a **single-line string** (no multi-line `|` blocks)
- The `USE WHEN` keyword is **MANDATORY** - describes trigger conditions
- Maximum 1024 characters total
- Description format: "What it does. USE WHEN [trigger conditions]. [Optional additional context]."

**Part 2: Markdown Body (Required Sections)**

Must include:
- **H1 heading**: `# SkillName` (same as name field)
- **Brief description**: One paragraph explaining the skill
- **Workflow Routing table**: Defines all workflows and their triggers
- **Examples section**: 2-3 realistic usage patterns

Example structure:
```markdown
# SkillName

[Brief description of what the skill does]

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" or intent | `Workflows/WorkflowOne.md` |
| **WorkflowTwo** | "another trigger" | `Workflows/WorkflowTwo.md` |

## Examples

**Example 1: [Use case description]**
\`\`\`
User: "[User request]"
→ Invokes WorkflowName workflow
→ [Describes the result/action taken]
\`\`\`
```

### 3. WORKFLOW DEFINITION PATTERN

**File: `Workflows/WorkflowName.md`**

Each workflow should include:
- **Trigger**: User phrases or conditions that invoke it
- **Purpose**: What the workflow accomplishes
- **When This Runs**: Manual and automatic invocation scenarios
- **Workflow Steps**: Numbered sequential steps with details
- **Integration Points**: How it connects with other skills
- **Example Output**: Sample results showing the response format

Example trigger format:
```markdown
> **Trigger:** "trigger phrase 1", "trigger phrase 2", OR automatically when [condition]
```

### 4. SKILL INTEGRATION & INTERACTION

**How Skills Reference Each Other:**
- Skills can call other skills through their workflows
- External data comes through MCP (Model Context Protocol) servers defined in `.mcp.json`
- Skills pass data through structured outputs and can invoke other skill workflows
- Hard dependencies are documented in the SKILL.md description

**Example Integration:**
```markdown
description: Manages scheduling. USE WHEN calendar queries, availability checks, meeting creation. Integrates with School skill for pickup/dropoff constraints.
```

**MCP Server Integration:**
- Skills access external services (Google Calendar, Slack, etc.) through MCP servers
- MCP servers are configured in `.mcp.json`
- Workflows invoke MCP tools (e.g., `list-events`, `create-event`)

### 5. VALIDATION REQUIREMENTS (Checklist)

Before considering a skill complete, verify:

- [ ] Skill directory uses **TitleCase**
- [ ] `SKILL.md` YAML `name:` uses **TitleCase**
- [ ] Single-line `description` with mandatory `USE WHEN` clause
- [ ] `## Workflow Routing` section with proper table format
- [ ] `## Examples` section with 2-3 usage patterns
- [ ] `Tools/` directory exists (can be empty, but must exist)
- [ ] All workflow files use **TitleCase naming**
- [ ] All workflow files include: Trigger, Purpose, When This Runs, Steps
- [ ] Cross-skill dependencies clearly documented
- [ ] MCP server references valid (if using external services)
- [ ] File paths in tables use backticks (e.g., `` `Workflows/WorkflowName.md` ``)

### 6. KEY DESIGN PATTERNS

**Skill Scope:** Each skill focuses on one domain (Scheduling, Email, School logistics, etc.)

**Workflow Decomposition:** Complex operations break into separate workflows with specific triggers

**Configuration:** Calendar definitions, constraints, and defaults stored in YAML config files (e.g., `calendars.yaml`)

**Tool Organization:** CLI utilities in `Tools/` directory, separate from workflow definitions

**Response Format (Recommended):**
```
📋 SUMMARY: [One sentence]
🔍 ANALYSIS: [Key findings]
⚡ ACTIONS: [Steps taken]
✅ RESULTS: [Outcomes]
➡️ NEXT: [Recommended next steps]
🎯 COMPLETED: [12 words max summary]
```

### File Locations
- SkillSystem specification: `/Users/israel/code/danielmiessler/pai/Packs/kai-core-install/src/skills/CORE/SkillSystem.md`
- CORE skill example: `/Users/israel/code/danielmiessler/pai/Packs/kai-core-install/src/skills/CORE/SKILL.md`
- CreateSkill reference skill: `/Users/israel/code/danielmiessler/pai/Packs/kai-core-install/src/skills/CreateSkill/SKILL.md`
- Scheduling skill plan (applying this system): `/Users/israel/code/israelroldan/cope/plans/scheduling-skill.md`
agentId: ab38f4b (for resuming to continue this agent's work if needed)

---

## Metadata

**Transcript:** `/Users/israel/.claude/projects/-Users-israel-code-israelroldan-cope/2aa189f6-bd15-49fb-a2b6-2fc07eae6749.jsonl`
**Captured:** 2026-01-04 22:54:50

---

*Captured by PAI History System subagent-stop-hook*
