#!/usr/bin/env bun
// COPE Tool: GetContext
// Reads current state from .cope/ directory and returns formatted context

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

interface CopeState {
  updated: string;
  priorities: Array<{
    id: string;
    item: string;
    status: string;
    context?: string;
    created: string;
  }>;
  open_loops: Array<{
    id: string;
    item: string;
    waiting_for?: string;
    created: string;
  }>;
  inbox: string[];
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
  start_of_week: { reviewed: boolean; top_3: string[] };
  mid_week: { checked: boolean; adjustments: string[] };
  end_of_week: { reviewed: boolean; wins: string[]; carries: string[]; learnings: string[] };
}

interface DecisionLog {
  decisions: Array<{
    id: string;
    date: string;
    decision: string;
    rationale: string;
    outcome: string;
    tags: string[];
  }>;
}

function loadYaml<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function formatContext(copeDir: string): string {
  const state = loadYaml<CopeState>(join(copeDir, 'state.yaml'));
  const daily = loadYaml<DailyState>(join(copeDir, 'daily.yaml'));
  const weekly = loadYaml<WeeklyState>(join(copeDir, 'weekly.yaml'));
  const decisions = loadYaml<DecisionLog>(join(copeDir, 'decisions.yaml'));

  const lines: string[] = ['# COPE Context\n'];

  // Weekly focus
  if (weekly?.focus) {
    lines.push(`**Week ${weekly.week_number} Focus:** ${weekly.focus}\n`);
  }

  // Priorities
  if (state?.priorities?.length) {
    lines.push('## Priorities');
    state.priorities.forEach((p, i) => {
      const status = p.status === 'active' ? '' : ` [${p.status}]`;
      lines.push(`${i + 1}. ${p.item}${status}${p.context ? ` — ${p.context}` : ''}`);
    });
    lines.push('');
  }

  // Open loops
  if (state?.open_loops?.length) {
    lines.push('## Open Loops');
    state.open_loops.forEach(ol => {
      lines.push(`- ${ol.item}${ol.waiting_for ? ` (waiting: ${ol.waiting_for})` : ''}`);
    });
    lines.push('');
  }

  // Inbox
  if (state?.inbox?.length) {
    lines.push('## Inbox (unprocessed)');
    state.inbox.forEach(item => {
      lines.push(`- ${item}`);
    });
    lines.push('');
  }

  // Weekly top 3
  if (weekly?.start_of_week?.top_3?.length) {
    lines.push('## Week Top 3');
    weekly.start_of_week.top_3.forEach((item, i) => {
      lines.push(`${i + 1}. ${item}`);
    });
    lines.push('');
  }

  // Recent decisions (last 5)
  if (decisions?.decisions?.length) {
    lines.push('## Recent Decisions');
    decisions.decisions.slice(-5).reverse().forEach(d => {
      lines.push(`- **${d.date}:** ${d.decision}`);
      if (d.rationale) lines.push(`  - Rationale: ${d.rationale}`);
    });
    lines.push('');
  }

  // Daily state
  if (daily) {
    lines.push('## Today');
    lines.push(`- Date: ${daily.today}`);
    lines.push(`- Briefing done: ${daily.briefing_done ? 'Yes' : 'No'}`);
    lines.push(`- Day closed: ${daily.day_closed ? 'Yes' : 'No'}`);
    lines.push(`- Sessions: ${daily.sessions_today}`);
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const cwd = process.cwd();
  const copeDir = join(cwd, '.cope');

  if (!existsSync(copeDir)) {
    console.log('No .cope directory found in current project.');
    process.exit(0);
  }

  console.log(formatContext(copeDir));
}

main();
