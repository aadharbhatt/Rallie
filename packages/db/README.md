# Foundation database

The only schema is the bootstrap metadata table in [the initial migration](../../migrations/0001_foundation.sql).
Wrangler is the migration runner; configure its D1 binding as `DB` and its `migrations_dir` as `migrations` at the repository root.
Apply migrations against an empty local D1 database using the same `.local/state` persistence directory as the development Worker.

`GET /health` runs a read-only `SELECT 1 AS ok`. This tests D1 connectivity, **not** migration application or business readiness.
No catalogue, identity, quotation, ingestion, or Tally tables exist yet. Introduce those in their tested vertical slices.
Future business queries must derive tenant scope from authenticated membership, never from a client-supplied business ID.

The bootstrap migration is idempotent and contains no business fixtures. Frontend fixtures live only in browser memory.