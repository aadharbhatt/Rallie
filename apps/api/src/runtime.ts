import type { RuntimeStatus } from '@rallie/api-contracts';
import type { Env } from './env';

/** Stubs receive only explicit mode flags. No AI, accounting client or credential is consumed. */
export function runtimeStatus(env: Env): RuntimeStatus | null {
  const flag = (value: string | undefined) => value === undefined || value === 'false' || value === 'true';
  if (!flag(env.MOCK_EXTRACTION) || !flag(env.MOCK_TALLY)) return null;
  if (env.RUNTIME_ENV !== undefined && !['dev', 'test', 'production'].includes(env.RUNTIME_ENV)) return null;
  const environment = (env.RUNTIME_ENV ?? 'unconfigured') as RuntimeStatus['environment'];
  const extraction = env.MOCK_EXTRACTION === 'true';
  const tally = env.MOCK_TALLY === 'true';
  if ((extraction || tally) && !['dev', 'test'].includes(environment)) return null;
  return { environment, extraction: extraction ? 'mock_stub' : 'unavailable', tally: tally ? 'mock_stub' : 'unavailable' };
}