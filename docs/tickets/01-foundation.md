# Foundation — non-screen support tickets

Source requirements: [implementation backlog](../IMPLEMENTATION.md); interaction requirements: [design](../DESIGN.md), especially §§4–6 and 14. This is a decomposition, not replacement of the 80 parent requirements. All parent acceptance criteria and binding contracts remain mandatory. No scaffolding is completion evidence. Only these support concerns belong here; visible shell work is tracked separately.

## Parent mapping and delivery rules

- RAL-001 → FND-001–FND-003.
- RAL-002 → FND-004–FND-007.
- RAL-003 → FND-002, FND-009, FND-012; visible shell is a separate handoff.
- RAL-004 → FND-003, FND-008, FND-010.
- RAL-005 → FND-011–FND-012.
- RAL-006 → FND-013–FND-014.

Each ticket is intended as one independently verifiable increment, normally no more than half a day once its prerequisites exist. Split further if discovery exceeds that limit. API additions are proposed contracts to finalize with fixtures; do not silently replace parent paths. `Parent gate RAL-xxx` means the parent's required evidence is accepted, not merely that scaffolding exists. Record commit, commands/results, limitations and screenshots where relevant before any future status change. Credentials and resource identifiers must not enter evidence. Production deployment is independent of the runnable local gate.

## Support area: typed bootstrap and migration runner (not a screen)

### FND-001 — Enforce browser, Worker and shared-package boundaries
- **Status:** DONE (started and verified 2026-10-29; uncommitted working tree based on 8cc8a1b; no PR yet)
- **Owner:** GitHub Copilot
- **Parents:** RAL-001 ([requirement](../IMPLEMENTATION.md#ral-001--establish-the-typed-monorepo-and-architectural-boundaries)).
- **Depends on:** None.
- **UI checklist:** [x] Minimal web entry has a heading, keyboard-visible focus and readable failure surface; no domain screen implementation.
- **API/backend checklist:** [x] Typecheck React/TypeScript/Vite, Worker, domain and API-contract packages separately; choose Drizzle or thin typed SQL plus schema validation; reserve bridge packages without implementing them.
- **DB checklist:** [x] Document migration ownership only; introduce no catalogue, quotation or Tally tables.
- **Verify:** 1. Build/typecheck a clean checkout: boundaries pass. 2. Deliberately import server bindings into the web: boundary check fails; inspect output for secrets.
- **Evidence:** [Dated evidence, architecture and limitations](../FOUNDATION.md): lockfile-backed `npm ci`, separate package/tool typechecks, 65 unit/contract tests including deliberately forbidden server-binding imports, web build and Worker dry-run, browser bundle scan, and 15 Playwright tests passed. Thin typed SQL + Zod chosen; bridge/protocol packages documented as reserved only. Existing preview domain UI preserved, not completed production behavior. No domain migration added.

### FND-002 — Define machine-readable health and safe error contracts
- **Status:** DONE (started and verified 2026-10-29; uncommitted working tree based on 8cc8a1b; no PR yet)
- **Owner:** GitHub Copilot
- **Parents:** RAL-001, RAL-003 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** FND-001.
- **UI checklist:** [x] Document how the shell distinguishes unavailable API from an invalid response, without showing stacks.
- **API/backend checklist:** [x] Define `GET /health` service/build/readiness DTO and a stable JSON error envelope; distinguish shallow liveness from dependency readiness; specify status codes and non-secret diagnostic categories.
- **DB checklist:** None; contract definition must not require domain tables.
- **Verify:** 1. Validate healthy/unready/error fixtures against shared schemas. 2. Assert fixtures contain no credentials, account/resource IDs or exception stacks.
- **Evidence:** [Health/error contract and executed evidence](../FOUNDATION.md): strict healthy/unready/error fixtures, safe UUID request IDs, non-reflected exception text, shallow `/health/live`, readiness `/health`, timeout/missing/error probes verified. Worker and schema tests passed within 65-test run; Playwright verified unavailable versus invalid response, loading/degraded/retry, and real local D1 readiness. Binding presence explicitly does not claim optional-service connectivity. UI saving/permissions/tenant tests N/A: no auth/mutation feature exists.

### FND-003 — Replay foundation migrations safely
- **Status:** DONE (started and verified 2026-10-29; uncommitted working tree based on 8cc8a1b; no PR yet)
- **Owner:** GitHub Copilot
- **Parents:** RAL-001, RAL-004 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** FND-001.
- **UI checklist:** None; migration commands are non-screen support.
- **API/backend checklist:** [x] Provide explicit environment selection and migration-version reporting; reject implicit production reset/seed operations.
- **DB checklist:** [x] Establish migration runner/version tracking; replay empty local D1 and forward-upgrade a prior foundation state; deterministic seeds allowed only in dev/test.
- **Verify:** 1. Apply twice to an empty isolated D1: second run is harmless. 2. Exercise reset/seed protection with a production configuration: refuse before any write.
- **Evidence:** [Migration safety and evidence](../FOUNDATION.md): `npm run test:migrations` passed 1 real local D1 integration covering empty apply, repeated apply, Wrangler ledger, unchanged foundation-only schema, pre-runner bootstrap upgrade preserving sentinel data. Unit tests refuse missing/prod/staging environments, remote flags, reset/seed and unsafe paths before any command executes. No seed/reset implementation or production access. Existing `0001_foundation.sql` unchanged. UI/keyboard and role/tenant checks N/A for this non-screen local runner; full resource isolation remains FND-008/010.

## Support area: reproducible local Cloudflare runtime (not a screen)

### FND-004 — Start local web and Worker through development containers
- **Status:** DONE (started/verified 2026-10-30; uncommitted working tree based on 37d4d29, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-002 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-001, FND-002, FND-003.
- **UI checklist:** [x] Browser can reach the minimal web entry and a truthful development indicator.
- **API/backend checklist:** [x] Document lockfile/runtime prerequisites, startup and health probes using Wrangler/Miniflare-compatible bindings; Docker remains local-only, not production architecture.
- **DB checklist:** [x] Bind local D1 through the emulator, not an unrelated SQLite or in-memory substitute.
- **Verify:** 1. Follow clean-machine startup instructions: web and API respond. 2. Stop the API: web reports service unavailable instead of simulated success.
- **Evidence:** [RAL-002 setup and executed evidence](../LOCAL-RUNTIME.md). Clean Linux image-layer `npm ci`/web build, non-root Worker + Vite startup and health passed on macOS/Colima arm64; local web 5174/API 8788. Real API stop → Refresh showed API unavailable, no simulated success; default-off recovery observed. Real Docker lifecycle checks passed; 96 unit/contract tests and all 17 Playwright tests passed. Docker source snapshots require rebuild, not bind-mounted HMR; no deployment/real AI/Tally claim. UI saving/permissions/tenant commercial paths N/A to this foundation scope.

### FND-005 — Preserve D1 and private R2 across local restarts
- **Status:** DONE (started/verified 2026-10-30; uncommitted working tree based on 37d4d29, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-002 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-004.
- **UI checklist:** None; inspect through smoke assertions rather than a new management screen.
- **API/backend checklist:** [x] Use local-only binding probes to write/read a harmless fixture object; document restart and explicitly destructive local reset.
- **DB checklist:** [x] Persist emulator state in development volumes; reset targets cannot point at staging/production resources.
- **Verify:** 1. Restart containers: D1 fixture and R2 object survive. 2. Explicitly reset only the test volume: fixtures disappear and migrations restore clean state.
- **Evidence:** [State/reset ownership and execution](../LOCAL-RUNTIME.md). `npm run test:runtime` passed actual D1/R2 fixed fixture writes/reads and container restart retention; disposable test-volume reset removed fixtures, startup replayed unchanged `0001_foundation.sql`, all bindings recovered. Fixed dev/test/verification projects and named volume isolation; no arbitrary volume target, dev reset or prune. Reset requires explicit test confirmation and rejects production before Docker; guard unit tests passed. Role/tenant/commercial-audit/UI/keyboard N/A for harmless fixed local probes; full environment isolation remains FND-008/010.

### FND-006 — Exercise local Workflow and Durable Object bindings
- **Status:** DONE (started/verified 2026-10-30; uncommitted working tree based on 37d4d29, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-002 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-004.
- **UI checklist:** None; no processing, bridge or Tally screen is implied by smoke success.
- **API/backend checklist:** [x] Execute one isolated Workflow smoke and one Durable Object request through real emulator bindings; keep probes dev/test-only and document emulator limits.
- **DB checklist:** None; no ingestion/job/bridge schema in foundation.
- **Verify:** 1. Observe Workflow completion and deterministic DO response. 2. Remove each binding in turn: smoke fails explicitly, with no silent fake fallback.
- **Evidence:** [Local Workflow/DO contract and limitations](../LOCAL-RUNTIME.md). `npm run local:smoke` and disposable `npm run test:runtime` observed actual emulated Workflow completion with checked output and deterministic persisted DO response; restart retained both. Each binding was removed in separate real emulator runs: smoke returned 503 `binding_unavailable` with no fallback. Local-only entrypoint, origin/host/payload guards, production-handler exclusion/build audit verified. No ingestion/Tally implementation or deployment durability claim. UI/keyboard/tenant business tests N/A; safe local diagnostics tested.

### FND-007 — Make mock-service opt-in explicit and isolated
- **Status:** DONE (started/verified 2026-10-30; uncommitted working tree based on 37d4d29, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-002 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-004.
- **UI checklist:** [x] Development mock labels are readable by assistive technology; unavailable service has explicit copy.
- **API/backend checklist:** [x] Independent extraction/Tally mock flags default off; opt-in interfaces cannot consume live credentials; production rejects either flag, without implementing those services.
- **DB checklist:** None; flags add no domain persistence.
- **Verify:** 1. Default startup and service failure never activate mocks. 2. Toggle each flag independently and inspect visible labels; production configuration fails closed.
- **Evidence:** [Independent flags and manual/browser checks](../LOCAL-RUNTIME.md). Real Docker verification exercised extraction-only, Tally-only, both-on and both-off flags; manual browser confirmed independent stub-only labels plus actual outage/recovery. Accessible named status and off/unavailable copy covered by Playwright (mock-label browser cases explicitly intercepted; manual actual container toggles were not). Unit/schema tests reject production/unconfigured/invalid mock settings; startup rejects known live credential variables and pins empty env-file/process-secret behavior. No mock extraction/fake protocol/service output implemented. No DB change or role/tenant mutation requirement applies.

## Support area: environment and health isolation (not a screen)

### FND-008 — Validate separate environment bindings and origins
- **Status:** DONE (started/verified 2026-10-31; uncommitted working tree based on c5e6c05, no new commit/PR; scope RAL-004 only)
- **Owner:** GitHub Copilot
- **Parents:** RAL-004 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-004, FND-007.
- **UI checklist:** [x] Specify nonproduction banner and distinct unprovisioned/unhealthy messages for the shell.
- **API/backend checklist:** [x] Validate dev/staging/prod binding and origin matrix, narrow CORS, required secrets and production mock prohibition; local defaults cannot use production resources.
- **DB checklist:** [x] Reject reuse of database/bucket bindings across environments; store actual resource IDs outside public evidence.
- **Verify:** 1. Test a valid matrix and deliberately shared binding: latter fails. 2. Missing secrets return actionable setup status without attempted deployment or secret disclosure.
- **Evidence:** [Environment contract, executed checks and manual validation](../ENVIRONMENTS.md). 133 unit/contract tests, typechecks/build/audits, 2 real local D1/R2 integration tests and 30 Docker built-asset Chromium tests passed. Four-way distinct D1/R2 isolation used synthetic local-only staging/production fixtures, not cloud resources. Setup checks reported dev/test configured and remote targets unprovisioned with no deployment; remote missing-binding/mock/origin cases fail closed. Actual dashboard inspected for nonproduction and mock-off labels; setup/unhealthy/staging browser cases explicitly intercepted. Docker four-binding isolated gate passed. No live credentials/resource IDs supplied; private metadata stays ignored and remote configuration/deployment remains RAL-006. No authenticated business mutation/tenant authorization claim; applicability and limits recorded.

### FND-009 — Serve safe liveness and dependency readiness
- **Status:** DONE (started 2026-10-30; verified this session; uncommitted working tree based on fb34baf, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-002, FND-004. Dependency clarification for RAL-003: consume existing guarded dev/test runtime configuration; FND-008's full staging/production isolation is a later RAL-004 gate, not a circular prerequisite for RAL-003 (RAL-004 itself depends on RAL-003).
- **UI checklist:** [x] Health failure copy distinguishes unavailable backend from a failed domain action; existing fixture controls explicitly preview-only, no claimed working domain service.
- **API/backend checklist:** [x] Reuse verified `GET /health` schema/implementation; bounded 2s D1 check, distinct shallow `/health/live`, safe JSON errors and no-store responses.
- **DB checklist:** [x] Read-only `SELECT 1`; no domain migration or sensitive query result.
- **Verify:** 1. Healthy service returns machine-readable success. 2. Disconnect a binding: readiness becomes unready without leaking stack/resource identifiers; liveness semantics remain as specified.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md): 100 unit/contract tests include missing/failing/stalled binding, same-binding readiness 503 versus liveness 200 and exception sanitization; real Docker Worker health and API JSON verified in 27 passing browser tests. Actual API outage/recovery inspected. Full resource/origin isolation remains FND-008; optional bindings report presence, with real connectivity tested separately by the isolated runtime gate. No new migration.

### FND-010 — Document forward migration and recovery safeguards
- **Status:** DONE (started/verified 2026-10-31; uncommitted working tree based on c5e6c05, no new commit/PR; scope RAL-004 only)
- **Owner:** GitHub Copilot
- **Parents:** RAL-004 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-003, FND-008.
- **UI checklist:** None; operator recovery is non-screen support.
- **API/backend checklist:** [x] Define compatibility ordering, recovery-point prerequisite and operator approval before destructive changes; no generic database abstraction or speculative services.
- **DB checklist:** [x] Record empty replay, forward upgrade and backup/restore rehearsal against disposable state; prohibit production test seeds and destructive reset.
- **Verify:** 1. Rehearse forward upgrade and restore on disposable D1: expected versions/data return. 2. Review runbook with an intentionally missing recovery point: destructive step is blocked.
- **Evidence:** [Forward migration and offline recovery runbook](../ENVIRONMENTS.md). Real disposable D1 empty/repeat/bootstrap upgrade preserved sentinel and ledger; backup → mutation → restore returned original data, and reapply remained safe. Missing/tampered/cross-target recovery points, absent stopped-runtime approval, symlinks, path escapes, nested state roots and production operations rejected. Same validated remote:false local config now drives startup and migrations. Only existing 0001_foundation.sql; no domain schema or seeds. Recovery is an offline test-only rehearsal, not cloud backup/restore; operator stop is an explicit attestation and displaced state is retained. Remote recovery prerequisites/compatibility ordering documented for RAL-006. UI/keyboard N/A for recovery; no independent sign-off/new commit or production rehearsal claimed.

## Support area: local gate and credential-gated deployment (not a screen)

### FND-011 — Run deterministic checks in untrusted CI
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-005 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-003, FND-009.
- **UI checklist:** None; browser interaction checks are separated into FND-012.
- **API/backend checklist:** [ ] Lockfile install, lint, typecheck, Vitest, production build and secret scan run on clean checkout; forks receive no deployment secrets; live integrations report skipped, not passed.
- **DB checklist:** [ ] CI provisions isolated local D1 and replays only the currently owned slice migrations.
- **Verify:** 1. Clean-checkout CI passes with recorded outputs. 2. Introduce a contract mismatch and a fake secret fixture: their respective checks fail without printing real secrets.
- **Evidence:** pending.

### FND-012 — Record the runnable local foundation gate
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003, RAL-005 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** FND-005, FND-006, FND-010, FND-011; shell browser acceptance supplied under RAL-003, not a circular completed-parent prerequisite.
- **UI checklist:** [ ] Playwright asserts loading/error boundary, skip link, focus, responsive navigation and honest placeholders; manually inspect keyboard route flow.
- **API/backend checklist:** [ ] Test SPA deep links separately from `/api/*` failures: API errors must never be HTML; collect all four emulator binding results.
- **DB checklist:** [ ] Include isolated foundation replay and persistence assertions, not future schema.
- **Verify:** 1. Clean container startup plus browser suite pass. 2. Fault API/chunk loading: retry and focus remain usable; report unavailable live integrations separately.
- **Evidence:** pending.

### FND-013 — Block deployment until trusted provisioning exists
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-006 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-008, FND-011, FND-012.
- **UI checklist:** [ ] Pipeline distinguishes skipped-unprovisioned, failed and successful deployment.
- **API/backend checklist:** [ ] Main-only deploy gate checks D1/R2/Workflow/DO provisioning, least-privilege stored token and protected production approval; no repeated unauthenticated attempts.
- **DB checklist:** [ ] Verify intended migration target/version and recovery point before allowing deploy.
- **Verify:** 1. Run without credentials: build/tests still pass and deploy explicitly skips/blocks. 2. Fork and production-mock configurations cannot access deploy credentials or deploy.
- **Evidence:** pending.

### FND-014 — Deploy one assets-and-Worker unit and smoke it
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-006 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** FND-010, FND-013; provisioned protected environment and credentials required.
- **UI checklist:** [ ] Deployed shell supports keyboard navigation and deep links identically to local.
- **API/backend checklist:** [ ] Deploy React assets and Worker together after trusted checks; verify live `/health`, origin controls and recovery procedure; unavailable live access becomes BLOCKED, never DONE.
- **DB checklist:** [ ] Apply intended environment migrations before dependent traffic; record version and protected recovery point.
- **Verify:** 1. Authorized main commit deploys and live browser/health smoke pass. 2. Rehearse failure/recovery without crossing environment bindings; retain deployment/migration identifiers securely.
- **Evidence:** pending.

## Support-area completion checklist

- [ ] Typed bootstrap: FND-001–FND-003 verified; no premature domain schema or browser secrets.
- [ ] Local runtime: FND-004–FND-007 verified against all four emulated bindings, with limitations stated.
- [ ] Environment/health: FND-008–FND-010 verified, including failure and migration recovery paths.
- [ ] Local gate: FND-011–FND-012 plus visible shell acceptance under RAL-003 accepted; no production claim inferred.
- [ ] Deployment: FND-013–FND-014 separately evidenced or explicitly blocked; no skipped deployment counted as live success.

## Suggested implementation order

FND-001 → FND-002/FND-003 → FND-004 → FND-005/FND-006/FND-007 → FND-008/FND-009/FND-010 → FND-011 → FND-012. Coordinate shell acceptance before closing RAL-005. Provisioning and FND-013/FND-014 follow separately; identity may proceed after the local RAL-005 gate without pretending RAL-006 is complete.