# RAL-004 — environment isolation and migration recovery

## Scope and completion boundary

Verified locally on 2026-10-31 by GitHub Copilot. RAL-004 owns FND-008 and FND-010 only: environment/resource/origin validation, honest setup diagnostics, safe local migrations, and a disposable recovery rehearsal. Changes are uncommitted on base `c5e6c05`; no new commit/PR or independent review sign-off. No live Cloudflare credentials or resources were supplied and no deployment was attempted.

This is **local foundation completion**, not certification of actual cloud isolation. RAL-005 owns clean-checkout CI gates; RAL-006 owns private remote configuration generation, provisioning, protected deployment, live migrations and smoke checks. No identity, catalogue, quotation, extraction, Windows bridge, or accounting behavior is implemented here.

## Environment and resource contract

| Target | Execution | D1 / R2 | Origins | Setup state in this checkout |
|---|---|---|---|---|
| dev | Local emulator only | Distinct dev placeholder ID / local dev bucket | Explicit loopback HTTP allowlist | configured |
| test | Local emulator only | Distinct test placeholder ID / local test bucket | Explicit loopback HTTP allowlist | configured |
| staging | Future remote target | Independently provisioned D1 and private R2 | One exact HTTPS application origin | unprovisioned |
| production | Future remote target | Independently provisioned D1 and private R2 | Different exact HTTPS application origin | unprovisioned |

- [Environment matrix](../config/environments.json) is validated by [the setup checker](../scripts/environments.mjs). Both remote targets deliberately omit actual IDs, buckets and origins. Never copy local placeholders into them.
- [Local Wrangler config](../wrangler.local.json) pins D1/R2 `remote: false`. Startup and migrations validate these declarations against the matrix, including binding/database names and migration location. Migration execution uses this same config, explicit `--local`, an explicit dev/test target, and the empty committed environment file. There is no remote fallback.
- D1 IDs (including differently cased UUIDs), R2 bucket names and remote application origins cannot be shared between environments. Staging/production reject local placeholder resources, HTTP, loopback/IP origins, wildcards, credentials in URLs and URL paths. A valid matrix is configuration evidence, not proof that resources really exist or are private.
- Native state lives under separate local environment roots. Claimed state cannot be reassigned to another environment; nested claimed roots, foreign/reserved namespaces, symlink aliases and escapes are rejected. Docker uses separately named projects/volumes for dev/test, and a separate disposable verification project. Native and Docker data stores are distinct even when their logical environment name is the same.
- Extraction/Tally mocks remain independent, default off and dev/test-only. Both staging and production reject mock flags. Foundation Workflow/DO classes exist only in the local entrypoint; actual ingestion/bridge bindings and classes belong to later slices.

### Private provisioning and secrets checklist

1. Provision **separate** staging and production D1 databases, private R2 buckets and exact HTTPS application origins in the intended account. Confirm bucket public access is disabled and any future upload CORS is narrow. Do not invent IDs.
2. Copy the shape of [the provisioning example](../config/provisioning.example.json) into the ignored private provisioning location read by the checker, then fill remote records only. This override cannot replace dev/test. Resource IDs are configuration, not passwords, but remain out of public evidence. The private local directory is excluded from Git and Docker build context.
3. Keep `CLOUDFLARE_ACCOUNT_ID` and least-privilege `CLOUDFLARE_API_TOKEN` in the protected target's secret store, never in the browser, committed vars, screenshots or shell history. These are deployment inputs, not public health fields. The checker validates presence only; it does not authenticate, validate token permissions or contact Cloudflare. Do not export live credentials into the local emulator environment.
4. Run `npm run env:check -- --env staging` or `--env production`. Resolve all `issues` and `nextActions`; `unprovisioned`/`invalid` exits 2 and always reports `deploymentAttempted: false`. Dev/test checks do not require remote secrets. A dangerous resource collision anywhere invalidates the matrix.
5. **Stop here for RAL-004.** The checker does not turn private metadata into a deployable Wrangler config. RAL-006 must wire a validated target-specific configuration with `RUNTIME_ENV`, matching `APP_ORIGIN`/`ALLOWED_ORIGINS`, required bindings, explicit mock-off settings and protected approvals before live migrations/deployment. Do not directly deploy the committed unprovisioned placeholders.

## API, origin and UI behavior

[Request policy](../apps/api/src/origins.ts) allows only configured exact browser origins; it never reflects an arbitrary origin, emits a wildcard or grants credentialed cross-origin access. Current preflight allows GET/HEAD only without custom request headers; arbitrary write preflight is denied. Future authenticated mutation tickets must deliberately extend this policy together with CSRF/session tests, not bypass it. Non-safe requests require an allowed Origin; the separate local smoke harness retains its own guarded loopback-only policy.

Remote missing/malformed origin, missing D1/R2/assets binding or mock flags fail with safe 503 `invalid_configuration` before assets/probes are accessed. A configured runtime with a failing D1 probe instead returns structured degraded/unready health. Liveness remains shallow only **after configuration validation**. Health/error output excludes resource IDs, secrets, stack traces and provider exception details.

The shell displays Local development / Local test / Staging **nonproduction** labels. It distinguishes:

- **Environment unprovisioned:** setup/configuration must be repaired by an operator;
- **D1 is not configured:** structured local readiness response has no database binding;
- **D1 probe failed:** binding exists but dependency is unhealthy;
- **API unavailable:** transport unavailable (or invalid health response, with distinct explanatory copy).

Retry works with keyboard activation and restores focus to main content. Status regions retain accessible names. Remote fail-closed responses can prevent serving the SPA at all: do not expect an unprovisioned live Worker to render a banner. Browser setup/staging fixtures verify the shell when its health request encounters those states; they are not live deployments.

## Migration and recovery runbook

### Normal forward change / expand-contract ordering

1. Confirm explicit target, reviewed schema diff and owning slice. Current inventory remains **only** [0001_foundation.sql](../migrations/0001_foundation.sql); no future domain tables or production seeds were added.
2. Append a numbered migration; never rewrite an applied migration or its ledger. Use additive/nullable/compatible changes first so the previous Worker remains compatible. Prove empty replay plus upgrade from the prior delivered schema with retained sentinel data. The current previous-state test upgrades the existing pre-ledger bootstrap; future slices must add their own real previous-release fixture.
3. Before any destructive change, establish and verify a recovery point and name the operator/approval. Missing recovery point means **blocked**, not permission to reset. For cloud D1, RAL-006 must verify applicable backup/Time Travel availability, retention and restore procedure against current official provider documentation, record a recovery reference privately, and prove restoration before destructive migration. No cloud backup capability or production restore was tested here.
4. Apply reviewed compatible schema before deploying code that requires it; verify ledger and health, deploy that target's code, then smoke it. Make bounded backfills explicit and test their retries. Remove old fields only in a later reviewed migration after all old readers/writers have been retired and recovery has been rehearsed.
5. If migration fails, stop promotion, preserve errors safely and inspect the actual ledger/schema; do not assume the whole migration series rolled back. Prefer a reviewed forward corrective migration. Code rollback is allowed only if schema compatibility is proven; never blindly run reverse SQL or delete the ledger. Record the actual target/version/result.

### Local replay and version status

From repository root, with Node and dependencies installed:

```sh
npm run env:check -- --env dev
npm run env:check -- --env test
npm run db:migrate -- --env test --persist-to .local/manual-ral004-test
npm run db:migrate -- --env test --persist-to .local/manual-ral004-test
npm run db:status -- --env test --persist-to .local/manual-ral004-test
```

First apply prints the applied foundation migration and ledger; second apply reports no pending migrations and preserves data. Use a fresh unique local test directory for a fresh empty replay. These host commands do not migrate Docker volumes. Docker startup runs its migrations inside the selected container state. The runner supports only apply/status, **not seed/reset/remote/staging/production**. Existing Docker reset remains confirmation-protected and test-only, not a recovery strategy.

### Offline disposable recovery rehearsal

This helper is deliberately **test-only** and is **not a production backup tool**. Stop every Wrangler/container process using the selected state before approving. The approval is an operator attestation, not automatic process detection. Use the independent host test directory above; do not point at live dev state or a Docker-mounted store. A recovery point copies all files under that emulator state root; it does not prove a distributed D1/R2/Workflow/DO point-in-time transaction.

```sh
# Must fail before changing any data: no recovery point exists yet.
npm run db:recovery -- restore --env test --persist-to .local/manual-ral004-test --snapshot .local/backups/manual-ral004 --confirm RESTORE_STOPPED_LOCAL_TEST

# With the target stopped, create a NEW immutable recovery point.
npm run db:recovery -- backup --env test --persist-to .local/manual-ral004-test --snapshot .local/backups/manual-ral004 --confirm STOPPED_LOCAL_TEST

# Restore that test target while still stopped, then verify its versions.
npm run db:recovery -- restore --env test --persist-to .local/manual-ral004-test --snapshot .local/backups/manual-ral004 --confirm RESTORE_STOPPED_LOCAL_TEST
npm run db:migrate -- --env test --persist-to .local/manual-ral004-test
```

Choose a new snapshot name on repeats. Manifest hashes and exact target/environment must match; missing/tampered/cross-target snapshots, symlinks and missing approval block restore. Backup rejects a moving source; a failed/incomplete backup must not be used. Restore stages a copy before renaming and retains the displaced state for diagnosis; it never automatically deletes the previous state. Keep recovery data private, access-controlled and outside public evidence. Hashes detect corruption, not a malicious actor who can rewrite both data and manifest; this is not authenticated off-site backup storage.

`npm run test:migrations` is the stronger repeatable data proof: it creates a sentinel, backs up, changes its value, restores and verifies original sentinel + ledger, reapplies migrations, then cleans only its own temporary state. It also checks four distinct D1/R2 identities in a deliberately shared emulator root; staging/production names use synthetic IDs with `remote: false`, never cloud resources.

## Manual validation checklist

1. **Start:** run the VS Code **Rallie: Docker — Start / rebuild** task. Open http://127.0.0.1:8788/ (built Worker assets) or http://127.0.0.1:5174/ (Vite). Expect “Local development — nonproduction,” both services unavailable/mock off, and healthy D1. Navigate Catalogue/Settings: the environment status remains visible. Tab to skip link, press Enter, and verify focus moves to main.
2. **Setup checker:** run all four `env:check` targets. Dev/test must report configured (exit 0); unprovisioned staging/production must list missing origin/D1/R2/credential *names*, exit 2, and report no deployment attempt. Output must contain no actual token/resource values. Do not enter real credentials for this test.
3. **Origin boundary:** while Docker runs, execute the read-only requests below. Allowed dev origin returns 200 with that exact allow-origin header; test origin, foreign origin and write preflight return 403 without allow-origin. `/health` remains JSON, not the SPA.

```sh
curl -i -H 'Origin: http://127.0.0.1:5174' http://127.0.0.1:8788/health
curl -i -H 'Origin: http://127.0.0.1:5175' http://127.0.0.1:8788/health
curl -i -H 'Origin: https://foreign.example.invalid' http://127.0.0.1:8788/health
curl -i -X OPTIONS -H 'Origin: http://127.0.0.1:5174' -H 'Access-Control-Request-Method: POST' http://127.0.0.1:8788/health
```

4. **UI failure distinctions:** run **Stop API only (outage check)**, then use the Vite URL (it stays running), reload and expect API unavailable, never mock success. Run **Restart containers (preserve data)**; Tab to Retry connection, press Enter and expect recovered status/focus. Deterministic setup/D1-failure/staging states are tested with intercepted health responses, not by corrupting the dev database:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8788 npm run test:e2e -- --grep 'unprovisioned|staging banner'
```

5. **Safety rejects:** the following must exit nonzero without changing state or attempting remote access. The existing migration unit tests additionally assert no child process was started for refused arguments.

```sh
npm run db:migrate -- --env production
npm run db:migrate -- --env test --persist-to .local/state/dev
npm run db:recovery -- restore --env production
```

6. **Replay/recovery:** perform the isolated host replay/backup/restore steps above. Confirm absent snapshot blocks first; after creating the snapshot, restore and reapply succeed. Run `npm run test:migrations` for automated sentinel/upgrade/isolation proof.
7. **Binding persistence:** run **Rallie: Docker — Verify isolated test runtime**. It must pass all four binding smokes, restart retention, independent mock flags, removed-binding failures and test reset/replay, then remove only its disposable verification volume. Dev remains available.
8. **Regression:** run `npm test`, `npm run typecheck`, `npm run build`, and the complete browser suite against the running Worker. Review warnings and do not describe dry-run success as deployment.

## Executed evidence and limitations

| Executed on 2026-10-31 | Actual outcome |
|---|---|
| `npm test` | 133 tests, 12 files passed; includes unsafe origins, collisions, case-variant UUID reuse, missing secrets/resources, mock denial, path/restore guards |
| `npm run typecheck` | Boundary checks and all five package/tool TypeScript checks passed |
| `npm run test:migrations` | 2 real local integration tests passed: empty/repeat/bootstrap upgrade/ledger/sentinel restore, four-way D1/R2 isolation with synthetic local-only remote-name fixtures |
| `npm run build` | Vite build, production-entry Worker dry-run and browser/Worker audits passed; no deployment. Existing Zod annotation and >500 kB chunk warnings remain |
| Docker Start / rebuild task | Fresh source snapshot rebuilt; dev web/Worker health passed |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8788 npm run test:e2e` | 30 Chromium tests passed against Docker built assets/Worker, including real origin checks and intercepted setup/unhealthy/staging fixtures, keyboard retry and focus |
| Docker Verify isolated test runtime task | D1/R2/Workflow/DO, restart retention, outage recovery, mock combinations, removed bindings, reset/replay passed; disposable runtime cleaned |
| All four `env:check` targets | dev/test configured; staging/production unprovisioned with actionable next steps and no deployment attempt |
| Browser inspection | Actual reloaded Docker dashboard showed nonproduction label, both mocks off and reachable D1. API-only stop + Vite reload showed API unavailable (proxy returned 500, safely handled as invalid health); restart + Retry connection recovered with main focus. Keyboard retry separately verified by Playwright. No fixture presented as live staging |
| Documentation checks | Updated relative links resolve and `git diff --check` passed |

Host Node 25.9.0, Docker CLI 29.4.1, Compose 5.1.3, Wrangler 4.154.0 on macOS; Docker's pinned Node 22 runtime used for container checks. No new dependency or migration. No clean-machine install/CI run, deployed resource test, real cloud backup/restore, screen-reader certification, real AI or Windows/Tally test is claimed. Browser bundle signature scanning is not a general credential-proof mechanism. Role/tenant/business IDOR/idempotency/audit tests are N/A for this configuration-only slice (no authenticated business mutation); resource/environment negative tests substitute only for this foundation boundary, not future authorization gates. Recovery UI/keyboard N/A; shell status/retry keyboard behavior verified. Live secrets/privilege validation, remote config wiring, live migration/deployment/recovery evidence and protected approvals remain RAL-006; automated CI/release gates remain RAL-005.