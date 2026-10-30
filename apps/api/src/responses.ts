import { apiErrorSchema, type ApiError } from '@rallie/api-contracts';

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function error(code: ApiError['code'], message: string, status: number, headers: Record<string, string> = {}): Response {
  const requestId = crypto.randomUUID();
  return json(apiErrorSchema.parse({ code, message, requestId }), status, { 'X-Request-ID': requestId, ...headers });
}