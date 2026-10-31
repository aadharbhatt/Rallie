import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';
import { gateEnvironment, gateSteps, runGate, skippedIntegrations } from './foundation-gate.mjs';
import { reportSecrets, scanSecrets, secretRules } from './check-secrets.mjs';
import { root } from './local-state.mjs';

describe('foundation gate negative controls', () => {
  it('has no opt-out, remote operation, or credential-bearing local execution', () => {
    const execute = vi.fn();
    expect(() => runGate(['--skip-browser'], execute, {})).toThrow();
    expect(() => runGate([], execute, { CLOUDFLARE_API_TOKEN: 'synthetic-only' })).toThrow();
    expect(execute).not.toHaveBeenCalled();
    expect(gateEnvironment({ RALLIE_MOCK_TALLY: 'true' })).toMatchObject({ RALLIE_MOCK_TALLY: 'false', RALLIE_MOCK_EXTRACTION: 'false', CI: 'true' });
    expect(gateSteps()[0][1][0]).toBe('ci');
    expect(gateSteps().at(-1)[1]).toEqual(['run', 'test:runtime', '--', '--browser']);
    expect(skippedIntegrations).toHaveLength(3);
  });
  it('stops at the first failed check and records failed rather than skipped success', () => {
    mkdirSync(resolve(root, '.local'), { recursive: true });
    const directory = mkdtempSync(resolve(root, '.local/gate-negative-'));
    const execute = vi.fn(() => ({ status: 1 }));
    try {
      expect(() => runGate([], execute, {}, directory)).toThrow('lockfile install');
      expect(execute).toHaveBeenCalledTimes(1);
      const summary = JSON.parse(readFileSync(resolve(directory, '.local/foundation-gate/summary.json'), 'utf8'));
      expect(summary.status).toBe('failed');
      expect(summary.checks).toEqual([{ name: 'lockfile install', status: 'failed' }]);
      expect(summary.liveIntegrations.every((item) => item.status === 'skipped')).toBe(true);
      expect(summary.deploymentAttempted).toBe(false);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
  it('rejects a synthetic secret fixture without exposing its matched value', () => {
    mkdirSync(resolve(root, '.local'), { recursive: true });
    const directory = mkdtempSync(resolve(root, '.local/secret-negative-'));
    // Construct, never embed or use a real provider credential.
    const sentinel = ['ghp', '_', 'S'.repeat(36)].join('');
    try {
      writeFileSync(resolve(directory, 'fixture.txt'), `\0${sentinel}`);
      const violations = scanSecrets(directory);
      expect(violations).toContainEqual({ file: 'fixture.txt', rule: 'github-token' });
      const log = vi.fn();
      expect(reportSecrets(violations, log)).toBe(1);
      expect(JSON.stringify(log.mock.calls)).not.toContain(sentinel);
      expect(secretRules(`CLOUDFLARE_API_TOKEN=${'a'.repeat(40)}`)).toContain('provider-token-assignment');
      expect(secretRules(JSON.stringify({ CLOUDFLARE_API_TOKEN: 'a'.repeat(40) }))).toContain('provider-token-assignment');
      expect(secretRules('CLOUDFLARE_API_TOKEN=synthetic-not-a-token')).toEqual([]);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
  it('fails an actual TypeScript check for a deliberately incompatible health contract', () => {
    mkdirSync(resolve(root, '.local'), { recursive: true });
    const directory = mkdtempSync(resolve(root, '.local/contract-negative-'));
    try {
      const file = resolve(directory, 'invalid.ts');
      writeFileSync(file, "import type { HealthResponse } from '../../packages/api-contracts/src/index';\nconst environment: HealthResponse['runtime']['environment'] = 'not-a-runtime';\nvoid environment;\n");
      const result = spawnSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--module', 'esnext', '--moduleResolution', 'bundler', '--target', 'es2022', file], { cwd: root, encoding: 'utf8' });
      expect(result.status).not.toBe(0);
      expect(result.stdout).toContain('TS2322');
      expect(result.stdout).toContain('not-a-runtime');
      expect(result.stdout).not.toContain('TS2307');
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
});

describe('untrusted GitHub Actions configuration', () => {
  it('has read-only PR checks with pinned actions, no deployment credentials, and always-uploaded test-only artifacts', () => {
    const text = readFileSync(resolve(root, '.github/workflows/foundation.yml'), 'utf8');
    const workflow = parse(text);
    expect(workflow.on).toHaveProperty('pull_request');
    expect(workflow.on).not.toHaveProperty('pull_request_target');
    expect(workflow.permissions).toEqual({ contents: 'read' });
    expect(text).not.toMatch(/secrets\.|secrets:|id-token:|--remote|wrangler deploy/);
    const job = workflow.jobs.foundation;
    expect(job.environment).toBeUndefined();
    expect(job['timeout-minutes']).toBe(30);
    for (const step of job.steps.filter((step) => step.uses)) expect(step.uses).toMatch(/@[a-f0-9]{40}$/);
    expect(job.steps.find((step) => step.uses?.startsWith('actions/checkout@')).with['persist-credentials']).toBe(false);
    expect(job.steps.find((step) => step.name === 'Verify the complete local foundation').run).toBe('npm run verify:foundation');
    const artifact = job.steps.find((step) => step.uses?.startsWith('actions/upload-artifact@'));
    expect(artifact.if).toBe('always()');
    expect(artifact.with.path).toContain('.local/foundation-gate/summary.json');
    expect(artifact.with.path).not.toContain('state');
    expect(artifact.with['retention-days']).toBe(7);
    expect(artifact.with['include-hidden-files']).toBe(true);
    expect(job.steps.at(-1).run).toContain('SKIPPED');
  });
});