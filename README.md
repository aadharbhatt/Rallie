# Rallie

Typed npm workspace: React/TypeScript/Vite in [apps/web](apps/web/package.json), one Cloudflare Worker in [apps/api](apps/api/package.json), and small shared domain, API-contract, and server-only SQL packages. The current screens contain labeled in-memory previews, not authenticated or persisted business features.

## Local foundation

### Recommended: Docker with all four emulated bindings

With Docker/Compose running, use `npm run local:up`. Open http://127.0.0.1:5174/ (web) or http://127.0.0.1:8788/ (Worker + built assets). `npm run local:smoke` exercises real local D1/R2/Workflow/DO bindings; `npm run local:down` preserves development state. `npm run test:runtime` runs isolated restart/reset/mock/failure checks and cleans up only its own disposable test state.

**VS Code:** open **Run and Debug** (Shift+Cmd+D on macOS), choose **Rallie: Docker — Start / rebuild**, then click the green Run button or use **Run → Run Without Debugging**. The dropdown also exposes Stop, Smoke, isolated verification, explicit mock-mode prompts and confirmation-protected local test reset. **Terminal → Run Task…** has these plus Restart, Stop API only and recent logs. Shift+Cmd+B runs the default Start / rebuild task. Docker stays running after startup finishes; use the explicit **Stop (preserve data)** entry to shut it down, not the debug Stop button.

See [docs/LOCAL-RUNTIME.md](docs/LOCAL-RUNTIME.md) for prerequisites, independent default-off mock flags, reset confirmation, diagnostics, manual checks and actual RAL-002 evidence. Source changes require `npm run local:up` to rebuild the Docker snapshots; no host credential/source-root mounts are used.

### Native alternative

Use Node **22.13+** and npm with the committed [package-lock.json](package-lock.json). Install with `npm ci` at the repository root.

1. `npm run build` builds the web app, dry-runs the Worker bundle without deployment, and audits the browser output.
2. `npm run db:migrate -- --env dev` applies the foundation migration to local D1 and reports migration versions.
3. `npm run dev:api` applies migrations and serves the guarded local Worker, built SPA and all four real emulated bindings at http://127.0.0.1:8787. No Cloudflare login or token is needed.
4. Optionally run `npm run dev` in another terminal for Vite HMR at http://127.0.0.1:5173; its API/health requests proxy to the Worker. Rebuild to refresh the assets served directly by the Worker.

Executable scripts use explicit Node entrypoints: the workspace path contains a colon, which otherwise breaks POSIX PATH lookup for npm executable shims.

## Verification

- **Full CI-equivalent local gate:** `npm run verify:foundation`, or **Terminal → Run Task… → Rallie: Foundation — Full local gate (CI equivalent)**. Requires Docker/Compose and installed Chromium. Reinstalls from the lockfile, runs lint/scan/types/tests/migrations/build and both 30-test browser targets inside isolated test Docker, then binding persistence/failure checks. Dev state is preserved. See [docs/FOUNDATION-GATE.md](docs/FOUNDATION-GATE.md) for artifacts, prerequisites, manual steps and the still-pending hosted CI acceptance.
- `npm run lint` and `npm run check:secrets`: TypeScript/React/script lint and redacted source signature checks. Passing scans are not comprehensive proof of credential absence.
- `npm run typecheck`: checks architectural imports, then separately checks web, Worker, domain, API contracts, SQL package, and tooling.
- `npm test`: unit/contract tests, including deliberately forbidden browser imports and production migration guards.
- `npm run test:migrations`: isolated **real local D1/R2 emulator** replay, repeat application, version ledger, bootstrap upgrade, offline restore and four-environment binding isolation (remote-name fixtures remain local-only). Temporary test state is removed afterward.
- `npm run env:check -- --env dev|test|staging|production` (choose one target): validate environment isolation and report missing setup without deploying. See [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) for private provisioning, forward migration/recovery safeguards and manual validation.
- `npm run test:e2e -- --workers=2`: Chromium tests against native Vite (start both servers); set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174` for Docker, or `http://127.0.0.1:8787` to test native built assets directly through the local Worker. Keep explicit mock flags off for the full suite.
- `npm audit`: installed dependency advisory check. Install Chromium with `node node_modules/@playwright/test/cli.js install chromium` if it is not already available.

See [docs/FOUNDATION.md](docs/FOUNDATION.md) for RAL-001 boundaries, contracts and dated evidence; [docs/LOCAL-RUNTIME.md](docs/LOCAL-RUNTIME.md) records RAL-002's Docker/runtime extension. [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) records RAL-004 local environment/recovery evidence. [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) tracks later tickets. Live cloud provisioning/isolation, authentication, deployment and real AI/Tally remain separate gates.