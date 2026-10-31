import { z } from 'zod';

const bindingStatus = z.enum(['configured', 'not_configured']);

export const runtimeSchema = z.object({
  environment: z.enum(['dev', 'test', 'staging', 'production', 'unconfigured']),
  extraction: z.enum(['unavailable', 'mock_stub']),
  tally: z.enum(['unavailable', 'mock_stub']),
}).strict().refine((value) => ['dev', 'test'].includes(value.environment) || (value.extraction === 'unavailable' && value.tally === 'unavailable'), {
  message: 'Mock stubs require a local dev/test environment.',
});
export type RuntimeStatus = z.infer<typeof runtimeSchema>;

/** Binding presence is explicitly not a storage/workflow connectivity probe. */
export const healthSchema = z.object({
  service: z.literal('rallie-api'),
  stage: z.literal('foundation'),
  runtime: runtimeSchema,
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
  code: z.enum(['not_found', 'method_not_allowed', 'assets_unavailable', 'invalid_configuration', 'forbidden', 'binding_unavailable', 'probe_failed']),
  message: z.string().min(1).max(200),
  requestId: z.string().uuid(),
  fieldErrors: z.record(z.string(), z.array(z.string().max(200)).max(10)).optional(),
}).strict();

export type ApiError = z.infer<typeof apiErrorSchema>;

/** Local diagnostic data only: never business jobs, documents or bridge credentials. */
export const localSmokeSchema = z.object({
  scope: z.literal('local-foundation-smoke'),
  database: z.boolean(),
  documents: z.boolean(),
  durableObject: z.boolean(),
  workflowId: z.string().uuid().optional(),
}).strict();

export const localWorkflowSchema = z.object({
  status: z.enum(['queued', 'running', 'paused', 'errored', 'terminated', 'complete', 'waiting', 'waitingForPause', 'unknown']),
  verified: z.boolean(),
}).strict();