import { localSmokeSchema, localWorkflowSchema } from '@rallie/api-contracts';
import type { Env } from './env';
import { error, json } from './responses';
import { runtimeStatus } from './runtime';

const marker = 'ral002-foundation-smoke';
const key = '__local_foundation_smoke__';
const hosts = new Set(['localhost', '127.0.0.1', '[::1]', 'worker']);
const origins = new Set([5173, 5174, 5175, 8787, 8788, 8789].flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`, `http://[::1]:${port}`]));

/** Local entry only: fixed harmless fixtures, no arbitrary SQL, keys or payloads. */
export async function localSmoke(request: Request, env: Env): Promise<Response> {
  const runtime = runtimeStatus(env);
  if (!runtime) return error('invalid_configuration', 'Invalid local runtime configuration.', 503);
  if (!['dev', 'test'].includes(runtime.environment)) return error('not_found', 'This route is not available.', 404);
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const allowed = env.ALLOWED_ORIGINS ? new Set(env.ALLOWED_ORIGINS.split(',')) : origins;
  if (!hosts.has(url.hostname) || (origin && (env.ALLOWED_ORIGINS ? !allowed.has(origin) : origin !== url.origin && !allowed.has(origin)))) return error('forbidden', 'Local diagnostics reject this origin.', 403);
  if (!env.DB || !env.DOCUMENTS || !env.INGESTION_WORKFLOW || !env.TALLY_CONNECTIONS) return error('binding_unavailable', 'A required local emulator binding is missing. No mock fallback was used.', 503);
  const workflowId = url.pathname.match(/^\/api\/__local\/workflow\/([0-9a-f-]{36})$/)?.[1];
  if (url.pathname !== '/api/__local/smoke' && !workflowId) return error('not_found', 'Unknown local diagnostic route.', 404);
  if (request.method !== 'GET' && !(request.method === 'POST' && !workflowId)) return error('method_not_allowed', 'Use the documented local probe method.', 405, { Allow: workflowId ? 'GET' : 'GET, POST' });
  if (request.body !== null) {
    const reader = request.body.getReader();
    const chunk = await reader.read();
    await reader.cancel();
    if (!chunk.done && chunk.value.byteLength > 0) return error('forbidden', 'Local probes do not accept request bodies.', 403);
  }
  try {
    if (workflowId) {
      const instance = await env.INGESTION_WORKFLOW.get(workflowId);
      const status = await instance.status();
      return json(localWorkflowSchema.parse({ status: status.status, verified: status.status === 'complete' && status.output === marker }));
    }
    const write = request.method === 'POST';
    if (write) {
      await env.DB.prepare('INSERT INTO foundation_metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, marker).run();
      await env.DOCUMENTS.put(key, marker, { httpMetadata: { contentType: 'text/plain' } });
    }
    const row = await env.DB.prepare('SELECT value FROM foundation_metadata WHERE key = ?').bind(key).first<{ value: string }>();
    const object = await env.DOCUMENTS.get(key);
    const stub = env.TALLY_CONNECTIONS.get(env.TALLY_CONNECTIONS.idFromName('foundation-smoke-only'));
    const response = await stub.fetch('https://foundation-smoke.invalid/', { method: write ? 'POST' : 'GET' });
    if (!response.ok) throw new Error('DO probe failed');
    const durableObject = await response.text() === marker;
    const instance = write ? await env.INGESTION_WORKFLOW.create({ params: {} }) : undefined;
    return json(localSmokeSchema.parse({ scope: 'local-foundation-smoke', database: row?.value === marker, documents: object ? await object.text() === marker : false, durableObject, ...(instance ? { workflowId: instance.id } : {}) }));
  } catch {
    return error('probe_failed', 'Local binding smoke failed. Check migrations and emulator availability; no mock fallback was used.', 503);
  }
}