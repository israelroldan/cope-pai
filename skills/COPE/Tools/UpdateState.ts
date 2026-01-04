#!/usr/bin/env bun
// COPE Tool: UpdateState
// Modify priorities, open loops, and inbox in .cope/state.yaml

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, stringify } from 'yaml';

interface Priority {
  id: string;
  item: string;
  status: string;
  context?: string;
  created: string;
}

interface OpenLoop {
  id: string;
  item: string;
  waiting_for?: string;
  created: string;
}

interface CopeState {
  updated: string;
  priorities: Priority[];
  open_loops: OpenLoop[];
  inbox: string[];
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

function getDate(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(prefix: string, items: Array<{ id: string }>): string {
  const nums = items.map(i => parseInt(i.id.replace(prefix, '')) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}${max + 1}`;
}

function loadState(copeDir: string): CopeState {
  const path = join(copeDir, 'state.yaml');
  if (!existsSync(path)) {
    return {
      updated: getTimestamp(),
      priorities: [],
      open_loops: [],
      inbox: []
    };
  }
  return parse(readFileSync(path, 'utf-8')) as CopeState;
}

function saveState(copeDir: string, state: CopeState): void {
  state.updated = getTimestamp();
  const path = join(copeDir, 'state.yaml');
  const header = '# C.O.P.E. State - Active Items\n# Updated by COPE tools, tracked in git\n\n';
  writeFileSync(path, header + stringify(state));
}

function printHelp(): void {
  console.log(`
COPE UpdateState Tool

Usage:
  bun run UpdateState.ts <command> [args...]

Commands:
  add-priority <item> [--context "..."]     Add a new priority
  update-priority <id> --status <status>    Update priority status (active|blocked|waiting|done)
  remove-priority <id>                      Remove a priority
  
  add-loop <item> [--waiting "..."]         Add an open loop
  close-loop <id>                           Remove an open loop
  
  add-inbox <item>                          Add to inbox
  clear-inbox <item>                        Remove from inbox
  
  list                                      Show current state

Examples:
  bun run UpdateState.ts add-priority "Ship feature X" --context "Q1 goal"
  bun run UpdateState.ts update-priority p1 --status done
  bun run UpdateState.ts add-loop "API contract" --waiting "Backend team"
  bun run UpdateState.ts add-inbox "Review competitor pricing"
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

  const state = loadState(copeDir);
  const command = args[0];

  switch (command) {
    case 'add-priority': {
      const item = args[1];
      if (!item) {
        console.error('Usage: add-priority <item> [--context "..."]');
        process.exit(1);
      }
      const contextIdx = args.indexOf('--context');
      const context = contextIdx > -1 ? args[contextIdx + 1] : undefined;
      
      const priority: Priority = {
        id: generateId('p', state.priorities),
        item,
        status: 'active',
        context,
        created: getDate()
      };
      state.priorities.push(priority);
      saveState(copeDir, state);
      console.log(`Added priority ${priority.id}: ${item}`);
      break;
    }

    case 'update-priority': {
      const id = args[1];
      const statusIdx = args.indexOf('--status');
      const status = statusIdx > -1 ? args[statusIdx + 1] : null;
      
      if (!id || !status) {
        console.error('Usage: update-priority <id> --status <active|blocked|waiting|done>');
        process.exit(1);
      }
      
      const priority = state.priorities.find(p => p.id === id);
      if (!priority) {
        console.error(`Priority ${id} not found`);
        process.exit(1);
      }
      
      priority.status = status;
      saveState(copeDir, state);
      console.log(`Updated ${id} status to: ${status}`);
      break;
    }

    case 'remove-priority': {
      const id = args[1];
      if (!id) {
        console.error('Usage: remove-priority <id>');
        process.exit(1);
      }
      
      const idx = state.priorities.findIndex(p => p.id === id);
      if (idx === -1) {
        console.error(`Priority ${id} not found`);
        process.exit(1);
      }
      
      state.priorities.splice(idx, 1);
      saveState(copeDir, state);
      console.log(`Removed priority ${id}`);
      break;
    }

    case 'add-loop': {
      const item = args[1];
      if (!item) {
        console.error('Usage: add-loop <item> [--waiting "..."]');
        process.exit(1);
      }
      
      const waitingIdx = args.indexOf('--waiting');
      const waiting_for = waitingIdx > -1 ? args[waitingIdx + 1] : undefined;
      
      const loop: OpenLoop = {
        id: generateId('ol', state.open_loops),
        item,
        waiting_for,
        created: getDate()
      };
      state.open_loops.push(loop);
      saveState(copeDir, state);
      console.log(`Added open loop ${loop.id}: ${item}`);
      break;
    }

    case 'close-loop': {
      const id = args[1];
      if (!id) {
        console.error('Usage: close-loop <id>');
        process.exit(1);
      }
      
      const idx = state.open_loops.findIndex(ol => ol.id === id);
      if (idx === -1) {
        console.error(`Open loop ${id} not found`);
        process.exit(1);
      }
      
      state.open_loops.splice(idx, 1);
      saveState(copeDir, state);
      console.log(`Closed loop ${id}`);
      break;
    }

    case 'add-inbox': {
      const item = args[1];
      if (!item) {
        console.error('Usage: add-inbox <item>');
        process.exit(1);
      }
      
      state.inbox.push(item);
      saveState(copeDir, state);
      console.log(`Added to inbox: ${item}`);
      break;
    }

    case 'clear-inbox': {
      const item = args[1];
      if (!item) {
        console.error('Usage: clear-inbox <item>');
        process.exit(1);
      }
      
      const idx = state.inbox.indexOf(item);
      if (idx === -1) {
        console.error('Item not found in inbox');
        process.exit(1);
      }
      
      state.inbox.splice(idx, 1);
      saveState(copeDir, state);
      console.log(`Removed from inbox: ${item}`);
      break;
    }

    case 'list': {
      console.log('# Current State\n');
      
      console.log('## Priorities');
      if (state.priorities.length === 0) {
        console.log('(none)');
      } else {
        state.priorities.forEach(p => {
          console.log(`- [${p.id}] ${p.item} (${p.status})`);
        });
      }
      
      console.log('\n## Open Loops');
      if (state.open_loops.length === 0) {
        console.log('(none)');
      } else {
        state.open_loops.forEach(ol => {
          console.log(`- [${ol.id}] ${ol.item}${ol.waiting_for ? ` (waiting: ${ol.waiting_for})` : ''}`);
        });
      }
      
      console.log('\n## Inbox');
      if (state.inbox.length === 0) {
        console.log('(none)');
      } else {
        state.inbox.forEach(item => {
          console.log(`- ${item}`);
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
