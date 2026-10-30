import type { D1Database, DurableObjectNamespace, Fetcher, R2Bucket, Workflow } from '@cloudflare/workers-types';

/** Optional at the boundary so missing local bindings are reported honestly. */
export interface Env {
  RUNTIME_ENV?: string;
  MOCK_EXTRACTION?: string;
  MOCK_TALLY?: string;
  DB?: D1Database;
  DOCUMENTS?: R2Bucket;
  ASSETS?: Fetcher;
  /** Local entry binds foundation smoke classes, never real ingestion/Tally. */
  INGESTION_WORKFLOW?: Workflow;
  TALLY_CONNECTIONS?: DurableObjectNamespace;
}