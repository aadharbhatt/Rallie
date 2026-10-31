import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { claimState, root, statePath } from './local-state.mjs';
import { migrationPlan } from './migrate.mjs';
import { recoveryPlan, runRecovery } from './recovery.mjs';

describe('local state and offline recovery guards', () => {
  it('rejects foreign namespace, claimed cross-environment state, symlink aliases and escapes', () => {
    mkdirSync(resolve(root, '.local'), { recursive: true });
    const directory = mkdtempSync(resolve(root, '.local/safety-test-'));
    try {
      claimState('test', directory);
      expect(() => statePath('dev', directory)).toThrow('another environment');
      expect(() => statePath('dev', `${directory}/child`)).toThrow('Nested');
      expect(() => statePath('test', `${directory}/child`)).toThrow('Nested');
      expect(() => migrationPlan(['apply', '--env', 'test', '--persist-to', '.local/state/dev'])).toThrow();
      expect(() => statePath('test', '/tmp/unsafe')).toThrow();
      symlinkSync(directory, `${directory}-alias`);
      expect(() => statePath('test', `${directory}-alias/child`)).toThrow('Symlink');
    } finally { rmSync(directory, { recursive: true, force: true }); rmSync(`${directory}-alias`, { force: true }); }
  });
  it('requires test environment, offline approval and verified recovery point before changing anything', () => {
    mkdirSync(resolve(root, '.local/backups'), { recursive: true });
    const directory = mkdtempSync(resolve(root, '.local/recovery-test-'));
    const snapshot = `${resolve(root, '.local/backups')}/${directory.split('/').pop()}`;
    const args = ['--env', 'test', '--persist-to', directory, '--snapshot', snapshot];
    try {
      claimState('test', directory);
      writeFileSync(resolve(directory, 'marker'), 'before');
      expect(() => recoveryPlan(['restore', ...args, '--confirm', 'RESTORE_STOPPED_LOCAL_TEST'])).toThrow('Missing/invalid');
      expect(() => recoveryPlan(['backup', ...args])).toThrow('Stop the target');
      expect(() => recoveryPlan(['restore', '--env', 'production'])).toThrow('test-only');
      runRecovery(['backup', ...args, '--confirm', 'STOPPED_LOCAL_TEST']);
      writeFileSync(resolve(directory, 'marker'), 'after');
      runRecovery(['restore', ...args, '--confirm', 'RESTORE_STOPPED_LOCAL_TEST']);
      expect(readFileSync(resolve(directory, 'marker'), 'utf8')).toBe('before');
      writeFileSync(resolve(snapshot, 'state/marker'), 'tampered');
      expect(() => recoveryPlan(['restore', ...args, '--confirm', 'RESTORE_STOPPED_LOCAL_TEST'])).toThrow('integrity');
      expect(readFileSync(resolve(directory, 'marker'), 'utf8')).toBe('before');
    } finally {
      rmSync(directory, { recursive: true, force: true }); rmSync(snapshot, { recursive: true, force: true });
      // Displaced copies are intentionally retained by real restores; clean test-owned copies only.
      for (const name of readdirSync(resolve(root, '.local'))) if (name.startsWith(`${directory.split('/').pop()}.before-restore-`)) rmSync(resolve(root, '.local', name), { recursive: true, force: true });
    }
  });
});