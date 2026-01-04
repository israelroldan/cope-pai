#!/usr/bin/env bun
// COPE Tool: WeeklyReview
// Manage weekly rhythm - start, mid-week check, and end-of-week review

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';

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
  priorities: Array<{ id: string; item: string; status: string }>;
}

function getWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function printHelp(): void {
  console.log(`
COPE WeeklyReview Tool

Usage:
  bun run WeeklyReview.ts start                    Show week start prompts
  bun run WeeklyReview.ts start --done             Mark week start as reviewed
  bun run WeeklyReview.ts set-focus "<focus>"      Set weekly focus
  bun run WeeklyReview.ts set-top3 "a" "b" "c"     Set top 3 priorities
  
  bun run WeeklyReview.ts mid                      Show mid-week check
  bun run WeeklyReview.ts mid --done               Mark mid-week as checked
  bun run WeeklyReview.ts adjust "<adjustment>"    Log mid-week adjustment
  
  bun run WeeklyReview.ts end                      Show week-end review
  bun run WeeklyReview.ts end --done               Mark week as reviewed
  bun run WeeklyReview.ts win "<win>"              Log a win
  bun run WeeklyReview.ts carry "<item>"           Log item to carry forward
  bun run WeeklyReview.ts learning "<learning>"    Log a learning
  
  bun run WeeklyReview.ts status                   Show current week status
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();
  const copeDir = join(cwd, '.cope');

  if (!existsSync(copeDir)) {
    console.error('No .cope directory found.');
    process.exit(1);
  }

  const weeklyPath = join(copeDir, 'weekly.yaml');
  const statePath = join(copeDir, 'state.yaml');

  let weekly: WeeklyState = existsSync(weeklyPath)
    ? parse(readFileSync(weeklyPath, 'utf-8'))
    : {
        week_of: getWeekMonday(),
        week_number: 1,
        focus: '',
        start_of_week: { reviewed: false, top_3: [] },
        mid_week: { checked: false, adjustments: [] },
        end_of_week: { reviewed: false, wins: [], carries: [], learnings: [] }
      };

  const state: CopeState | null = existsSync(statePath)
    ? parse(readFileSync(statePath, 'utf-8'))
    : null;

  if (args.length === 0 || args[0] === 'help') {
    printHelp();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'start': {
      if (args[1] === '--done') {
        weekly.start_of_week.reviewed = true;
        writeFileSync(weeklyPath, stringify(weekly));
        console.log('Week start marked as reviewed.');
        break;
      }

      console.log(`# Week ${weekly.week_number} Start\n`);
      console.log(`Week of: ${weekly.week_of}\n`);

      if (weekly.end_of_week.carries.length) {
        console.log('## Carries from Last Week');
        weekly.end_of_week.carries.forEach(c => console.log(`- ${c}`));
        console.log('');
      }

      if (state?.priorities?.length) {
        console.log('## Current Priorities');
        state.priorities.filter(p => p.status === 'active').forEach(p => {
          console.log(`- ${p.item}`);
        });
        console.log('');
      }

      console.log('---');
      console.log('**Set your week:**');
      console.log('1. What are your top 3 priorities this week?');
      console.log('2. What\'s the weekly focus (one sentence)?');
      console.log('3. Any known blockers?\n');
      console.log('_Use `set-focus` and `set-top3` to record, then `start --done` to complete._');
      break;
    }

    case 'set-focus': {
      const focus = args[1];
      if (!focus) {
        console.error('Usage: set-focus "<focus statement>"');
        process.exit(1);
      }
      weekly.focus = focus;
      writeFileSync(weeklyPath, stringify(weekly));
      console.log(`Week focus set: ${focus}`);
      break;
    }

    case 'set-top3': {
      const top3 = args.slice(1, 4);
      if (top3.length === 0) {
        console.error('Usage: set-top3 "priority 1" "priority 2" "priority 3"');
        process.exit(1);
      }
      weekly.start_of_week.top_3 = top3;
      writeFileSync(weeklyPath, stringify(weekly));
      console.log('Week top 3 set:');
      top3.forEach((t, i) => console.log(`${i + 1}. ${t}`));
      break;
    }

    case 'mid': {
      if (args[1] === '--done') {
        weekly.mid_week.checked = true;
        writeFileSync(weeklyPath, stringify(weekly));
        console.log('Mid-week check marked as done.');
        break;
      }

      console.log(`# Week ${weekly.week_number} Mid-Week Check\n`);

      if (weekly.focus) {
        console.log(`**Focus:** ${weekly.focus}\n`);
      }

      if (weekly.start_of_week.top_3.length) {
        console.log('## Top 3 Progress');
        weekly.start_of_week.top_3.forEach((t, i) => {
          console.log(`${i + 1}. ${t}`);
        });
        console.log('');
      }

      if (weekly.mid_week.adjustments.length) {
        console.log('## Adjustments Made');
        weekly.mid_week.adjustments.forEach(a => console.log(`- ${a}`));
        console.log('');
      }

      console.log('---');
      console.log('**Check in:**');
      console.log('1. How is progress on the top 3?');
      console.log('2. Any blockers emerged?');
      console.log('3. Does the focus still make sense?');
      console.log('\n_Use `adjust` to log changes, then `mid --done` to complete._');
      break;
    }

    case 'adjust': {
      const adjustment = args[1];
      if (!adjustment) {
        console.error('Usage: adjust "<adjustment>"');
        process.exit(1);
      }
      weekly.mid_week.adjustments.push(adjustment);
      writeFileSync(weeklyPath, stringify(weekly));
      console.log(`Logged adjustment: ${adjustment}`);
      break;
    }

    case 'end': {
      if (args[1] === '--done') {
        weekly.end_of_week.reviewed = true;
        writeFileSync(weeklyPath, stringify(weekly));
        console.log('Week review marked as complete.');
        break;
      }

      console.log(`# Week ${weekly.week_number} Review\n`);

      if (weekly.focus) {
        console.log(`**Focus was:** ${weekly.focus}\n`);
      }

      if (weekly.start_of_week.top_3.length) {
        console.log('## Top 3 Goals');
        weekly.start_of_week.top_3.forEach((t, i) => console.log(`${i + 1}. ${t}`));
        console.log('');
      }

      if (weekly.end_of_week.wins.length) {
        console.log('## Wins');
        weekly.end_of_week.wins.forEach(w => console.log(`- ✓ ${w}`));
        console.log('');
      }

      if (weekly.end_of_week.carries.length) {
        console.log('## Carries');
        weekly.end_of_week.carries.forEach(c => console.log(`- → ${c}`));
        console.log('');
      }

      if (weekly.end_of_week.learnings.length) {
        console.log('## Learnings');
        weekly.end_of_week.learnings.forEach(l => console.log(`- ${l}`));
        console.log('');
      }

      console.log('---');
      console.log('**Reflect:**');
      console.log('1. What got done? (wins)');
      console.log('2. What carries to next week?');
      console.log('3. What did you learn?');
      console.log('4. Rate the week (1-5)?');
      console.log('\n_Use `win`, `carry`, `learning` to record, then `end --done` to complete._');
      break;
    }

    case 'win': {
      const win = args[1];
      if (!win) {
        console.error('Usage: win "<win>"');
        process.exit(1);
      }
      weekly.end_of_week.wins.push(win);
      writeFileSync(weeklyPath, stringify(weekly));
      console.log(`Logged win: ${win}`);
      break;
    }

    case 'carry': {
      const carry = args[1];
      if (!carry) {
        console.error('Usage: carry "<item>"');
        process.exit(1);
      }
      weekly.end_of_week.carries.push(carry);
      writeFileSync(weeklyPath, stringify(weekly));
      console.log(`Logged carry: ${carry}`);
      break;
    }

    case 'learning': {
      const learning = args[1];
      if (!learning) {
        console.error('Usage: learning "<learning>"');
        process.exit(1);
      }
      weekly.end_of_week.learnings.push(learning);
      writeFileSync(weeklyPath, stringify(weekly));
      console.log(`Logged learning: ${learning}`);
      break;
    }

    case 'status': {
      console.log(`# Week ${weekly.week_number} Status\n`);
      console.log(`Week of: ${weekly.week_of}`);
      console.log(`Focus: ${weekly.focus || '(not set)'}`);
      console.log(`\nStart reviewed: ${weekly.start_of_week.reviewed ? 'Yes' : 'No'}`);
      console.log(`Mid-week checked: ${weekly.mid_week.checked ? 'Yes' : 'No'}`);
      console.log(`End reviewed: ${weekly.end_of_week.reviewed ? 'Yes' : 'No'}`);

      if (weekly.start_of_week.top_3.length) {
        console.log('\nTop 3:');
        weekly.start_of_week.top_3.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main();
