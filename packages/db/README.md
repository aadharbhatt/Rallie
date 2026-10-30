# Foundation database

The only schema is the bootstrap metadata table in [the initial migration](../../migrations/0001_foundation.sql).
Thin typed SQL is the selected persistence approach, with Zod-style HTTP validation in the shared API contracts. [src/index.ts](src/index.ts) contains only the typed foundation D1 probe, not a hypothetical repository layer.

Wrangler is the migration runner; [the configuration](../../wrangler.jsonc) binds `DB` and points `migrations_dir` at the root migrations directory. Wrangler's `d1_migrations` table tracks applied filenames/timestamps. Use `npm run db:migrate -- --env dev` or `--env test`; the runner forces local D1 and uses `.local/state/dev` or `.local/state/test`, shared with the corresponding Worker. Apply reports both pending and applied versions; `npm run db:status -- --env dev` lists pending versions.

No implicit environment, remote execution, reset, seed, staging, or production command is supported. Guards refuse those requests before starting Wrangler. Append later migrations in their owning slices, never domain tables in foundation. Run `npm run test:migrations` for isolated empty replay, harmless second apply, ledger verification, and upgrade of existing bootstrap schema/data. See [foundation evidence](../../docs/FOUNDATION.md) for exact checks and limitations.

`GET /health` runs a read-only `SELECT 1 AS ok`. This tests D1 connectivity, **not** migration application or business readiness.
No catalogue, identity, quotation, ingestion, or Tally tables exist yet. Introduce those in their tested vertical slices.
Future business queries must derive tenant scope from authenticated membership, never from a client-supplied business ID.

The bootstrap migration is idempotent and contains no business fixtures. Frontend fixtures live only in browser memory.