# Foundation test boundaries

- Vitest: include `packages/**/*.test.ts` and `apps/api/**/*.test.ts`; exclude `tests/e2e/**`. Use the Node environment (Node 22 or newer) for the Worker handler's standard Web APIs. API tests mock binding interfaces, not an actual D1 instance.
- Playwright: use `tests/e2e` as `testDir`; base URL defaults to the Vite development server at `http://127.0.0.1:5173`. Start the Worker on port 8787 with `.local/state` persistence, apply the metadata migration, and start Vite on port 5173. The real `/health` smoke test requires D1 to be bound and reachable.
- An intercepted Playwright test deliberately exercises loading, degraded, network-error, and retry states. Other health assertions use the real local Worker through Vite's proxy.
- Quotation tests cover fixture-only arithmetic and tab behavior. They do not prove saved quotes, customer approvals, invoice correctness, or business readiness.

The root owner supplies shared scripts, TypeScript, Vitest/Playwright configurations, Wrangler environments/bindings, and package installation. These tests do not require authentication or a Tally agent.