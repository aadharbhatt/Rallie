import type { D1Database, DurableObjectNamespace, Fetcher, R2Bucket, Workflow } from '@cloudflare/workers-types';

/** Optional at the boundary so missing local bindings are reported honestly. */
export interface Env {
  DB?: D1Database;
  DOCUMENTS?: R2Bucket;
  ASSETS?: Fetcher;
  /** Contracts only: no workflow or Durable Object implementation in this slice. */
  INGESTION_WORKFLOW?: Workflow;
  TALLY_CONNECTIONS?: DurableObjectNamespace;
}