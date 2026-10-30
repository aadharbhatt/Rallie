import { describe, expect, it } from 'vitest';
import { apiErrorSchema, healthSchema, livenessSchema } from './index';

const healthy = {
  service: 'rallie-api', stage: 'foundation', status: 'ok', checkedAt: '2026-10-28T12:00:00.000Z',
  build: { version: '0.0.0' }, readiness: 'ready',
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
  it('accepts unready fixtures but rejects inconsistent readiness', () => {
    for (const status of ['error', 'not_configured']) {
      expect(healthSchema.safeParse({ ...healthy, status: 'degraded', readiness: 'unready', database: { status, probe: 'SELECT 1' } }).success).toBe(true);
    }
    expect(healthSchema.safeParse({ ...healthy, readiness: 'unready' }).success).toBe(false);
    expect(livenessSchema.parse({ service: 'rallie-api', build: healthy.build, status: 'alive' }).status).toBe('alive');
  });
  it('allows only safe health and error fields', () => {
    const error = { code: 'not_found', message: 'Route not found.', requestId: '00000000-0000-4000-8000-000000000001' };
    expect(apiErrorSchema.safeParse(error).success).toBe(true);
    for (const field of ['stack', 'credentials', 'accountId', 'resourceId', 'token']) {
      expect(healthSchema.safeParse({ ...healthy, [field]: 'private' }).success).toBe(false);
      expect(apiErrorSchema.safeParse({ ...error, [field]: 'private' }).success).toBe(false);
    }
    expect(apiErrorSchema.safeParse({ ...error, requestId: 'untrusted-input' }).success).toBe(false);
  });
});