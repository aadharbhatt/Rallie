# RAL-001 — typed foundation and verification

## Architecture decision

Use **thin typed SQL** against Cloudflare D1, with **Zod** validation at HTTP/browser boundaries. No ORM, repository abstraction, server process, or additional production service is introduced.

| Package | Allowed source dependencies | Runtime |
|---|---|---|
| [apps/web](../apps/web/package.json) | Own source, domain, API contracts, declared UI libraries | Browser; DOM types, no Node or Worker globals |
| [apps/api](../apps/api/package.json) | Own source, domain, API contracts, db | Cloudflare Worker types, no DOM/Node type environment |
| [packages/domain](../packages/domain/package.json) | Own source | Platform-neutral TypeScript; existing preview pricing is not production quotation acceptance |
| [packages/api-contracts](../packages/api-contracts/package.json) | Own source, Zod | Platform-neutral strict DTO validation |
| [packages/db](../packages/db/package.json) | Own source, domain, declared D1 types | Server-only thin typed SQL; only a foundation probe today |

[scripts/check-boundaries.mjs](../scripts/check-boundaries.mjs) traverses all source imports/exports with the TypeScript AST, including type-only and dynamic imports. It also checks shared modules so a browser-safe barrel cannot transitively import Worker/db code. Nonliteral module imports are rejected because their destinations cannot be verified. Deliberate forbidden-import fixtures run under Vitest. This is an architectural gate, not a sandbox for malicious source code.

The web app retains the existing `app/components/features/lib` organization. Domain screens remain labeled, in-memory previews. **Reserved, not created:** `apps/bridge` and `packages/tally-protocol` belong to the Tally slice. No Catalogue, Quotation, ingestion, or Tally tables, jobs or protocol implementation were added. No Redis, Kubernetes, production Docker, microservices, Kafka, GraphQL, CQRS, vector engine, offline database, ontology, Queue, or Compare quotation mode.

Build-time Vite configuration may use Node, but browser source may not. Browser output has no source maps; [scripts/check-build.mjs](../scripts/check-build.mjs) checks for server SQL markers and known credential signatures. Store secrets outside source/build variables; the signature scan cannot prove that arbitrary credentials do not exist. No live credentials are needed or included here.

## Health and errors

Strict shared schemas live in [packages/api-contracts/src/index.ts](../packages/api-contracts/src/index.ts).

| Route | Meaning | Response |
|---|---|---|
| `GET /health/live` | Shallow process liveness, never accesses D1 | 200 with service, static package build version `0.0.0`, status `alive` |
| `GET /health` | Dependency readiness for foundation D1 only | 200 `ok`/`ready` if `SELECT 1 AS ok` succeeds; otherwise 503 `degraded`/`unready` |
| Unsupported health method | No dependency access | 405 `method_not_allowed`, `Allow: GET` |
| Unknown API/absent route | Never returns SPA HTML for API paths | 404 `not_found` |
| Asset binding fetch throws | Recoverable static asset failure | 503 `assets_unavailable` |

D1 categories are `ok`, `not_configured`, and `error`; errors include unexpected results and a two-second probe timeout. A passed probe is **not** evidence of migrations, business readiness, authentication, R2 connectivity, Workflow execution, or Tally connection. Optional binding statuses mean **presence only**. All JSON responses are `no-store`. Error payloads contain stable `code`, safe `message`, server-generated UUID `requestId`, and optional field errors; `X-Request-ID` matches the payload. Client-supplied request IDs, exception text, stacks, account/resource identifiers and credentials are not reflected.

[useHealth](../apps/web/src/lib/use-health.ts) checks schema and HTTP/body consistency. The shell separately explains **unreachable API** versus **invalid response**, without rendering response/exception contents. Its initial state is announced, a failed check never implies a healthy dependency, and Refresh retries. The request times out after six seconds and obsolete requests cannot overwrite newer state. A degraded valid response remains distinct from an unavailable API.

## Migrations and local configuration

[wrangler.jsonc](../wrangler.jsonc) configures the one Worker plus Static Assets and **local-only placeholder** dev/test D1 bindings. No remote resources, accounts, tokens, staging/production configuration, R2 bucket, Workflow, or DO implementation is provisioned. The absent optional bindings are reported honestly. Remote deployment is not part of this ticket; `npm run build` uses **dry-run only**.

- [scripts/migrate.mjs](../scripts/migrate.mjs) requires an explicit `--env dev` or `--env test`; every Wrangler command forces `--local` with a persistence directory inside `.local/`.
- `npm run db:migrate -- --env dev` applies migrations, lists pending filenames, and reports applied names/timestamps from Wrangler's `d1_migrations` ledger. Repeat apply is harmless.
- `npm run db:status -- --env dev` lists pending migration versions without application. It may initialize emulator bookkeeping on a brand-new local database; it never runs application migration SQL.
- The existing [0001_foundation.sql](../migrations/0001_foundation.sql) is unchanged: only idempotent `foundation_metadata`, no domain schema or fixtures. Wrangler owns migration tracking. Once delivered, future changes append a numbered migration rather than editing old files.
- `reset`, `seed`, missing/unknown environments, staging/production, remote flags, duplicate options and persistence outside `.local/` are rejected **before spawning** any command. There is deliberately no reset/seed implementation. Later operational reset/seed tools must retain this environment guard.
- Default state is `.local/state/dev` or `.local/state/test`, both ignored. Integration tests use fresh isolated directories and remove only those directories afterward. No production backups/resets or full environment-resource isolation are claimed; these belong to FND-008–010 and operations tickets.

## Acceptance evidence — 2026-10-29

Owner: **GitHub Copilot**. Implementation is an **uncommitted working-tree change based on `8cc8a1b`**; no new commit/PR exists and none was fabricated. Platform: macOS, Node **25.9.0**, npm **11.12.1**; declared floor Node 22.12+, not separately exercised here. Locked tools: TypeScript **5.9.3**, Vite **7.3.7**, Vitest **4.1.12**, Wrangler **4.154.0**. Runtime versions should be checked against [package-lock.json](../package-lock.json) when updating.

| Executed command/check | Actual result |
|---|---|
| `npm ci` | Fresh lockfile-backed installation passed, 0 audit vulnerabilities; this was the current worktree, not a separate checkout |
| `npm run typecheck` | Boundary gate + all five package typechecks + tooling passed |
| `npm test` | **65 tests passed, 5 files**: Worker behavior/errors, strict DTO fixtures, existing domain arithmetic, deliberately forbidden browser/shared imports, migration guards |
| `npm run build` | Vite production assets + Wrangler Worker dry-run passed; browser SQL/credential-signature/source-map audit passed. Zod dependency comments caused harmless Rollup annotation warnings |
| `npm run test:migrations` | **1 real D1 emulator integration passed**: empty replay, repeated application, applied-version ledger, no extra domain tables, upgrade from pre-runner bootstrap with sentinel data preserved |
| `npm run db:migrate -- --env dev` | Applied initial migration to local dev D1 and printed its version; no remote requests/deployments |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787 npm run test:e2e -- --workers=2` | **15 passed** against the built SPA, real Worker and emulated D1; no skipped tests |
| `npm audit` | **0 vulnerabilities** in this install |
| `git diff --check` | Passed again after the evidence update; final package/tool typechecks and all 65 unit tests also passed again |

Browser path and outcomes: at `/`, expected a readable heading and actual D1 readiness; observed “Ready when you are.” and “API responding · database reachable” via the integrated browser. Playwright covered command/help focus trapping and restoration, keyboard tabs/tooltips, all five routes, direct reload, narrow layouts (320/390 px) and desktop layouts (1366/1440/1920 px), loading → degraded → unavailable → successful retry. Intercepted malformed DTO and network failures displayed distinct safe explanations and never displayed the injected private stack. Mocked/intercepted health failure states are labeled test fixtures, **not real service outage evidence**. Other real health assertions used the Worker/D1 emulator. Existing quote/catalogue preview tests prove no persistence, authorization, or commercial correctness.

### Binding-contract applicability and limitations

- UI: existing heading, labels, skip link, focus/navigation, loading and readable/retryable errors verified. Saving, commercial mutations, dirty guards, permission/expiry and customer mobile flows are N/A for this foundation read-only contract; no accessibility conformance claim.
- Security: no login, tenant, roles, public capability, input payload, or commercial mutation exists. Role/tenant/CSRF/rate-limit/idempotency/audit tests are N/A here, not marked as passed future behavior. Safe JSON errors and malformed-response handling are tested now.
- Persistence: real **D1 emulator** used for replay/upgrade; unit tests use explicit binding doubles. R2/Workflow/DO integration is N/A to this child scope and remains FND-005/006, not silently counted as complete.
- Delivery: no live deployment, credentials, Docker runtime gate, real AI, Windows/Tally, performance measurements, or cross-Node-version certification. RAL-002 and later parents retain their own gates. Existing shell evidence does not complete RAL-003.
- Artifacts: [tests/e2e/foundation.spec.ts](../tests/e2e/foundation.spec.ts), [scripts/migrations.integration.test.mjs](../scripts/migrations.integration.test.mjs), [scripts/check-boundaries.test.mjs](../scripts/check-boundaries.test.mjs), [scripts/migrate.test.mjs](../scripts/migrate.test.mjs), and [apps/api/src/index.test.ts](../apps/api/src/index.test.ts). No screenshot/trace was retained from passing tests; traces are configured for failures.