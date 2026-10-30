import { describe, expect, it } from 'vitest';
import { localOptions } from './start-local-api.mjs';
import { runtimePlan } from './local-runtime.mjs';

describe('local runtime command guard', () => {
  it.each([[], ['up'], ['up', '--env', 'production'], ['reset', '--env', 'dev', '--confirm', 'DELETE_LOCAL_TEST'], ['reset', '--env', 'test'], ['up', '--env', 'test', '--remote'], ['verify', '--env', 'dev']])('rejects unsafe Docker arguments %j before executing', (...args) => expect(() => runtimePlan(args)).toThrow());
  it('pins environments and destructive reset to distinct fixed projects', () => {
    expect(runtimePlan(['up', '--env', 'dev']).project).toBe('rallie-local-dev');
    expect(runtimePlan(['verify', '--env', 'test']).project).toBe('rallie-verify-test');
    expect(runtimePlan(['reset', '--env', 'test', '--confirm', 'DELETE_LOCAL_TEST']).project).toBe('rallie-local-test');
  });
  it('requires explicit local startup and rejects secrets/invalid flags', () => {
    const args = ['--env', 'dev', '--ip', '127.0.0.1'];
    expect(localOptions(args, {})).toMatchObject({ environment: 'dev', extraction: 'false', tally: 'false' });
    expect(() => localOptions(['--env', 'production', '--ip', '127.0.0.1'], {})).toThrow();
    expect(() => localOptions(args, { CLOUDFLARE_API_TOKEN: 'test-only-sentinel' })).toThrow();
    expect(() => localOptions(args, { RALLIE_MOCK_TALLY: '1' })).toThrow();
    expect(() => localOptions(args, { RALLIE_OMIT_BINDING: 'TALLY_CONNECTIONS' })).toThrow();
    expect(localOptions(['--env', 'test', '--ip', '0.0.0.0'], { RALLIE_MOCK_EXTRACTION: 'true', RALLIE_OMIT_BINDING: 'INGESTION_WORKFLOW' })).toMatchObject({ extraction: 'true', tally: 'false', omit: 'INGESTION_WORKFLOW' });
  });
});