---
capture_type: RESEARCH
timestamp: 2026-01-04 16:41:54
executor: Explore
agent_completion: [12 words max - drives voice output]
---

# RESEARCH: [12 words max - drives voice output]

**Agent:** Explore
**Completed:** 20260104T154154

---

## Agent Output

Excellent! Now I have a comprehensive understanding. Let me create a detailed summary document of the PAI infrastructure:

## PAI (Personal AI Infrastructure) - Comprehensive Architecture & Configuration Guide

Based on my thorough exploration of `~/.config/pai/`, here's what I found:

---

## 1. DIRECTORY STRUCTURE

```
~/.config/pai/
├── .env                          # Environment configuration
├── .current-session              # Active session metadata
├── agent-sessions.json           # Session-to-agent mappings
├── skills/                       # Skill definitions
│   ├── CORE/                     # Auto-loaded core skill
│   │   ├── SKILL.md             # Identity, response format, personality
│   │   ├── SkillSystem.md       # Mandatory skill structure spec
│   │   ├── PaiArchitecture.md   # Auto-generated system state
│   │   └── Workflows/
│   │       └── UpdateDocumentation.md
│   ├── Prompting/               # Meta-prompting & templates
│   │   ├── SKILL.md
│   │   ├── Standards.md         # Prompt engineering best practices
│   │   ├── Tools/               # CLI tools for template rendering
│   │   │   ├── RenderTemplate.ts
│   │   │   ├── ValidateTemplate.ts
│   │   │   └── package.json
│   │   └── Templates/           # Handlebars templates
│   │       ├── Primitives/      # 5 core template primitives
│   │       │   ├── Briefing.hbs
│   │       │   ├── Roster.hbs
│   │       │   ├── Voice.hbs
│   │       │   ├── Structure.hbs
│   │       │   └── Gate.hbs
│   │       ├── Data/            # YAML data sources
│   │       └── Compiled/        # Generated output (gitignored)
│   ├── CreateSkill/             # Skill creation framework
│   │   └── SKILL.md
│   └── skill-index.json         # Auto-generated searchable index
├── Tools/                        # PAI infrastructure tools
│   ├── PaiArchitecture.ts       # System state tracking
│   ├── GenerateSkillIndex.ts    # Index generation
│   └── SkillSearch.ts           # Skill discovery
├── hooks/                        # Event hooks (TypeScript/Bun)
│   ├── initialize-session.ts    # SessionStart: Setup environment
│   ├── load-core-context.ts     # SessionStart: Inject CORE skill
│   ├── capture-session-summary.ts # SessionEnd: Session analysis
│   ├── capture-all-events.ts    # All events: JSONL logging
│   ├── stop-hook.ts             # Stop: Capture work summaries
│   ├── security-validator.ts    # PreToolUse: Command validation
│   ├── update-tab-titles.ts     # Tab title management
│   ├── subagent-stop-hook.ts    # Subagent lifecycle
│   └── lib/
│       ├── observability.ts     # Event dashboard integration
│       └── metadata-extraction.ts # Agent metadata enrichment
└── history/                      # Persistent knowledge base
    ├── sessions/                # Session summaries (organized by year-month)
    ├── learnings/               # Learning captures
    ├── research/                # Research notes
    ├── decisions/               # Decision logs
    ├── execution/               # Execution tracking
    │   ├── features/
    │   ├── bugs/
    │   └── refactors/
    ├── raw-outputs/             # Raw JSONL event logs
    └── Upgrades.jsonl           # Upgrade history log
```

---

## 2. ENVIRONMENT CONFIGURATION

**File:** `~/.config/pai/.env`

```bash
DA="Cope"                                    # Your AI's name
PAI_DIR="${HOME}/.config/pai"               # Root directory
TIME_ZONE="America/Los_Angeles"             # Session timestamps
PAI_SOURCE_APP="Cope"                       # Event source identifier
```

**Optional environment variables:**
- `PAI_OBSERVABILITY_URL` - Dashboard endpoint (defaults to `http://localhost:4000/events`)
- `CLAUDE_CODE_AGENT` - Current agent type (set by hooks)
- `SUBAGENT` - Subagent session indicator
- `PAI_HOME` - Alternative to `PAI_DIR`

---

## 3. SKILL SYSTEM - THE EXTENSION POINT

### **Skill Structure (MANDATORY)**

Every skill must follow TitleCase naming and this structure:

```
SkillName/
├── SKILL.md                  # Metadata + routing
├── QuickStartGuide.md        # Context files (TitleCase)
├── Tools/                    # CLI tools (ALWAYS present)
│   └── ToolName.ts
└── Workflows/                # Work execution workflows
    └── WorkflowName.md
```

### **SKILL.md Format**

```yaml
---
name: SkillName
description: What it does. USE WHEN trigger phrases. Additional context.
---

# SkillName

[Brief description]

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowName** | "trigger phrase" | `Workflows/WorkflowName.md` |

## Examples

**Example 1: [Use case]**
[Example implementation]
```

**Key Rules:**
- `name:` uses **TitleCase** (e.g., `CreateSkill`, not `create-skill`)
- `description:` is **single-line** with **mandatory `USE WHEN`** clause
- Max 1024 characters
- Workflows table routes trigger phrases to implementation files

### **Skill Tiers**

From `GenerateSkillIndex.ts`:

| Tier | Loading | Examples |
|------|---------|----------|
| **Always** | Auto-loaded at session start | CORE, Development, Research |
| **Deferred** | Loaded on-demand when triggered | Prompting, CreateSkill |

Skills are discovered via trigger matching in their description.

---

## 4. EXISTING SKILLS

### **CORE (Always-Loaded)**

**Location:** `/Users/israel/.config/pai/skills/CORE/SKILL.md`

**Contains:**
- AI identity: Name, role, personality calibration
- Response format template (emoji-based structure)
- First-person voice guidelines
- Quick references to supporting docs

**Auto-loaded at session start via `load-core-context.ts` hook**

**Example personality calibration:**
```
Humor: 60/100, Curiosity: 90/100, Precision: 95/100, 
Formality: 50/100, Directness: 80/100
```

### **Prompting (Deferred)**

**Location:** `/Users/israel/.config/pai/skills/Prompting/`

**Components:**
1. **Standards.md** - Anthropic's Claude 4.x best practices + research
2. **Templates/** - 5 Handlebars-based primitives
3. **Tools/** - RenderTemplate, ValidateTemplate CLI tools

**Template Primitives:**
- **Roster.hbs** - Agent/skill definitions from data
- **Voice.hbs** - Personality calibration settings
- **Structure.hbs** - Multi-step workflow patterns
- **Briefing.hbs** - Agent context handoff (see below for example)
- **Gate.hbs** - Validation checklists

**Usage:**
```bash
bun run $PAI_DIR/skills/Prompting/Tools/RenderTemplate.ts \
  --template Primitives/Briefing.hbs \
  --data Data/Examples/Briefing.yaml \
  --output output.md
```

### **CreateSkill (Deferred)**

**Location:** `/Users/israel/.config/pai/skills/CreateSkill/SKILL.md`

Provides workflows for:
- Creating new skills
- Validating skill structure
- Canonicalizing existing skills (fixing TitleCase)

---

## 5. HOOKS SYSTEM - THE AUTOMATION LAYER

Hooks are Bun TypeScript files that execute at specific Claude Code lifecycle events.

### **Hook Types & Timing**

| Hook | Event | Timing | Purpose |
|------|-------|--------|---------|
| `initialize-session.ts` | SessionStart | First | Environment setup, tab title |
| `load-core-context.ts` | SessionStart | Second | Inject CORE skill context |
| `capture-all-events.ts` | All events | Always | JSONL event logging |
| `security-validator.ts` | PreToolUse | Before tool | Command validation |
| `stop-hook.ts` | Stop | Session end | Capture work summaries |
| `capture-session-summary.ts` | SessionEnd | After stop | Detailed session analysis |
| `subagent-stop-hook.ts` | SubagentStop | Subagent end | Track agent lifecycle |
| `update-tab-titles.ts` | - | On-demand | Terminal tab naming |

### **Key Hook Capabilities**

**initialize-session.ts:**
- Sets terminal tab title from project name
- Creates session marker file
- Ensures directory structure exists
- Sends to observability dashboard
- Non-blocking version check

**load-core-context.ts:**
- Reads CORE skill at session start
- Injects as system-reminder for Claude
- Skips for subagent sessions (they inherit context)
- Outputs to stdout for Claude Code processing

**security-validator.ts:**
- Validates Bash commands against 10 threat categories
- Tiers: Catastrophic (block), ReverseShell (block), CredentialTheft (block), PromptInjection (block), EnvManipulation (warn), GitDangerous (confirm), SystemMod (log), Network (log), Exfiltration (block), PAIProtection (block)
- Exit code 2 = block, 0 = allow
- Integrates with observability for incident logging

**capture-all-events.ts:**
- Appends to JSONL files organized by month
- Tracks agent type from Task tool calls
- Enriches with metadata for subagent spawning
- Maps session_id → agent_name in `agent-sessions.json`

**stop-hook.ts:**
- Extracts summary from emoji-based response format
- Analyzes text for learning indicators
- Categorizes as SESSION or LEARNING
- Organizes by year-month directory

**capture-session-summary.ts:**
- Analyzes raw event logs for session focus
- Detects: blog-work, hook-development, skill-updates, agent-work, testing, git-operations, deployment
- Lists tools used, files modified, commands executed

---

## 6. INFRASTRUCTURE TOOLS

All built with Bun, located in `/Users/israel/.config/pai/Tools/`:

### **PaiArchitecture.ts**

Scans and tracks system state.

**Commands:**
```bash
bun run $PAI_DIR/Tools/PaiArchitecture.ts generate    # Generate Architecture.md
bun run $PAI_DIR/Tools/PaiArchitecture.ts status      # Show state to stdout
bun run $PAI_DIR/Tools/PaiArchitecture.ts check       # Verify health
bun run $PAI_DIR/Tools/PaiArchitecture.ts log-upgrade "msg" [type]
```

**Detects:**
- Installed packs (via SKILL.md files)
- Bundles (from `.installed-bundles.json`)
- Upgrade history (from `history/Upgrades.jsonl`)
- System health (hooks, history, skills directories)

### **GenerateSkillIndex.ts**

Creates `skill-index.json` for skill discovery.

**Features:**
- Parses all SKILL.md files
- Extracts triggers from "USE WHEN" clauses
- Separates always-loaded from deferred tiers
- Enables fuzzy search matching

**Triggers Example:**
- "USE WHEN create skill, new skill, structure" → triggers: ["create", "skill", "new", "structure"]

### **SkillSearch.ts**

Searches skill index with fuzzy matching.

**Usage:**
```bash
bun run $PAI_DIR/Tools/SkillSearch.ts --list                    # Show all
bun run $PAI_DIR/Tools/SkillSearch.ts "search query"           # Fuzzy search
```

**Scoring:**
- Exact name match: +10 points
- Trigger contains term: +5 points
- Description contains term: +2 points

---

## 7. HISTORY & OBSERVABILITY

### **Session Tracking**

Files saved to `~/.config/pai/history/`:

| Location | Content | Organized By |
|----------|---------|--------------|
| `sessions/YYYY-MM/` | Session summaries | Month |
| `learnings/YYYY-MM/` | Learning captures | Month |
| `research/` | Research notes | Topic |
| `decisions/` | Decision logs | - |
| `raw-outputs/YYYY-MM/` | Event JSONL logs | Month |
| `Upgrades.jsonl` | System upgrades | - |

**Filename Pattern:**
- Session: `20260104T152430_SESSION_project-name.md`
- Learning: `20260104T152430_LEARNING_key-insight.md`

### **Current Session State**

**File:** `~/.config/pai/.current-session`

```json
{
  "session_id": "72ed314d-d855-47d8-bfe0-79490c5e10c4",
  "started": "2026-01-04 16:25:11",
  "cwd": "/Users/israel/code/israelroldan/cope",
  "project": "israelroldan"
}
```

### **Agent Session Mapping**

**File:** `~/.config/pai/agent-sessions.json`

```json
{
  "session-uuid": "main",
  "session-uuid-2": "research-agent",
  "session-uuid-3": "code-review-agent"
}
```

Maps session IDs to agent types for multi-agent tracking.

### **Observability Integration**

**Endpoint:** `http://localhost:4000/events` (configurable)

From `hooks/lib/observability.ts`:

**Event Types:**
- PreToolUse
- PostToolUse
- UserPromptSubmit
- Notification
- Stop
- SubagentStop
- SessionStart
- SessionEnd
- PreCompact

**Event Fields:**
```typescript
{
  source_app: string;           // Agent name
  session_id: string;
  hook_event_type: string;
  timestamp: string;            // ISO format
  transcript_path?: string;
  summary?: string;
  tool_name?: string;
  tool_input?: any;
  tool_output?: any;
  agent_type?: string;
  model?: string;
  [key: string]: any;           // Custom fields
}
```

**Fails Silently:** If dashboard is down, hooks continue working (no blocking).

---

## 8. EXTENSION POINTS - WHERE TO ADD CUSTOM FUNCTIONALITY

### **Adding a New Skill (No Core Modification)**

1. **Create directory:**
   ```
   ~/.config/pai/skills/MySkill/
   ├── SKILL.md
   ├── Tools/
   └── Workflows/
   ```

2. **Write SKILL.md** with TitleCase naming and "USE WHEN" triggers

3. **Regenerate index:**
   ```bash
   bun run $PAI_DIR/Tools/GenerateSkillIndex.ts
   ```

4. **Skill is immediately available** - no core changes needed

**Example Workflow File Structure:**
```markdown
# MyWorkflow

[Steps and instructions]

## Tools Used
[Reference to tool files]
```

### **Adding a New Hook**

1. **Create hook file:** `~/.config/pai/hooks/my-hook.ts`

2. **Implement as Bun script** reading stdin JSON and exiting with code 0 or 2

3. **Register with Claude Code** config (hook discovery mechanism)

4. **Hook runs at event type** (SessionStart, PreToolUse, Stop, etc.)

**Template:**
```typescript
#!/usr/bin/env bun
// $PAI_DIR/hooks/my-hook.ts

interface Payload {
  session_id: string;
  [key: string]: any;
}

async function main() {
  try {
    const stdinData = await Bun.stdin.text();
    if (!stdinData.trim()) process.exit(0);
    
    const payload: Payload = JSON.parse(stdinData);
    
    // Your logic here
    
    process.exit(0);  // Allow / 2 = block
  } catch (error) {
    console.error('Error:', error);
    process.exit(0);
  }
}

main();
```

### **Adding a Template Primitive**

1. **Create Handlebars file:** `~/.config/pai/skills/Prompting/Templates/Primitives/MyTemplate.hbs`

2. **Use Handlebars syntax:**
   - `{{variable}}` for interpolation
   - `{{#each items}}` for loops
   - `{{#if condition}}` for conditionals
   - `{{> partial}}` for includes

3. **Render with existing tool:**
   ```bash
   bun run $PAI_DIR/skills/Prompting/Tools/RenderTemplate.ts \
     --template Primitives/MyTemplate.hbs \
     --data Data/MyData.yaml
   ```

### **Adding Tools to a Skill**

Create TypeScript files in `MySkill/Tools/`:

```typescript
// MySkill/Tools/DoSomething.ts
#!/usr/bin/env bun

async function main() {
  // Tool implementation
}

main().catch(console.error);
```

**Usage in SKILL.md:**
```bash
bun run $PAI_DIR/skills/MySkill/Tools/DoSomething.ts [args]
```

### **Adding Validation Rules**

Extend `security-validator.ts` ATTACK_PATTERNS:

```typescript
myCategory: {
  patterns: [/regex-pattern/i],
  action: 'block' | 'warn' | 'confirm' | 'log',
  message: '🚨 Message'
}
```

---

## 9. KEY PATTERNS & CONVENTIONS

### **TitleCase Everything**
- Skill directories: `CreateSkill`, not `create-skill`
- Files: `WorkflowName.md`, not `workflow-name.md`
- YAML names: `name: CreateSkill`

### **Trigger Matching**
- Use "USE WHEN" in skill descriptions
- Words become searchable triggers
- Multi-word triggers split on commas/spaces

### **Skill Tier Classification**
- **Always:** CORE, Development, Research (auto-loaded)
- **Deferred:** Everything else (loaded on-demand)
- Determined in `GenerateSkillIndex.ts` hardcoded list

### **Emoji-Based Response Format** (CORE)
```
📋 SUMMARY:    [One sentence]
🔍 ANALYSIS:   [Key findings]
⚡ ACTIONS:    [Steps taken]
✅ RESULTS:    [Outcomes]
➡️ NEXT:       [Next steps]
🎯 COMPLETED:  [12 words max - drives voice output]
```

Stop hook uses these for learning extraction.

### **Session Organization**
- By year-month: `2026-01/`
- Timestamps: ISO format, converted to local with TIME_ZONE
- Focus detection: Analyzes files/commands to categorize work type

---

## 10. SUMMARY OF EXTENSION ARCHITECTURE

**The design enables custom functionality WITHOUT modifying core files:**

| Layer | Extension Mechanism | No Core Changes |
|-------|-------------------|-----------------|
| **Skills** | New TitleCase directories | Yes - auto-discovered |
| **Hooks** | New .ts files in hooks/ | Yes - if Claude Code supports registration |
| **Tools** | New TypeScript executables | Yes - referenced from skills |
| **Templates** | New .hbs files in Prompting/ | Yes - rendered with existing tools |
| **Validation** | Pattern additions in security-validator.ts | Minimal - add to ATTACK_PATTERNS |
| **History** | Automatically captured | Yes - happens in background |

**Discovery & Loading:**
- Skills: Scanned by GenerateSkillIndex.ts → stored in skill-index.json
- Hooks: Triggered by Claude Code lifecycle events
- Tools: Referenced from SKILL.md Workflow Routing
- Templates: Rendered on-demand with RenderTemplate.ts

---

This architecture prioritizes **composition over modification** - you can extend functionality by adding files in designated directories without touching core system logic.
agentId: a4f9854 (for resuming to continue this agent's work if needed)

---

## Metadata

**Transcript:** `/Users/israel/.claude/projects/-Users-israel-code-israelroldan-cope/72ed314d-d855-47d8-bfe0-79490c5e10c4.jsonl`
**Captured:** 2026-01-04 16:41:54

---

*Captured by PAI History System subagent-stop-hook*
