import type { Env } from './env';
import { error } from './responses';

const remote = (env: Env) => ['staging', 'production'].includes(env.RUNTIME_ENV ?? '');

export function configuredOrigins(env: Env): string[] | null {
  const origins = env.ALLOWED_ORIGINS?.split(',') ?? (env.APP_ORIGIN ? [env.APP_ORIGIN] : []);
  try {
    for (const origin of origins) {
      const url = new URL(origin);
      if (url.origin !== origin || url.hostname.includes('*') || url.username || url.password) return null;
      if (remote(env) ? url.protocol !== 'https:' || url.hostname === 'localhost' || url.hostname.endsWith('.localhost') || /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':')
        : url.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(url.hostname)) return null;
    }
    if (remote(env) && (origins.length !== 1 || origins[0] !== env.APP_ORIGIN)) return null;
    return origins;
  } catch { return null; }
}

/** Fail before static assets, probes or mutations; origin headers are never reflected blindly. */
export function requestPolicy(request: Request, env: Env): Response | null {
  const origins = configuredOrigins(env);
  if (!origins || (remote(env) && (!env.DB || !env.DOCUMENTS || !env.ASSETS))) {
    return error('invalid_configuration', 'Environment setup incomplete. Configure the application origin and required D1/R2/assets bindings; contact the operator.', 503);
  }
  const origin = request.headers.get('Origin');
  const safe = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if ((origin && !origins.includes(origin)) || (!safe && !origin)) return error('forbidden', 'This request origin is not allowed.', 403);
  if (request.method === 'OPTIONS') {
    if (!origin || !['GET', 'HEAD'].includes(request.headers.get('Access-Control-Request-Method') ?? '') || request.headers.has('Access-Control-Request-Headers')) {
      return error('forbidden', 'This cross-origin request is not allowed.', 403);
    }
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, HEAD', Vary: 'Origin', 'Cache-Control': 'no-store' } });
  }
  return null;
}

export function withOriginHeaders(response: Response, request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  if (origin && configuredOrigins(env)?.includes(origin)) {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.append('Vary', 'Origin');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
}