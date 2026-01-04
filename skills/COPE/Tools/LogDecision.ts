#!/usr/bin/env bun
// COPE Tool: LogDecision
// Append decisions with rationale to .cope/decisions.yaml

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';

interface Decision {
  id: string;
  date: string;
  decision: string;
  rationale: string;
  outcome: string;
  tags: string[];
}

interface DecisionLog {
  decisions: Decision[];
}

function getDate(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(decisions: Decision[]): string {
  const nums = decisions.map(d => parseInt(d.id.replace('d', '')) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `d${max + 1}`;
}

function loadDecisions(copeDir: string): DecisionLog {
  const path = join(copeDir, 'decisions.yaml');
  if (!existsSync(path)) {
    return { decisions: [] };
  }
  const content = parse(readFileSync(path, 'utf-8')) as DecisionLog;
  return content || { decisions: [] };
}

function saveDecisions(copeDir: string, log: DecisionLog): void {
  const path = join(copeDir, 'decisions.yaml');
  const header = '# C.O.P.E. Decision Log\n# Decisions with rationale for future reference\n\n';
  writeFileSync(path, header + stringify(log));
}

function printHelp(): void {
  console.log(`
COPE LogDecision Tool

Usage:
  bun run LogDecision.ts add "<decision>" --because "<rationale>" [--tags tag1,tag2]
  bun run LogDecision.ts update <id> --outcome <pending|validated|revised>
  bun run LogDecision.ts list [--limit N]
  bun run LogDecision.ts search <term>

Examples:
  bun run LogDecision.ts add "Use PostgreSQL over MongoDB" --because "Need ACID transactions" --tags database,architecture
  bun run LogDecision.ts update d1 --outcome validated
  bun run LogDecision.ts list --limit 10
  bun run LogDecision.ts search "database"
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();
  const copeDir = join(cwd, '.cope');

  if (!existsSync(copeDir)) {
    console.error('No .cope directory found. Initialize COPE first.');
    process.exit(1);
  }

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    printHelp();
    process.exit(0);
  }

  const log = loadDecisions(copeDir);
  const command = args[0];

  switch (command) {
    case 'add': {
      const decision = args[1];
      const becauseIdx = args.indexOf('--because');
      const rationale = becauseIdx > -1 ? args[becauseIdx + 1] : '';
      const tagsIdx = args.indexOf('--tags');
      const tags = tagsIdx > -1 ? args[tagsIdx + 1].split(',') : [];

      if (!decision) {
        console.error('Usage: add "<decision>" --because "<rationale>"');
        process.exit(1);
      }

      const entry: Decision = {
        id: generateId(log.decisions),
        date: getDate(),
        decision,
        rationale,
        outcome: 'pending',
        tags
      };

      log.decisions.push(entry);
      saveDecisions(copeDir, log);
      console.log(`Logged decision ${entry.id}: ${decision}`);
      break;
    }

    case 'update': {
      const id = args[1];
      const outcomeIdx = args.indexOf('--outcome');
      const outcome = outcomeIdx > -1 ? args[outcomeIdx + 1] : null;

      if (!id || !outcome) {
        console.error('Usage: update <id> --outcome <pending|validated|revised>');
        process.exit(1);
      }

      const decision = log.decisions.find(d => d.id === id);
      if (!decision) {
        console.error(`Decision ${id} not found`);
        process.exit(1);
      }

      decision.outcome = outcome;
      saveDecisions(copeDir, log);
      console.log(`Updated ${id} outcome to: ${outcome}`);
      break;
    }

    case 'list': {
      const limitIdx = args.indexOf('--limit');
      const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : 10;

      console.log('# Recent Decisions\n');
      
      if (log.decisions.length === 0) {
        console.log('No decisions logged yet.');
      } else {
        log.decisions.slice(-limit).reverse().forEach(d => {
          console.log(`## [${d.id}] ${d.decision}`);
          console.log(`- Date: ${d.date}`);
          console.log(`- Rationale: ${d.rationale || '(none)'}`);
          console.log(`- Outcome: ${d.outcome}`);
          if (d.tags.length) console.log(`- Tags: ${d.tags.join(', ')}`);
          console.log('');
        });
      }
      break;
    }

    case 'search': {
      const term = args[1]?.toLowerCase();
      if (!term) {
        console.error('Usage: search <term>');
        process.exit(1);
      }

      const matches = log.decisions.filter(d =>
        d.decision.toLowerCase().includes(term) ||
        d.rationale.toLowerCase().includes(term) ||
        d.tags.some(t => t.toLowerCase().includes(term))
      );

      console.log(`# Decisions matching "${term}"\n`);
      
      if (matches.length === 0) {
        console.log('No matches found.');
      } else {
        matches.forEach(d => {
          console.log(`- [${d.id}] ${d.decision} (${d.date})`);
        });
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
