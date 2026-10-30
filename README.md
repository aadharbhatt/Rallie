# Rallie

Typed npm workspace: React/TypeScript/Vite in [apps/web](apps/web/package.json), one Cloudflare Worker in [apps/api](apps/api/package.json), and small shared domain, API-contract, and server-only SQL packages. The current screens contain labeled in-memory previews, not authenticated or persisted business features.

## Local foundation

Use Node **22.12+** and npm with the committed [package-lock.json](package-lock.json). Install with `npm ci` at the repository root.

1. `npm run build` builds the web app, dry-runs the Worker bundle without deployment, and audits the browser output.
2. `npm run db:migrate -- --env dev` applies the foundation migration to local D1 and reports migration versions.
3. `npm run dev:api` serves the Worker, built SPA, and real emulated D1 at http://127.0.0.1:8787. No Cloudflare login or token is needed.
4. Optionally run `npm run dev` in another terminal for Vite HMR at http://127.0.0.1:5173; its API/health requests proxy to the Worker. Rebuild to refresh the assets served directly by the Worker.

Executable scripts use explicit Node entrypoints: the workspace path contains a colon, which otherwise breaks POSIX PATH lookup for npm executable shims.

## Verification

- `npm run typecheck`: checks architectural imports, then separately checks web, Worker, domain, API contracts, SQL package, and tooling.
- `npm test`: unit/contract tests, including deliberately forbidden browser imports and production migration guards.
- `npm run test:migrations`: isolated **real local D1 emulator** replay, repeat application, version ledger, and upgrade of the previous bootstrap state. Temporary local state is removed after the test.
- `npm run test:e2e -- --workers=2`: Chromium tests against Vite (start both servers); set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787` to test the built app directly through the Worker instead.
- `npm audit`: installed dependency advisory check. Install Chromium with `node node_modules/@playwright/test/cli.js install chromium` if it is not already available.

See [docs/FOUNDATION.md](docs/FOUNDATION.md) for boundaries, health/error semantics, migration safety, and dated acceptance evidence. [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) tracks later tickets. Docker, full resource isolation, R2/Workflow/DO runtime smoke tests, authentication, deployment and real Tally are **not completed by RAL-001**.