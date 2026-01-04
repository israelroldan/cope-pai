#!/usr/bin/env bun
// $PAI_DIR/hooks/load-core-context.ts
// SessionStart hook: Inject skill/context files into Claude's context

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface SessionStartPayload {
  session_id: string;
  [key: string]: any;
}

interface SkillInfo {
  name: string;
  path: string;
  content: string;
  isCore: boolean;
}

function isSubagentSession(): boolean {
  // Check for subagent indicators
  // Subagents shouldn't load full context (they get it from parent)
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
}

function getLocalTimestamp(): string {
  const date = new Date();
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} PST`;
  } catch {
    return new Date().toISOString();
  }
}

function discoverSkills(skillsDir: string): SkillInfo[] {
  const skills: SkillInfo[] = [];

  if (!existsSync(skillsDir)) {
    return skills;
  }

  const entries = readdirSync(skillsDir);

  for (const entry of entries) {
    const skillDir = join(skillsDir, entry);

    // Skip non-directories
    if (!statSync(skillDir).isDirectory()) continue;

    const skillPath = join(skillDir, 'SKILL.md');

    if (existsSync(skillPath)) {
      const content = readFileSync(skillPath, 'utf-8');
      skills.push({
        name: entry,
        path: skillPath,
        content,
        isCore: entry === 'CORE',
      });
    }
  }

  return skills;
}

async function main() {
  try {
    // Skip for subagents - they get context from parent
    if (isSubagentSession()) {
      process.exit(0);
    }

    const stdinData = await Bun.stdin.text();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const payload: SessionStartPayload = JSON.parse(stdinData);
    const paiDir = process.env.PAI_DIR || join(homedir(), '.config', 'pai');
    const skillsDir = join(paiDir, 'skills');

    // Discover all skills
    const skills = discoverSkills(skillsDir);

    if (skills.length === 0) {
      console.error('[PAI] No skills found - skipping context injection');
      process.exit(0);
    }

    // Sort: CORE first, then alphabetically
    skills.sort((a, b) => {
      if (a.isCore) return -1;
      if (b.isCore) return 1;
      return a.name.localeCompare(b.name);
    });

    // Build output with all skills
    const skillNames = skills.map(s => s.name).join(', ');
    let skillsContent = '';

    for (const skill of skills) {
      skillsContent += `\n---\n## Skill: ${skill.name}\n\n${skill.content}\n`;
    }

    // Output as system-reminder for Claude to process
    const output = `<system-reminder>
PAI CONTEXT (Auto-loaded at Session Start)

📅 CURRENT DATE/TIME: ${getLocalTimestamp()}

Loaded ${skills.length} skills: ${skillNames}

${skillsContent}

All skills are now active for this session. Use them when relevant.
</system-reminder>

✅ PAI Context loaded (${skills.length} skills)...`;

    // Output goes to stdout - Claude Code will see it
    console.log(output);

  } catch (error) {
    // Never crash - just skip
    console.error('Context loading error:', error);
  }

  process.exit(0);
}

main();
