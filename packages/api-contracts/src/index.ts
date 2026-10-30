import { z } from 'zod';

const bindingStatus = z.enum(['configured', 'not_configured']);

/** Binding presence is explicitly not a storage/workflow connectivity probe. */
export const healthSchema = z.object({
  service: z.literal('rallie-api'),
  stage: z.literal('foundation'),
  build: z.object({ version: z.literal('0.0.0') }).strict(),
  status: z.enum(['ok', 'degraded']),
  readiness: z.enum(['ready', 'unready']),
  checkedAt: z.string().datetime(),
  database: z.object({
    status: z.enum(['ok', 'error', 'not_configured']),
    probe: z.literal('SELECT 1'),
  }).strict(),
  bindings: z.object({
    documents: bindingStatus,
    assets: bindingStatus,
    ingestionWorkflow: bindingStatus,
    tallyConnections: bindingStatus,
  }).strict(),
}).strict().refine((value) => (value.status === 'ok') === (value.database.status === 'ok') && (value.readiness === 'ready') === (value.status === 'ok'), {
  message: 'Overall health must reflect the required database probe.',
  path: ['status'],
});

export type HealthResponse = z.infer<typeof healthSchema>;

/** Shallow process liveness: explicitly makes no dependency-readiness claim. */
export const livenessSchema = z.object({
  service: z.literal('rallie-api'),
  build: z.object({ version: z.literal('0.0.0') }).strict(),
  status: z.literal('alive'),
}).strict();

export const apiErrorSchema = z.object({
  code: z.enum(['not_found', 'method_not_allowed', 'assets_unavailable']),
  message: z.string().min(1).max(200),
  requestId: z.string().uuid(),
  fieldErrors: z.record(z.string(), z.array(z.string().max(200)).max(10)).optional(),
}).strict();

export type ApiError = z.infer<typeof apiErrorSchema>;