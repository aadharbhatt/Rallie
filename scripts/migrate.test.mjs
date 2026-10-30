import { describe, expect, it, vi } from 'vitest';
import { migrationPlan, runMigrations } from './migrate.mjs';

describe('migration environment safety', () => {
  it.each([
    ['apply'], ['apply', '--env', 'production'], ['apply', '--env', 'staging'],
    ['reset', '--env', 'production'], ['seed', '--env', 'production'],
    ['apply', '--env', 'dev', '--remote', 'true'], ['apply', '--env', 'dev', '--persist-to', '/tmp/unsafe'],
    ['apply', '--env', 'test', '--env', 'dev'],
  ])('refuses unsafe arguments before starting any command: %j', (...args) => {
    const execute = vi.fn();
    expect(() => runMigrations(args, execute)).toThrow();
    expect(execute).not.toHaveBeenCalled();
  });
  it('always pins apply and version reporting to the selected local emulator', () => {
    const plan = migrationPlan(['apply', '--env', 'test']);
    expect(plan.commands).toHaveLength(3);
    expect(plan.commands[0]).toContain('apply');
    expect(plan.commands[1]).toContain('list');
    expect(plan.commands[2]).toContain('SELECT name, applied_at FROM d1_migrations ORDER BY id');
    for (const args of plan.commands) {
      expect(args).toContain('--local');
      expect(args).not.toContain('--remote');
      expect(args[args.indexOf('--env') + 1]).toBe('test');
    }
  });
});