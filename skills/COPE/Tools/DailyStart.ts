#!/usr/bin/env bun
// COPE Tool: DailyStart
// Generate morning briefing and mark briefing as done

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

interface WeeklyState {
  week_number: number;
  focus: string;
  start_of_week: { top_3: string[] };
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
  const weeklyPath = join(copeDir, 'weekly.yaml');

  // Load state
  let daily: DailyState = existsSync(dailyPath)
    ? parse(readFileSync(dailyPath, 'utf-8'))
    : { today: getDate(), briefing_done: false, day_closed: false, sessions_today: 0, last_session: '' };

  const state: CopeState | null = existsSync(statePath)
    ? parse(readFileSync(statePath, 'utf-8'))
    : null;

  const weekly: WeeklyState | null = existsSync(weeklyPath)
    ? parse(readFileSync(weeklyPath, 'utf-8'))
    : null;

  // Check if marking done
  if (args[0] === 'done' || args[0] === '--done') {
    daily.briefing_done = true;
    daily.last_session = getTimestamp();
    writeFileSync(dailyPath, stringify(daily));
    console.log('Briefing marked as done. No more prompts until tomorrow.');
    process.exit(0);
  }

  // Generate briefing
  console.log('# Daily Briefing\n');
  console.log(`📅 ${getDate()}\n`);

  if (weekly?.focus) {
    console.log(`**Week ${weekly.week_number} Focus:** ${weekly.focus}\n`);
  }

  // Priorities
  if (state?.priorities?.length) {
    const active = state.priorities.filter(p => p.status === 'active');
    if (active.length) {
      console.log('## Top Priorities');
      active.slice(0, 3).forEach((p, i) => {
        console.log(`${i + 1}. ${p.item}${p.context ? ` — ${p.context}` : ''}`);
      });
      console.log('');
    }

    const blocked = state.priorities.filter(p => p.status === 'blocked');
    if (blocked.length) {
      console.log('## Blocked');
      blocked.forEach(p => {
        console.log(`- ${p.item}`);
      });
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

  // Inbox
  if (state?.inbox?.length) {
    console.log('## Inbox (needs processing)');
    state.inbox.forEach(item => {
      console.log(`- ${item}`);
    });
    console.log('');
  }

  // Week top 3
  if (weekly?.start_of_week?.top_3?.length) {
    console.log('## Week Goals');
    weekly.start_of_week.top_3.forEach((item, i) => {
      console.log(`${i + 1}. ${item}`);
    });
    console.log('');
  }

  console.log('---');
  console.log('**What\'s the single most important thing today?**');
  console.log('\n_Run `bun run DailyStart.ts done` to mark briefing complete._');
}

main();
