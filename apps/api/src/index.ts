import { healthSchema, livenessSchema, type HealthResponse } from '@rallie/api-contracts';
import { probeDatabase } from '@rallie/db';
import type { Env } from './env';
import { error, json } from './responses';
import { runtimeStatus } from './runtime';
import { requestPolicy, withOriginHeaders } from './origins';

export type { Env } from './env';

async function databaseStatus(env: Env): Promise<HealthResponse['database']['status']> {
  if (!env.DB) return 'not_configured';
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      probeDatabase(env.DB),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Probe timeout')), 2_000);
      }),
    ]);
    return result ? 'ok' : 'error';
  } catch {
    // Do not leak infrastructure identifiers or database exception details.
    return 'error';
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const runtime = runtimeStatus(env);
  if (!runtime) return error('invalid_configuration', 'Mock services require an explicit dev/test environment and boolean flags.', 503);
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith('/api/__local')) return error('not_found', 'This route is not available.', 404);
  if (['/health', '/health/live'].includes(pathname) && request.method !== 'GET' && request.method !== 'OPTIONS') return error('method_not_allowed', 'Use GET for health checks.', 405, { Allow: 'GET' });
  const denied = requestPolicy(request, env);
  if (denied) return denied;
  return withOriginHeaders(await routeRequest(request, env), request, env);
}

async function routeRequest(request: Request, env: Env): Promise<Response> {
  const runtime = runtimeStatus(env)!;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/__local')) return error('not_found', 'This route is not available.', 404);
  if (url.pathname === '/health/live') {
    if (request.method !== 'GET') return error('method_not_allowed', 'Use GET for health checks.', 405, { Allow: 'GET' });
    return json(livenessSchema.parse({ service: 'rallie-api', build: { version: '0.0.0' }, status: 'alive' }));
  }
  if (url.pathname === '/health') {
    if (request.method !== 'GET') return error('method_not_allowed', 'Use GET for health checks.', 405, { Allow: 'GET' });
    const database = await databaseStatus(env);
    const presence = (binding: unknown) => binding ? 'configured' as const : 'not_configured' as const;
    const health = healthSchema.parse({
      service: 'rallie-api',
      stage: 'foundation',
      runtime,
      build: { version: '0.0.0' },
      status: database === 'ok' ? 'ok' : 'degraded',
      readiness: database === 'ok' ? 'ready' : 'unready',
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
    return error('not_found', 'This API route is not implemented in the foundation.', 404);
  }

  if (env.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
    try {
      const asset = await env.ASSETS.fetch(request.url, { method: request.method, headers: Object.fromEntries(request.headers) });
      if (asset.status === 404 && request.headers.get('Accept')?.includes('text/html') && !url.pathname.split('/').pop()?.includes('.')) {
        const indexUrl = new URL('/index.html', url);
        return await env.ASSETS.fetch(indexUrl.toString(), { method: request.method });
      }
      return asset;
    } catch {
      return error('assets_unavailable', 'Static assets are temporarily unavailable. Try again.', 503);
    }
  }
  return error('not_found', 'This route is not available.', 404);
}

export default { fetch: handleRequest };