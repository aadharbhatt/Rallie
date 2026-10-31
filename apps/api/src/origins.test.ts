import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import { handleRequest } from './index';
import { requestPolicy } from './origins';

const local = { RUNTIME_ENV: 'dev', ALLOWED_ORIGINS: 'http://127.0.0.1:8788,http://127.0.0.1:5174' };
describe('environment-aware request policy', () => {
  it('permits only configured exact browser origins and never wildcard credentials', async () => {
    const response = await handleRequest(new Request('http://127.0.0.1:8788/health/live', { headers: { Origin: 'http://127.0.0.1:5174' } }), local);
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:5174');
    expect(response.headers.get('Vary')).toContain('Origin');
    expect(response.headers.has('Access-Control-Allow-Credentials')).toBe(false);
  });
  it.each(['https://evil.example', 'null', 'http://127.0.0.1:5174.evil.example', 'http://127.0.0.1:5175'])('blocks disallowed browser origin %s', async (origin) => {
    const response = await handleRequest(new Request('http://127.0.0.1:8788/health/live', { headers: { Origin: origin } }), local);
    expect(response.status).toBe(403);
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
  });
  it('blocks absent-origin mutations and write/custom-header preflight', () => {
    expect(requestPolicy(new Request('http://127.0.0.1:8788/api/example', { method: 'POST' }), local)?.status).toBe(403);
    for (const method of ['GET', 'POST']) {
      const request = new Request('http://127.0.0.1:8788/api/example', { method: 'OPTIONS', headers: { Origin: 'http://127.0.0.1:5174', 'Access-Control-Request-Method': method } });
      expect(requestPolicy(request, local)?.status).toBe(method === 'GET' ? 204 : 403);
    }
    const headers = { Origin: 'http://127.0.0.1:5174', 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Authorization' };
    expect(requestPolicy(new Request('http://127.0.0.1:8788/api/example', { method: 'OPTIONS', headers }), local)?.status).toBe(403);
  });
  it.each(['staging', 'production'])('fails closed for missing %s resources or origin, before accessing bindings', async (RUNTIME_ENV) => {
    const response = await handleRequest(new Request('https://production.example.invalid/health'), { RUNTIME_ENV });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'invalid_configuration' });
  });
  it('accepts remote configuration only with required foundation bindings and HTTPS exact origin', () => {
    const env: Env = { RUNTIME_ENV: 'staging', APP_ORIGIN: 'https://staging.example.invalid', DB: {} as Env['DB'], DOCUMENTS: {} as Env['DOCUMENTS'], ASSETS: {} as Env['ASSETS'] };
    expect(requestPolicy(new Request('https://staging.example.invalid/health'), env)).toBeNull();
    for (const APP_ORIGIN of ['*', 'http://staging.example.invalid', 'https://*.example.invalid', 'https://app.localhost', 'https://127.0.0.2', 'https://[::1]']) expect(requestPolicy(new Request('https://staging.example.invalid/health'), { ...env, APP_ORIGIN })?.status).toBe(503);
  });
  it.each(['staging', 'production'])('checks %s bindings and mocks before any probe or asset access', async (RUNTIME_ENV) => {
    const APP_ORIGIN = `https://${RUNTIME_ENV}.example.invalid`;
    const env: Env = { RUNTIME_ENV, APP_ORIGIN, DB: {} as Env['DB'], DOCUMENTS: {} as Env['DOCUMENTS'], ASSETS: {} as Env['ASSETS'] };
    for (const binding of ['DB', 'DOCUMENTS', 'ASSETS'] as const) {
      const response = await handleRequest(new Request(`${APP_ORIGIN}/health`), { ...env, [binding]: undefined });
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ code: 'invalid_configuration' });
    }
    for (const flag of ['MOCK_EXTRACTION', 'MOCK_TALLY'] as const) {
      expect((await handleRequest(new Request(`${APP_ORIGIN}/`), { ...env, [flag]: 'true' })).status).toBe(503);
    }
    const foreign = RUNTIME_ENV === 'staging' ? 'https://production.example.invalid' : 'https://staging.example.invalid';
    expect(requestPolicy(new Request(`${APP_ORIGIN}/health`, { headers: { Origin: foreign } }), env)?.status).toBe(403);
    expect(requestPolicy(new Request(`${APP_ORIGIN}/health`), { ...env, ALLOWED_ORIGINS: foreign })?.status).toBe(503);
  });
});