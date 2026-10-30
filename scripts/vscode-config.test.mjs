import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { runtimePlan } from './local-runtime.mjs';

const tasks = JSON.parse(readFileSync(new URL('../.vscode/tasks.json', import.meta.url), 'utf8'));
const launch = JSON.parse(readFileSync(new URL('../.vscode/launch.json', import.meta.url), 'utf8'));

describe('VS Code Docker run entries', () => {
  it('pins shell-free tasks to this workspace and the fixed local project', () => {
    expect(tasks.options.cwd).toBe('${workspaceFolder}');
    expect(tasks.options.env).toEqual({ RALLIE_MOCK_EXTRACTION: 'false', RALLIE_MOCK_TALLY: 'false' });
    for (const task of tasks.tasks) {
      expect(task.type).toBe('process');
      expect(['node', 'docker']).toContain(task.command);
      if (task.command === 'docker') {
        expect(task.args).toContain('rallie-local-dev');
        expect(task.args).not.toContain('--volumes');
      } else {
        expect(task.args[0]).toBe('${workspaceFolder}/scripts/local-runtime.mjs');
      }
    }
  });
  it('maps normal launch entries to guarded local commands, not a deployment', () => {
    for (const entry of launch.configurations) {
      expect(entry.type).toBe('node');
      expect(entry.request).toBe('launch');
      expect(entry.program).toBe('${workspaceFolder}/scripts/local-runtime.mjs');
      expect(entry.cwd).toBe('${workspaceFolder}');
      if (entry.args[0] !== 'reset') expect(() => runtimePlan(entry.args)).not.toThrow();
    }
    expect(launch.configurations[0].env).toEqual({ RALLIE_MOCK_EXTRACTION: 'false', RALLIE_MOCK_TALLY: 'false' });
  });
  it('requires explicit cancellation-safe local test reset in both menus', () => {
    for (const config of [tasks, launch]) {
      const entries = config.tasks ?? config.configurations;
      const entry = entries.find((entry) => entry.args.includes('reset'));
      const args = entry.command === 'node' ? entry.args.slice(1) : entry.args;
      expect(args).toEqual(['reset', '--env', 'test', '--confirm', '${input:resetTestConfirmation}']);
      const prompt = config.inputs.find(({ id }) => id === 'resetTestConfirmation');
      expect(prompt.default).toBe('CANCEL');
      expect(() => runtimePlan(args.map((arg) => arg === '${input:resetTestConfirmation}' ? prompt.default : arg))).toThrow();
      expect(() => runtimePlan(args.map((arg) => arg === '${input:resetTestConfirmation}' ? 'DELETE_LOCAL_TEST' : arg))).not.toThrow();
    }
  });
});