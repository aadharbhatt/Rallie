# RAL-002 — Docker local Cloudflare runtime

## Start and stop

### VS Code Run and Debug / tasks

[.vscode/launch.json](../.vscode/launch.json) exposes Start/rebuild, explicit mock selection, Stop (preserve data), Smoke, isolated verification and confirmation-protected LOCAL TEST reset in the **Run and Debug** dropdown. Select an entry and click Run, or use **Run → Run Without Debugging**. Output appears in the integrated terminal. Docker must already be running. Startup and verification explicitly default both mocks off.

[.vscode/tasks.json](../.vscode/tasks.json) exposes the same commands in **Terminal → Run Task…**, plus restart containers, stop API only for a real outage check, and show recent logs. **Shift+Cmd+B** (macOS) runs the default Start/rebuild task. Paths use process arguments and explicit workspace working directories, avoiding shell parsing of spaces/colons. Test reset defaults to **CANCEL**; only explicitly choosing **DELETE_LOCAL_TEST** passes the existing test-only reset guard. No dev/production reset or automatic startup is configured.

These commands start detached containers and then finish. The end of a task/debug session is not a shutdown signal; select **Stop (preserve data)** to stop containers. Do not use the red debug Stop button to interrupt an in-progress verification cleanup. After starting, open http://127.0.0.1:5174/.

### Terminal alternative

Prerequisites: Docker Engine with Compose, and internet access for the first image/package build. On macOS, start Docker Desktop or Colima first. Host Node 22.12+ is needed only for the npm convenience/verification scripts; Node dependencies and platform-specific workerd binaries are installed inside the image with `npm ci`.

From the repository root:

1. `npm run local:up` builds and waits for healthy Worker + Vite containers.
2. Open **http://127.0.0.1:5174/** for Vite, proxied to the container Worker. **http://127.0.0.1:8788/** serves built assets directly from the same Worker.
3. `npm run local:smoke` writes/reads fixed harmless D1/R2 fixtures, requests a persisted DO marker, starts a real emulated Workflow and verifies its completed output.
4. `npm run local:down` stops/removes the containers but **preserves** the named development state volume. Start again with `npm run local:up`.

Without host npm, the equivalent startup is `docker compose --env-file config/local-vars.txt -f compose.local.yaml -p rallie-local-dev up -d --build --wait`. Logs: `docker compose --env-file config/local-vars.txt -f compose.local.yaml -p rallie-local-dev logs --tail=80 worker web`.

The Docker setup uses immutable source snapshots, **not host bind mounts**. Rerun `npm run local:up` after source/config changes. This avoids the current Docker daemon's rejection of the colon in this workspace's absolute path, and prevents host dependencies, credentials, or cached assets from entering runtime mounts. Vite still runs in the web container; use native `npm run dev:api` + `npm run dev` for live host HMR if preferred. Native API startup now uses the same guarded local binding configuration, applies migrations and serves on 8787; Vite on 5173 proxies there.

## Architecture and state

- [Dockerfile.local](../Dockerfile.local): digest-pinned Node 22 Debian slim image, system CA certificates required by workerd, lockfile-backed platform-native installation, non-root `node` user. No Docker socket, OAuth directory, host credentials or source-root mount.
- [compose.local.yaml](../compose.local.yaml): web and Worker, both loopback-published only. Container network uses `http://worker:8787`; health checks use actual HTTP readiness, not a fake successful process check. API health never claims optional bindings have been exercised.
- [wrangler.local.json](../wrangler.local.json): dev/test-only configuration for D1, private local R2, `FoundationSmokeWorkflow` and `FoundationSmokeObject`. All bindings run in Wrangler/Miniflare/workerd emulation; no unrelated SQLite/file/in-memory substitute is used.
- The named volume `rallie-local-dev_state` holds `.local/state/dev` (D1, R2, Workflow/DO emulator state). Separate fixed projects/volumes isolate ordinary local test state and disposable verification state. Native host `.local` state is separate from Docker volumes.
- Startup applies the unchanged [0001_foundation.sql](../migrations/0001_foundation.sql) through the existing guarded migration runner before serving traffic. No domain tables were introduced. D1 fixture uses one namespaced key in `foundation_metadata`; R2 and DO fixtures are fixed nonsensitive marker strings.
- [scripts/start-local-api.mjs](../scripts/start-local-api.mjs) accepts explicit dev/test only, generates ignored local runtime configuration, forces `--local`, rejects known live credential variables and invalid flags, passes a deliberately empty environment file, disables process-env secret injection and optional external `Request.cf` metadata fetching. The container forwards only explicit local flags, not host Cloudflare/AI/Tally credentials.
- [config/local-vars.txt](../config/local-vars.txt) intentionally contains no values. Both Compose and Wrangler explicitly use it, instead of automatically loading host dotenv files. Migration commands also pin this file; Wrangler's array-valued option is placed last to avoid swallowing the D1 subcommand.

This is a **development topology only**. Production remains a single Worker + Static Assets with Cloudflare-managed resources. [apps/api/src/index.ts](../apps/api/src/index.ts) is still the production entrypoint; it does not import local Workflow/DO classes or diagnostic handlers. The build audit checks their executable markers are absent. Do not deploy the local configuration manually.

## Smoke contract and safety

Only the separate local entrypoint [apps/api/src/local.ts](../apps/api/src/local.ts) exposes:

| Request | Action |
|---|---|
| `GET /api/__local/smoke` | Read marker presence from local D1/R2/DO; does not write fixtures or start a Workflow |
| `POST /api/__local/smoke` | Write fixed harmless markers, read them back, start one foundation Workflow and return its opaque local instance ID |
| `GET /api/__local/workflow/:id` | Return allowlisted local Workflow status and whether completed output matches the marker; no raw output/error/stack |

These are emulator probes, not ingestion, document-upload, pairing or Tally APIs. The POST has no request payload and accepts no arbitrary SQL, object key, customer data or secrets. Production-entry calls return JSON 404. The local handler also rejects non-dev/test configuration, foreign host/origin, unsupported method and request payload before writes. Missing bindings return 503 `binding_unavailable`; execution failure returns safe 503 `probe_failed`. Neither falls back to a fake result. Probe writes across D1/R2/DO are intentionally not a commercial transaction: partial smoke effects are safe and repeatable; no exactly-once/idempotent business operation is claimed.

Development ports accept loopback hostnames and a narrow localhost-origin list; no CORS wildcard is added. Local APIs are not an authentication boundary or a public deployment. Role/tenant/commercial-audit requirements are N/A to these fixed nonsensitive local probes; future business endpoints still require those controls.

## Independent mock flags

Both flags default **false** and accept only literal `true`/`false`:

- `RALLIE_MOCK_EXTRACTION=true npm run local:up`: extraction stub only.
- `RALLIE_MOCK_TALLY=true npm run local:up`: Tally stub only.
- Set both explicitly to enable both. Run `npm run local:up` without overrides to restore both off (unless deliberately exported in the shell).

The health DTO exposes `runtime.environment`, `runtime.extraction` and `runtime.tally`, using `unavailable` or `mock_stub`. Accessible dashboard status labels say “Mock extraction enabled — stub only; no PDF extraction” and “Mock Tally enabled — stub only; no accounting connection.” Off states say unavailable/mock off. These flags **do not implement extraction or a fake Tally protocol** and provide no fabricated products, jobs, stock, bills or successes. Stub configuration consumes no live credential/client. The API and shared schema reject any mock claim outside explicit dev/test; production/unconfigured flags fail closed with safe 503, not silently on/off. Later real-service failures cannot toggle these flags.

## Verification and reset

`npm run test:runtime` builds a fixed **disposable** `rallie-verify-test` project on web 5175/API 8789 and checks:

1. Fresh volume, migrated D1, actual ready web/API and default-off flags; all four binding slots configured.
2. Empty smoke markers, then real D1/R2 write/read, DO request and Workflow completion.
3. Container restart retains D1/R2/DO markers and completed Workflow status.
4. Stopping Worker makes Vite's `/health` proxy fail, never silently mocks service success.
5. Extraction-only, Tally-only, both-on and both-off flags independently report the correct mode.
6. Omit Workflow, then DO binding in test-only generated config: smoke returns explicit 503. These are real emulator omission runs, not binding doubles.
7. Remove **only this test project's volume**, start again, confirm fixtures disappeared and migrations restore clean state, then all binding probes work again.
8. Finally remove the disposable verification project/volume. Development state is untouched.

Ordinary persistent test environment: `node scripts/local-runtime.mjs up --env test` (5175/8789). Do not run it simultaneously with verification, which uses the same test ports but a different project/volume. Stop it with `node scripts/local-runtime.mjs down --env test`.

Explicit destructive reset for **ordinary local test state only**: `npm run local:reset:test -- --confirm DELETE_LOCAL_TEST`. The runner refuses missing confirmation, dev, production, implicit environment, arbitrary project/volume and remote flags before starting Docker. There is deliberately **no development or production reset command**; no Docker prune operation is used. Next test startup reapplies migrations. Any future production destructive operation requires the separate backup/restore and environment-isolation gates.

Regression commands: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:migrations`, and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npm run test:e2e -- --workers=2`. The complete browser suite should use a local-runtime entrypoint with mocks off; new runtime tests require the explicit local environment rather than the bare production entrypoint.

### Manual UI verification

At `/` on 5174, expect Local development, database reachable, PDF extraction unavailable/mock off and Tally unavailable/mock off. Toggle each explicit flag and Refresh: only its label should change. Stop only the worker, Refresh: API unavailable appears and prior runtime labels disappear, rather than inventing default mock status. Restore default Worker and Refresh: actual health returns. Keyboard Tab → Skip to content → Enter, command palette/dialog focus return and narrow layouts remain usable. Persisted fixture checks are intentionally in the smoke script, not a new management screen.

## Executed evidence — 2026-10-30

Owner **GitHub Copilot**; uncommitted changes based on **37d4d29**, no new commit/PR. Actual environment: macOS arm64 host Node **25.9.0**, npm **11.12.1**; Docker CLI **29.4.1**, Engine **29.2.1** on Colima linux/arm64; Compose **5.1.3**; container Node **22.23.4**, npm **10.9.9**; Wrangler **4.154.0**, Vite **7.3.7**.

| Executed | Outcome |
|---|---|
| `npm run local:up` | First local image build installed locked dependencies inside clean Linux image layers and started healthy web/API; later repeated/rebuilt successfully |
| `npm run local:smoke` | Real emulator D1/R2 read-write, persisted DO request and completed Workflow passed |
| `npm run test:runtime` | All eight lifecycle groups above passed, including real restart persistence, binding omissions, every mock combination, and reset/replay; rerun after final guard fixes also passed |
| `npm run typecheck` | Boundary checks, five package typechecks and tool config passed |
| `npm test` | **96 tests passed, 8 files** (includes foreign-origin/local-only guards, invalid/production mocks, reset/credential safety and IPv6 loopback) |
| `npm run build` | Web production build + production Worker dry-run and browser/server-marker audit passed; local handlers/classes absent; no deployment attempted |
| `npm run test:migrations` | **1 real D1 integration passed**: empty replay, repeated application, version tracking and prior-bootstrap upgrade |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npm run test:e2e -- --workers=2` | **17 passed**, no skips, against Docker web + Worker; failure/mock-label cases explicitly intercepted where stated in tests |
| `npm audit` | 0 vulnerabilities |
| `git diff --check` | Passed before final evidence update; final check recorded in delivery |

Manual integrated-browser observations on actual Docker services: dashboard showed Local development/default-off labels; extraction-only recreation showed “Mock extraction enabled” with Tally still unavailable; Tally-only recreation showed extraction unavailable with “Mock Tally enabled”; stopped Worker → Refresh showed API unavailable and removed stale mode labels. No intercepted responses were used for those manual observations. Default-off Worker was restored. Passing Playwright covers keyboard focus/skip link, dialogs, retry, all routes and 320/390 px through desktop layouts. No passing-test screenshot/trace retained; traces remain failure-only.

### Limits and applicability

- Emulator execution is real **local Cloudflare emulation**, not proof of deployed Cloudflare durability, quotas, live AI accuracy, Windows transport or accounting correctness. The Workflow/DO classes have smoke-only names and behavior.
- No schema migration beyond existing foundation metadata; no auth, tenant domain data, public customer view, persisted catalogue/quotes, real extraction, fake/real Tally protocol, bridge, pairing or commercial effects. Permissions, dirty forms, monetary idempotency, billing audits and approval concurrency are N/A to this foundation scope, not future tests counted as passed.
- No secret resources provisioned, deployment attempted, Docker production topology introduced, or complete staging/production isolation claimed (RAL-004/006 remain separate). Host OAuth state is not mounted into containers. First builds need network for base image/system/package installation; runtime is not promised to be a network sandbox.
- Workerd needed `ca-certificates` in the slim image; optional external Request.cf metadata fetch was disabled after a nonfatal local issuer warning. Zod Rollup annotation warnings are harmless dependency comments. macOS/Colima arm64 tested; no x86/Windows Docker certification or performance/conformance claim.