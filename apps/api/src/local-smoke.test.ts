import { describe, expect, it, vi } from 'vitest';
import { apiErrorSchema } from '@rallie/api-contracts';
import type { Env } from './env';
import { localSmoke } from './local-smoke';

const request = (path = '/api/__local/smoke', init?: RequestInit) => new Request(`http://127.0.0.1:8787${path}`, init);
const bindings = () => ({ RUNTIME_ENV: 'test', DB: { prepare: vi.fn() }, DOCUMENTS: {}, INGESTION_WORKFLOW: {}, TALLY_CONNECTIONS: {} }) as unknown as Env;

describe('local-only binding diagnostics guard', () => {
  it.each(['production', undefined])('hides smoke in %s even with every binding present', async (RUNTIME_ENV) => {
    const env = { ...bindings(), RUNTIME_ENV };
    expect((await localSmoke(request(), env)).status).toBe(404);
    expect(env.DB?.prepare).not.toHaveBeenCalled();
  });
  it.each(['DB', 'DOCUMENTS', 'INGESTION_WORKFLOW', 'TALLY_CONNECTIONS'] as const)('missing %s fails explicitly without fallback', async (name) => {
    const env = { ...bindings(), [name]: undefined };
    const response = await localSmoke(request(), env);
    expect(response.status).toBe(503);
    expect(apiErrorSchema.parse(await response.json()).code).toBe('binding_unavailable');
  });
  it('rejects foreign browser origins and hosts before writes', async () => {
    const env = bindings();
    expect((await localSmoke(request(undefined, { method: 'POST', headers: { Origin: 'https://evil.example' } }), env)).status).toBe(403);
    expect((await localSmoke(new Request('https://evil.example/api/__local/smoke', { method: 'POST' }), env)).status).toBe(403);
    expect(env.DB?.prepare).not.toHaveBeenCalled();
  });
  it('accepts explicit IPv6 loopback through the origin guard, without assuming binding success', async () => {
    const response = await localSmoke(new Request('http://[::1]:8787/api/__local/smoke', { headers: { Origin: 'http://[::1]:5174' } }), bindings());
    expect(apiErrorSchema.parse(await response.json()).code).toBe('probe_failed');
  });
  it('uses the selected environment origin matrix instead of other local environments', async () => {
    const env = { ...bindings(), ALLOWED_ORIGINS: 'http://127.0.0.1:5175' };
    expect((await localSmoke(request(undefined, { method: 'POST', headers: { Origin: 'http://127.0.0.1:5174' } }), env)).status).toBe(403);
    expect(env.DB?.prepare).not.toHaveBeenCalled();
  });
  it('rejects arbitrary payloads, methods and routes', async () => {
    const env = bindings();
    expect((await localSmoke(request(undefined, { method: 'POST', body: 'private' }), env)).status).toBe(403);
    expect((await localSmoke(request(undefined, { method: 'DELETE' }), env)).status).toBe(405);
    expect((await localSmoke(request('/api/__local/other'), env)).status).toBe(404);
    expect(env.DB?.prepare).not.toHaveBeenCalled();
  });
  it('does not expose binding exceptions or claim mock success', async () => {
    const env = bindings();
    vi.mocked(env.DB!.prepare).mockImplementation(() => { throw new Error('SECRET infrastructure detail'); });
    const response = await localSmoke(request(), env);
    expect(response.status).toBe(503);
    expect(apiErrorSchema.parse(await response.json()).code).toBe('probe_failed');
  });
});