#!/usr/bin/env bun
// $PAI_DIR/hooks/cope-session-start.ts
// SessionStart hook: Output date-based COPE prompts
// State lives in LifeOS (Notion) - queries happen via MCP during session

interface SessionStartPayload {
  session_id: string;
  cwd?: string;
  [key: string]: any;
}

function isSubagentSession(): boolean {
  return process.env.CLAUDE_CODE_AGENT !== undefined ||
         process.env.SUBAGENT === 'true';
}

function getLocalDate(): { date: string; dayOfWeek: number; hour: number; weekNumber: number } {
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  try {
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');

    // Calculate week number
    const startOfYear = new Date(localDate.getFullYear(), 0, 1);
    const days = Math.floor((localDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    return {
      date: `${year}-${month}-${day}`,
      dayOfWeek: localDate.getDay(), // 0 = Sunday, 1 = Monday, etc.
      hour: localDate.getHours(),
      weekNumber
    };
  } catch {
    return {
      date: now.toISOString().split('T')[0],
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

    const payload: SessionStartPayload = JSON.parse(stdinData);
    const { dayOfWeek, hour, weekNumber } = getLocalDate();
    const prompts: string[] = [];

    // Week start prompt (Monday morning)
    if (dayOfWeek === 1 && hour < 12) {
      prompts.push(`🗓️ **WEEK ${weekNumber} START**

It's Monday. Time to set the week's direction.

Say "briefing" to:
1. Review priorities and open loops from LifeOS
2. Set your top 3 for this week
3. Identify blockers and dependencies

Ask: "What would make this week a success?"`);
    }

    // Daily briefing prompt (morning)
    if (hour >= 6 && hour < 12) {
      prompts.push(`☀️ **DAILY BRIEFING**

Say "briefing" or "what's on today" to:
- Check school pickup/dropoff times
- See calendar events
- Review email and Slack digests
- Surface priorities and open loops from LifeOS

Ask: "What's the single most important thing today?"`);
    }

    // Mid-week check (Wednesday)
    if (dayOfWeek === 3 && hour >= 9 && hour < 17) {
      prompts.push(`📊 **MID-WEEK CHECK**

It's Wednesday. Time for a quick course correction.

Ask "mid-week check" to:
1. Review progress on top priorities
2. Identify emerging blockers
3. Adjust if needed`);
    }

    // Output prompts if any
    if (prompts.length > 0) {
      const output = `<system-reminder>
C.O.P.E. SESSION START

${prompts.join('\n\n---\n\n')}

---
*Say "briefing done" or "skip briefing" to dismiss.*
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
