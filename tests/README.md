# Foundation test boundaries

- Vitest: include `packages/**/*.test.ts` and `apps/api/**/*.test.ts`; exclude `tests/e2e/**`. Use the Node environment (Node 22 or newer) for the Worker handler's standard Web APIs. API tests mock binding interfaces, not an actual D1 instance.
- Playwright: use `tests/e2e` as `testDir`; base URL defaults to the Vite development server at `http://127.0.0.1:5173`. Start the Worker on port 8787 with `.local/state` persistence, apply the metadata migration, and start Vite on port 5173. The real `/health` smoke test requires D1 to be bound and reachable.
- An intercepted Playwright test deliberately exercises loading, degraded, network-error, and retry states. Other health assertions use the real local Worker through Vite's proxy.
- Quotation tests cover fixture-only arithmetic and tab behavior. They do not prove saved quotes, customer approvals, invoice correctness, or business readiness.

## Desktop workbench regressions

The twelve UI-only regressions also cover footer-only page location and help, navigation-matching hover/focus, modal Tab/Shift+Tab trapping, Escape/outside dismissal and focus return, keyboard tooltips, and Radix quotation tab activation/state retention. Headerless-shell coverage verifies sidebar page finder access in expanded/collapsed/mobile layouts and no reserved header space.

[playwright.config.ts](playwright.config.ts) targets the already-running web preview; override the origin with `PLAYWRIGHT_BASE_URL`. Install `@playwright/test` and its Chromium browser before running the suite. UI-only runs can exclude the tests named `real API health` and `API loading`, which require the Worker/D1 recovery check. This does not substitute for the full backend-enabled suite.

Coverage includes command access while typing, focus restoration, inspector/filter continuity, sidebar toggling without discarding quote edits, dashboard catalogue search with URL/reload/history, sample-product links, computed blueprint typography/geometry, and mocked progressive connection diagnostics. Overflow covers all five routes at 320, 390, 1366, 1440, and 1920 CSS px. Real backend-dependent health tests remain separate. Layout/reference evidence is recorded in [WORKSPACE-UX.md](../docs/WORKSPACE-UX.md).

The root owner still supplies shared installation/scripts, TypeScript and Vitest configurations, and Wrangler environments/bindings. These tests do not require authentication or a Tally agent.