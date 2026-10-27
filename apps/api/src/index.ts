import { healthSchema, type HealthResponse } from '../../../packages/api-contracts/src/index';
import type { Env } from './env';

export type { Env } from './env';

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

async function databaseStatus(env: Env): Promise<HealthResponse['database']['status']> {
  if (!env.DB) return 'not_configured';
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Probe timeout')), 2_000);
      }),
    ]);
    return result?.ok === 1 ? 'ok' : 'error';
  } catch {
    // Do not leak infrastructure identifiers or database exception details.
    return 'error';
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '/health') {
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
    const database = await databaseStatus(env);
    const presence = (binding: unknown) => binding ? 'configured' as const : 'not_configured' as const;
    const health = healthSchema.parse({
      service: 'rallie-api',
      stage: 'foundation',
      status: database === 'ok' ? 'ok' : 'degraded',
      checkedAt: new Date().toISOString(),
      database: { status: database, probe: 'SELECT 1' },
      bindings: {
        documents: presence(env.DOCUMENTS),
        assets: presence(env.ASSETS),
        ingestionWorkflow: presence(env.INGESTION_WORKFLOW),
        tallyConnections: presence(env.TALLY_CONNECTIONS),
      },
    });
    return json(health, database === 'ok' ? 200 : 503);
  }

  // API requests must never receive the SPA, including unknown authentication URLs.
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    return json({ error: 'not_found', message: 'This API route is not implemented in the foundation.' }, 404);
  }

  if (env.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
    try {
      // Fetcher uses Workers' Request type; passing the URL avoids DOM/Workers type collisions.
      const asset = await env.ASSETS.fetch(request.url, { method: request.method, headers: Object.fromEntries(request.headers) });
      if (asset.status === 404 && request.headers.get('Accept')?.includes('text/html') && !url.pathname.split('/').pop()?.includes('.')) {
        const indexUrl = new URL('/index.html', url);
        return await env.ASSETS.fetch(indexUrl.toString(), { method: request.method }) as unknown as Response;
      }
      return asset as unknown as Response;
    } catch {
      return json({ error: 'assets_unavailable' }, 503);
    }
  }
  return json({ error: 'not_found' }, 404);
}

export default { fetch: handleRequest };