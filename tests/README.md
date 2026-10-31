# Foundation test boundaries

## RAL-003 shell/health acceptance

The current full suite has **27 tests**. Rebuild with the **Rallie: Docker — Start / rebuild** VS Code task, then use `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8788 npm run test:e2e -- --workers=2`. This targets the real local Worker serving production assets, D1 and SPA routing. The new [shell suite](e2e/shell.spec.ts) deliberately blocks built hashed chunks, injects a render failure, delays modules/health, checks Save-Data, mobile focus/resize, input/IME-safe shortcuts and bounded recovery. Those chunk/network assertions must not target Vite at 5174. [Evidence, limitations and manual validation](../docs/SHELL-HEALTH.md) include 100 unit/contract tests, 27 browser tests, 12 repeated focus/recovery checks, migration integration and actual isolated runtime verification. Health/clock/error interceptions are controlled fixtures; normal API/health/deep-link assertions use the real local Worker. The historical RAL-002 totals below describe that earlier delivery, not the current suite.

## RAL-002 Docker/runtime coverage

Use `npm run local:up` and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npm run test:e2e -- --workers=2` for the full **17-test** suite (explicit mock flags off). [runtime.spec.ts](e2e/runtime.spec.ts) checks real default-off runtime labels/keyboard skip navigation and intercepted independent stub-label fixtures. Native `npm run dev:api` now uses the guarded local entrypoint too.

`npm run test:runtime` builds a disposable Docker test project and exercises actual D1/R2 read/write, DO persisted requests, Workflow completion, restart, API outage, every mock-flag combination, removed Workflow/DO bindings and test-volume reset. It is not a fake binding integration and never resets dev state. Unit tests use explicit binding doubles for negative cases. [Local runtime guide/evidence](../docs/LOCAL-RUNTIME.md) records the 96-unit-test and actual Docker/manual results plus limitations.

- Vitest: `npm test` uses the root configuration for package/API source tests and script unit tests; excludes Playwright and D1 integration tests. Node 22.12+ supplies the Worker handler's standard Web APIs. API tests mock binding interfaces, not an actual D1 instance.
- D1 integration: `npm run test:migrations` runs Wrangler against an isolated real local D1 emulator, verifies replay/upgrade/version tracking, and cleans up its own temporary state.
- Playwright: use `tests/e2e` as `testDir`; base URL defaults to Vite at `http://127.0.0.1:5173`. Run `npm run build`, `npm run db:migrate -- --env dev`, and `npm run dev:api` for the Worker and built assets on 8787 with `.local/state/dev` persistence. Either start Vite with `npm run dev`, or set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787` and test the built SPA directly. The real `/health` smoke test requires D1 to be bound and reachable.
- An intercepted Playwright test deliberately exercises loading, degraded, network-error, and retry states. Other health assertions use the real local Worker through Vite's proxy.
- Quotation tests cover fixture-only arithmetic and tab behavior. They do not prove saved quotes, customer approvals, invoice correctness, or business readiness.

## Desktop workbench regressions

The twelve UI-only regressions also cover footer-only page location and help, navigation-matching hover/focus, modal Tab/Shift+Tab trapping, Escape/outside dismissal and focus return, keyboard tooltips, and Radix quotation tab activation/state retention. Headerless-shell coverage verifies sidebar page finder access in expanded/collapsed/mobile layouts and no reserved header space.

[playwright.config.ts](playwright.config.ts) targets the already-running web preview; override the origin with `PLAYWRIGHT_BASE_URL`. Install `@playwright/test` and its Chromium browser before running the suite. UI-only runs can exclude the tests named `real API health` and `API loading`, which require the Worker/D1 recovery check. This does not substitute for the full backend-enabled suite.

Coverage includes command buttons while editing (navigation shortcuts intentionally do not intercept editable controls), focus restoration, inspector/filter continuity, sidebar toggling without discarding quote edits, dashboard catalogue search with URL/reload/history, sample-product links, computed blueprint typography/geometry, and mocked progressive connection diagnostics. Overflow covers all five routes at 320, 390, 1366, 1440, and 1920 CSS px. Real backend-dependent health tests remain separate. Layout/reference evidence is recorded in [WORKSPACE-UX.md](../docs/WORKSPACE-UX.md).

The root workspace now supplies lockfile-backed installation/scripts, separate TypeScript environments, Vitest configuration, and local dev/test Wrangler D1 bindings. Run `npm run test:e2e -- --workers=2`; these tests require neither authentication nor a Tally agent. [Foundation evidence](../docs/FOUNDATION.md) records RAL-001's verified 15-test run and its explicit limitations.