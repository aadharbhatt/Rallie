import { describe, expect, it } from 'vitest';
import { healthSchema } from './index';

const healthy = {
  service: 'rallie-api', stage: 'foundation', status: 'ok', checkedAt: '2026-10-28T12:00:00.000Z',
  database: { status: 'ok', probe: 'SELECT 1' },
  bindings: { documents: 'configured', assets: 'configured', ingestionWorkflow: 'not_configured', tallyConnections: 'not_configured' },
};

describe('health contract', () => {
  it('accepts verified D1 health without requiring future optional services', () => {
    expect(healthSchema.safeParse(healthy).success).toBe(true);
  });
  it('rejects a healthy claim when D1 has failed', () => {
    expect(healthSchema.safeParse({ ...healthy, database: { status: 'error', probe: 'SELECT 1' } }).success).toBe(false);
  });
  it('rejects unverified binding statuses and malformed timestamps', () => {
    expect(healthSchema.safeParse({ ...healthy, bindings: { ...healthy.bindings, documents: 'connected' } }).success).toBe(false);
    expect(healthSchema.safeParse({ ...healthy, checkedAt: 'today' }).success).toBe(false);
  });
});