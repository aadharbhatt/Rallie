import { describe, expect, it } from 'vitest';
import { apiErrorSchema } from '@rallie/api-contracts';
import { runtimeStatus } from './runtime';
import { handleRequest } from './index';

describe('explicit independent mock-service stubs', () => {
  it('defaults to unavailable, never silently enables a mock', () => {
    expect(runtimeStatus({})).toEqual({ environment: 'unconfigured', extraction: 'unavailable', tally: 'unavailable' });
    expect(runtimeStatus({ RUNTIME_ENV: 'dev' })).toEqual({ environment: 'dev', extraction: 'unavailable', tally: 'unavailable' });
  });
  it.each(['dev', 'test'])('independently opts into local %s stubs', (environment) => {
    expect(runtimeStatus({ RUNTIME_ENV: environment, MOCK_EXTRACTION: 'true' })).toMatchObject({ extraction: 'mock_stub', tally: 'unavailable' });
    expect(runtimeStatus({ RUNTIME_ENV: environment, MOCK_TALLY: 'true' })).toMatchObject({ extraction: 'unavailable', tally: 'mock_stub' });
  });
  it.each([
    { RUNTIME_ENV: 'production', MOCK_EXTRACTION: 'true' },
    { RUNTIME_ENV: 'production', MOCK_TALLY: 'true' },
    { MOCK_EXTRACTION: 'true' }, { MOCK_TALLY: 'true' },
    { RUNTIME_ENV: 'dev', MOCK_EXTRACTION: '1' },
    { RUNTIME_ENV: 'dev', MOCK_TALLY: 'TRUE' }, { RUNTIME_ENV: 'unknown' },
  ])('fails closed for invalid/production opt-ins %j', async (env) => {
    expect(runtimeStatus(env)).toBeNull();
    const response = await handleRequest(new Request('https://rallie.example/health'), env);
    expect(response.status).toBe(503);
    expect(apiErrorSchema.parse(await response.json()).code).toBe('invalid_configuration');
  });
  it('does not expose local diagnostics from the production entrypoint', async () => {
    for (const RUNTIME_ENV of ['dev', 'production']) {
      const response = await handleRequest(new Request('http://127.0.0.1/api/__local/smoke', { method: 'POST' }), { RUNTIME_ENV });
      expect(response.status).toBe(404);
    }
  });
});