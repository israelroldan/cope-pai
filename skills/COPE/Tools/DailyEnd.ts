#!/usr/bin/env bun
// COPE Tool: DailyEnd
// Generate end-of-day review and mark day as closed

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';

interface DailyState {
  today: string;
  briefing_done: boolean;
  day_closed: boolean;
  sessions_today: number;
  last_session: string;
}

interface CopeState {
  priorities: Array<{ id: string; item: string; status: string; context?: string }>;
  open_loops: Array<{ id: string; item: string; waiting_for?: string }>;
  inbox: string[];
}

interface Decision {
  id: string;
  date: string;
  decision: string;
  rationale: string;
}

interface DecisionLog {
  decisions: Decision[];
}

function getDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getTimestamp(): string {
  return new Date().toISOString();
}

async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();
  const copeDir = join(cwd, '.cope');

  if (!existsSync(copeDir)) {
    console.error('No .cope directory found.');
    process.exit(1);
  }

  const dailyPath = join(copeDir, 'daily.yaml');
  const statePath = join(copeDir, 'state.yaml');
  const decisionsPath = join(copeDir, 'decisions.yaml');

  // Load state
  let daily: DailyState = existsSync(dailyPath)
    ? parse(readFileSync(dailyPath, 'utf-8'))
    : { today: getDate(), briefing_done: false, day_closed: false, sessions_today: 0, last_session: '' };

  const state: CopeState | null = existsSync(statePath)
    ? parse(readFileSync(statePath, 'utf-8'))
    : null;

  const decisionLog: DecisionLog | null = existsSync(decisionsPath)
    ? parse(readFileSync(decisionsPath, 'utf-8'))
    : null;

  // Check if marking done
  if (args[0] === 'done' || args[0] === '--done') {
    daily.day_closed = true;
    daily.briefing_done = true;
    daily.last_session = getTimestamp();
    writeFileSync(dailyPath, stringify(daily));
    console.log('Day marked as closed. See you tomorrow!');
    process.exit(0);
  }

  // Generate end-of-day review
  console.log('# End of Day Review\n');
  console.log(`📅 ${getDate()}\n`);

  // Today's decisions
  const todayDecisions = decisionLog?.decisions?.filter(d => d.date === getDate()) || [];
  if (todayDecisions.length) {
    console.log('## Decisions Made Today');
    todayDecisions.forEach(d => {
      console.log(`- ${d.decision}`);
      if (d.rationale) console.log(`  - Why: ${d.rationale}`);
    });
    console.log('');
  } else {
    console.log('## Decisions Made Today');
    console.log('_None logged. Any decisions worth capturing?_\n');
  }

  // Priority status
  if (state?.priorities?.length) {
    const completed = state.priorities.filter(p => p.status === 'done');
    const active = state.priorities.filter(p => p.status === 'active');
    const blocked = state.priorities.filter(p => p.status === 'blocked');

    if (completed.length) {
      console.log('## Completed');
      completed.forEach(p => console.log(`- ✓ ${p.item}`));
      console.log('');
    }

    if (blocked.length) {
      console.log('## Blocked');
      blocked.forEach(p => console.log(`- ⚠ ${p.item}`));
      console.log('');
    }

    if (active.length) {
      console.log('## Still Active');
      active.forEach(p => console.log(`- ${p.item}`));
      console.log('');
    }
  }

  // Open loops
  if (state?.open_loops?.length) {
    console.log('## Open Loops');
    state.open_loops.forEach(ol => {
      console.log(`- ${ol.item}${ol.waiting_for ? ` (waiting: ${ol.waiting_for})` : ''}`);
    });
    console.log('');
  }

  // Prompts
  console.log('---');
  console.log('**Before you go:**');
  console.log('- Any unlogged decisions?');
  console.log('- New open loops to capture?');
  console.log('- Anything unresolved that needs a note?');
  console.log('\n_Run `bun run DailyEnd.ts done` to close the day._');
}

main();
