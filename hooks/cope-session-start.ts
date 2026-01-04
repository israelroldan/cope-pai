#!/usr/bin/env bun
// $PAI_DIR/hooks/cope-session-start.ts
// SessionStart hook: Check COPE state and inject briefing prompts

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';

interface SessionStartPayload {
  session_id: string;
  cwd?: string;
  [key: string]: any;
}

interface DailyState {
  today: string;
  briefing_done: boolean;
  day_closed: boolean;
  sessions_today: number;
  last_session: string;
}

interface WeeklyState {
  week_of: string;
  week_number: number;
  focus: string;
  start_of_week: {
    reviewed: boolean;
    top_3: string[];
  };
  mid_week: {
    checked: boolean;
    adjustments: string[];
  };
  end_of_week: {
    reviewed: boolean;
    wins: string[];
    carries: string[];
    learnings: string[];
  };
}

interface CopeState {
  priorities: Array<{
    id: string;
    item: string;
    status: string;
    context?: string;
  }>;
  open_loops: Array<{
    id: string;
    item: string;
    waiting_for?: string;
  }>;
  inbox: string[];
}

function isSubagentSession(): boolean {
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
}

function getLocalDate(): { date: string; dayOfWeek: number; hour: number; weekMonday: string } {
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  try {
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    // Get Monday of current week
    const mondayDate = new Date(localDate);
    const dayOfWeek = mondayDate.getDay();
    const diff = mondayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    mondayDate.setDate(diff);
    const mondayYear = mondayDate.getFullYear();
    const mondayMonth = String(mondayDate.getMonth() + 1).padStart(2, '0');
    const mondayDay = String(mondayDate.getDate()).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      dayOfWeek: localDate.getDay(), // 0 = Sunday, 1 = Monday, etc.
      hour: localDate.getHours(),
      weekMonday: `${mondayYear}-${mondayMonth}-${mondayDay}`
    };
  } catch {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
      weekMonday: `${year}-${month}-${day}`
    };
  }
}

function getTimestamp(): string {
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  return now.toLocaleString('sv-SE', { timeZone: tz }).replace(' ', 'T') + '-08:00';
}

async function main() {
  try {
    // Skip for subagents
    if (isSubagentSession()) {
      process.exit(0);
    }

    const stdinData = await Bun.stdin.text();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const payload: SessionStartPayload = JSON.parse(stdinData);
    const cwd = payload.cwd;

    if (!cwd) {
      process.exit(0);
    }

    // Check for .cope directory in cwd
    const copeDir = join(cwd, '.cope');
    if (!existsSync(copeDir)) {
      process.exit(0);
    }

    const dailyPath = join(copeDir, 'daily.yaml');
    const weeklyPath = join(copeDir, 'weekly.yaml');
    const statePath = join(copeDir, 'state.yaml');

    if (!existsSync(dailyPath) || !existsSync(weeklyPath)) {
      process.exit(0);
    }

    // Load state files
    let daily: DailyState = parse(readFileSync(dailyPath, 'utf-8'));
    let weekly: WeeklyState = parse(readFileSync(weeklyPath, 'utf-8'));
    let state: CopeState | null = null;

    if (existsSync(statePath)) {
      state = parse(readFileSync(statePath, 'utf-8'));
    }

    const { date, dayOfWeek, hour, weekMonday } = getLocalDate();
    const prompts: string[] = [];

    // Reset daily state if new day
    if (daily.today !== date) {
      daily = {
        today: date,
        briefing_done: false,
        day_closed: false,
        sessions_today: 0,
        last_session: getTimestamp()
      };
    }

    // Reset weekly state if new week
    if (weekly.week_of !== weekMonday) {
      // Carry over unreviewed items
      const previousCarries = weekly.end_of_week?.carries || [];
      weekly = {
        week_of: weekMonday,
        week_number: weekly.week_number + 1,
        focus: '',
        start_of_week: { reviewed: false, top_3: [] },
        mid_week: { checked: false, adjustments: [] },
        end_of_week: { reviewed: false, wins: [], carries: previousCarries, learnings: [] }
      };
    }

    // Build prompts based on conditions

    // Week start prompt (Monday, not yet reviewed)
    if (dayOfWeek === 1 && !weekly.start_of_week.reviewed) {
      prompts.push(`🗓️ **WEEK ${weekly.week_number} START**

It's Monday. Time to set the week's direction.

1. Review any carries from last week
2. Set your top 3 priorities for this week
3. Identify known blockers or dependencies
4. Set a weekly focus statement

Ask: "What would make this week a success?"`);
    }

    // Daily briefing prompt (not yet done today)
    if (!daily.briefing_done) {
      let briefingContent = `☀️ **DAILY BRIEFING**\n\n`;

      if (state) {
        const activePriorities = state.priorities?.filter(p => p.status === 'active') || [];
        const openLoops = state.open_loops || [];
        const inbox = state.inbox || [];

        if (activePriorities.length > 0) {
          briefingContent += `**Current Priorities:**\n`;
          activePriorities.slice(0, 3).forEach((p, i) => {
            briefingContent += `${i + 1}. ${p.item}${p.context ? ` — ${p.context}` : ''}\n`;
          });
          briefingContent += '\n';
        }

        if (openLoops.length > 0) {
          briefingContent += `**Open Loops:**\n`;
          openLoops.forEach(ol => {
            briefingContent += `- ${ol.item}${ol.waiting_for ? ` (waiting: ${ol.waiting_for})` : ''}\n`;
          });
          briefingContent += '\n';
        }

        if (inbox.length > 0) {
          briefingContent += `**Inbox (unprocessed):**\n`;
          inbox.forEach(item => {
            briefingContent += `- ${item}\n`;
          });
          briefingContent += '\n';
        }
      }

      if (weekly.focus) {
        briefingContent += `**Week ${weekly.week_number} Focus:** ${weekly.focus}\n\n`;
      }

      briefingContent += `Ask: "What's the single most important thing today?"`;
      prompts.push(briefingContent);
    }

    // Mid-week check (Wednesday, not yet checked)
    if (dayOfWeek === 3 && !weekly.mid_week.checked) {
      prompts.push(`📊 **MID-WEEK CHECK**

It's Wednesday. Time for a quick course correction.

1. How is progress on your top 3?
2. Any blockers that emerged?
3. Does the week's focus still make sense?

Ask: "What needs adjusting?"`);
    }

    // Update state
    daily.sessions_today += 1;
    daily.last_session = getTimestamp();

    // Save updated state
    writeFileSync(dailyPath, stringify(daily));
    writeFileSync(weeklyPath, stringify(weekly));

    // Output prompts if any
    if (prompts.length > 0) {
      const output = `<system-reminder>
C.O.P.E. SESSION START

${prompts.join('\n\n---\n\n')}

---
*Say "briefing done" or "let's skip the briefing" to dismiss and mark complete.*
</system-reminder>`;

      console.log(output);
    }

  } catch (error) {
    // Never crash - just skip
    console.error('[COPE] Session start hook error:', error);
  }

  process.exit(0);
}

main();
