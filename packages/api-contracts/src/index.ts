import { z } from 'zod';

const bindingStatus = z.enum(['configured', 'not_configured']);

/** Binding presence is explicitly not a storage/workflow connectivity probe. */
export const healthSchema = z.object({
  service: z.literal('rallie-api'),
  stage: z.literal('foundation'),
  status: z.enum(['ok', 'degraded']),
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
}).strict().refine((value) => (value.status === 'ok') === (value.database.status === 'ok'), {
  message: 'Overall health must reflect the required database probe.',
  path: ['status'],
});

export type HealthResponse = z.infer<typeof healthSchema>;