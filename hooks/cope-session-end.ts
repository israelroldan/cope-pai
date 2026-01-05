#!/usr/bin/env bun
// $PAI_DIR/hooks/cope-session-end.ts
// Stop hook: Prompt for day close and week review when appropriate
// State lives in LifeOS (Notion) - queries happen via MCP during session

interface StopPayload {
  session_id: string;
  cwd?: string;
  [key: string]: any;
}

function isSubagentSession(): boolean {
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
}

function getLocalDate(): { dayOfWeek: number; hour: number; weekNumber: number } {
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  try {
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));

    // Calculate week number
    const startOfYear = new Date(localDate.getFullYear(), 0, 1);
    const days = Math.floor((localDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    return {
      dayOfWeek: localDate.getDay(),
      hour: localDate.getHours(),
      weekNumber
    };
  } catch {
    return {
      dayOfWeek: now.getDay(),
      hour: now.getHours(),
      weekNumber: 1
    };
  }
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

    const { dayOfWeek, hour, weekNumber } = getLocalDate();
    const prompts: string[] = [];

    // Week end review (Friday afternoon)
    if (dayOfWeek === 5 && hour >= 15) {
      prompts.push(`🏁 **WEEK ${weekNumber} REVIEW**

It's Friday. Time to close out the week.

Say "weekly review" to:
1. Capture wins (what got done)
2. Identify carries (moves to next week)
3. Extract learnings
4. Create weekly review in LifeOS Journal

Ask: "How did this week go?"`);
    }

    // Day close prompt (evening)
    if (hour >= 17) {
      prompts.push(`🌙 **DAY CLOSE**

Before you go, say "done for the day" to:
1. Log any decisions made today
2. Capture new open loops
3. Update priority status
4. Create day close entry in LifeOS Journal

Or just close the session if nothing to capture.`);
    }

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
