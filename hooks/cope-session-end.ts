#!/usr/bin/env bun
// $PAI_DIR/hooks/cope-session-end.ts
// Stop hook: Prompt for day close and week review when appropriate

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';

interface StopPayload {
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

function isSubagentSession(): boolean {
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
}

function getLocalDate(): { date: string; dayOfWeek: number; hour: number } {
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  try {
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      dayOfWeek: localDate.getDay(),
      hour: localDate.getHours()
    };
  } catch {
    return {
      date: now.toISOString().split('T')[0],
      dayOfWeek: now.getDay(),
      hour: now.getHours()
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

    const payload: StopPayload = JSON.parse(stdinData);
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

    if (!existsSync(dailyPath) || !existsSync(weeklyPath)) {
      process.exit(0);
    }

    // Load state files
    const daily: DailyState = parse(readFileSync(dailyPath, 'utf-8'));
    const weekly: WeeklyState = parse(readFileSync(weeklyPath, 'utf-8'));

    const { dayOfWeek, hour } = getLocalDate();
    const prompts: string[] = [];

    // Week end review (Friday afternoon, not yet reviewed)
    if (dayOfWeek === 5 && hour >= 15 && !weekly.end_of_week.reviewed) {
      prompts.push(`🏁 **WEEK ${weekly.week_number} REVIEW**

It's Friday. Time to close out the week.

1. What got done? (wins)
2. What carries to next week?
3. What did you learn?
4. Rate the week (1-5)

Ask: "How did this week go?"`);
    }

    // Day close prompt (evening, not yet closed)
    if (hour >= 17 && !daily.day_closed) {
      prompts.push(`🌙 **DAY CLOSE**

Before you go:

1. Any decisions made today to log?
2. New open loops to capture?
3. Priority updates needed?
4. Anything unresolved that needs capture?

Say "done for the day" to mark complete.`);
    }

    // Update last_session timestamp
    daily.last_session = getTimestamp();
    writeFileSync(dailyPath, stringify(daily));

    // Output prompts if any
    if (prompts.length > 0) {
      const output = `<system-reminder>
C.O.P.E. SESSION END

${prompts.join('\n\n---\n\n')}
</system-reminder>`;

      console.log(output);
    }

  } catch (error) {
    // Never crash - just skip
    console.error('[COPE] Session end hook error:', error);
  }

  process.exit(0);
}

main();
