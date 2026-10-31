import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiErrorSchema, healthSchema, livenessSchema } from '@rallie/api-contracts';
import { handleRequest } from './index';
import type { Env } from './env';

const request = (path: string, init?: RequestInit) => new Request(`https://rallie.example${path}`, init);
function database(result: unknown = { ok: 1 }): NonNullable<Env['DB']> {
  return { prepare: vi.fn(() => ({ first: vi.fn(async () => result) })) } as unknown as NonNullable<Env['DB']>;
}

afterEach(() => vi.useRealTimers());

describe('foundation Worker', () => {
  it('reports shallow liveness without probing missing or unhealthy D1', async () => {
    const DB = database();
    const response = await handleRequest(request('/health/live'), { DB });
    expect(response.status).toBe(200);
    expect(livenessSchema.parse(await response.json()).status).toBe('alive');
    expect(DB.prepare).not.toHaveBeenCalled();
    expect((await handleRequest(request('/health/live'), {})).status).toBe(200);
  });
  it('probes D1 with SELECT 1 and reports optional bindings separately', async () => {
    const DB = database();
    const response = await handleRequest(request('/health'), { DB });
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = healthSchema.parse(await response.json());
    expect(DB.prepare).toHaveBeenCalledWith('SELECT 1 AS ok');
    expect(body.database.status).toBe('ok');
    expect(body.bindings.documents).toBe('not_configured');
    expect(body.bindings.ingestionWorkflow).toBe('not_configured');
    expect(body.bindings.tallyConnections).toBe('not_configured');
  });

  it('reports absent D1 as degraded with 503', async () => {
    const response = await handleRequest(request('/health'), {});
    expect(response.status).toBe(503);
    expect(healthSchema.parse(await response.json()).database.status).toBe('not_configured');
  });

  it('keeps readiness unready and liveness alive for the same failing binding without leaking details', async () => {
    const DB = { prepare: vi.fn(() => { throw new Error('PRIVATE_BINDING_IDENTIFIER'); }) } as unknown as NonNullable<Env['DB']>;
    const readiness = await handleRequest(request('/health'), { DB });
    const text = await readiness.text();
    expect(readiness.status).toBe(503);
    expect(healthSchema.parse(JSON.parse(text)).readiness).toBe('unready');
    expect(text).not.toContain('PRIVATE_BINDING_IDENTIFIER');
    const liveness = await handleRequest(request('/health/live'), { DB });
    expect(liveness.status).toBe(200);
    expect(livenessSchema.parse(await liveness.json()).status).toBe('alive');
    expect(DB.prepare).toHaveBeenCalledTimes(1);
  });

  it('reports binding presence without pretending to test optional services', async () => {
    const response = await handleRequest(request('/health'), {
      DB: database(),
      DOCUMENTS: {} as NonNullable<Env['DOCUMENTS']>,
      ASSETS: {} as NonNullable<Env['ASSETS']>,
      INGESTION_WORKFLOW: {} as NonNullable<Env['INGESTION_WORKFLOW']>,
      TALLY_CONNECTIONS: {} as NonNullable<Env['TALLY_CONNECTIONS']>,
    });
    expect(healthSchema.parse(await response.json()).bindings).toEqual({
      documents: 'configured', assets: 'configured', ingestionWorkflow: 'configured', tallyConnections: 'configured',
    });
  });

  it('does not expose database exceptions', async () => {
    const DB = { prepare: () => { throw new Error('SECRET internal database identifier'); } } as unknown as Env['DB'];
    const response = await handleRequest(request('/health'), { DB });
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).not.toContain('SECRET');
    expect(healthSchema.parse(JSON.parse(text)).database.status).toBe('error');
  });

  it('treats a wrong probe result as failure', async () => {
    expect((await handleRequest(request('/health'), { DB: database(null) })).status).toBe(503);
  });

  it('bounds a stalled D1 probe', async () => {
    vi.useFakeTimers();
    const DB = { prepare: () => ({ first: () => new Promise(() => {}) }) } as unknown as Env['DB'];
    const pending = handleRequest(request('/health'), { DB });
    await vi.advanceTimersByTimeAsync(2_000);
    expect((await pending).status).toBe(503);
  });

  it('rejects unsupported health methods without probing', async () => {
    const DB = database();
    const response = await handleRequest(request('/health', { method: 'POST' }), { DB });
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    expect(DB.prepare).not.toHaveBeenCalled();
  });

  it.each(['/api', '/api/unknown', '/api/auth/login'])('never sends SPA assets for %s', async (path) => {
    const fetch = vi.fn(async () => new Response('<html>SPA</html>'));
    const response = await handleRequest(request(path, { headers: { Accept: 'text/html' } }), { ASSETS: { fetch } as unknown as Env['ASSETS'] });
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const body = apiErrorSchema.parse(await response.json());
    expect(body.code).toBe('not_found');
    expect(body.requestId).toBe(response.headers.get('X-Request-ID'));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('serves static assets and falls back for browser routes only', async () => {
    const fetch = vi.fn(async (url: string) => new Response(url.endsWith('/index.html') ? '<html>Rallie</html>' : 'Not found', { status: url.endsWith('/index.html') ? 200 : 404 }));
    const env = { ASSETS: { fetch } as unknown as Env['ASSETS'] };
    const response = await handleRequest(request('/catalogue', { headers: { Accept: 'text/html' } }), env);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('Rallie');
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockClear();
    expect((await handleRequest(request('/missing.js', { headers: { Accept: 'text/html' } }), env)).status).toBe(404);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('reports asset failures without leaking their details', async () => {
    const fetch = vi.fn(async () => { throw new Error('internal'); });
    const response = await handleRequest(request('/'), { ASSETS: { fetch } as unknown as Env['ASSETS'] });
    expect(response.status).toBe(503);
    expect(apiErrorSchema.parse(await response.json()).code).toBe('assets_unavailable');
  });
  it.each(['/health', '/health/live', '/unknown', '/api/unknown'])('returns a safe error envelope for %s', async (path) => {
    const response = await handleRequest(request(path, { method: 'POST', headers: { 'X-Request-ID': 'SECRET caller input' } }), {});
    const body = apiErrorSchema.parse(await response.json());
    expect(body.requestId).toBe(response.headers.get('X-Request-ID'));
    expect(JSON.stringify(body)).not.toContain('SECRET');
  });
});