# RAL-005 — automated foundation gate

## Scope, status and remaining acceptance

Implemented 2026-10-31 by GitHub Copilot, scoped to FND-011 and FND-012. Uncommitted working tree based on `92b629c`; no new commit/PR, hosted workflow URL or independent sign-off. The complete **local** gate passed, including a clean source-only Node 22 Linux container check. **Hosted GitHub Actions execution on a committed clean checkout remains pending.** FND-011/RAL-005 therefore remain IN_PROGRESS rather than claiming the hosted CI acceptance passed. FND-012's runnable local gate is verified.

Implemented:

- Root lockfile install, ESLint TypeScript/JavaScript and React Hooks checks, architectural boundaries/typechecks, Vitest/negative contracts, source credential signatures, real migration/recovery/isolation integration, web/Worker dry-run and bundle audits.
- A single [foundation runner](../scripts/foundation-gate.mjs), exposed by `npm run verify:foundation` and **Terminal → Run Task… → Rallie: Foundation — Full local gate (CI equivalent)**. It is not a Run and Debug dropdown action. Existing default build task remains Docker Start / rebuild.
- Isolated Docker web/API and real local D1/R2/Workflow/DO, Chromium against both built Worker assets and Vite, restart persistence, outage, independent mock flags, removed-binding failures and test reset/replay.
- [GitHub Actions workflow](../.github/workflows/foundation.yml): pull requests, main pushes and manual dispatch, read-only repository permission, no persisted checkout credentials, pinned action commits, Node 22.23.4, Chromium dependency installation, bounded job, always-uploaded allowlisted reports and explicit live-integration skips. No `pull_request_target`, deployment secret reference, protected environment or deployment step.
- Negative controls construct a fake token without embedding a real secret, prove redacted failure, actually invoke TypeScript on an incompatible health contract, assert fail-fast summaries and inspect workflow/task safety.

Not implemented/claimed: RAL-006 cloud provisioning/protected deployment/live migrations/recovery, identity or domain functionality, real AI extraction, Windows/Tally, accounting correctness, or physical assistive-technology certification. No new migration or future domain schema. Existing health/contracts and shell behavior are reused, not relabeled as new domain features.

## Run prerequisites and behavior

Use Node **22.13+** (CI/container evidence uses 22.23.4), npm, Docker with Compose, enough free ports 8789/5175, and Chromium. Install browser prerequisites once:

```sh
npm ci
node node_modules/@playwright/test/cli.js install chromium
```

Linux without browser libraries: use `install --with-deps chromium` instead. Docker must be running; do not run two gates or another ordinary test runtime on the same ports concurrently. Dev ports 8788/5174 and their persistent volume are separate and are not stopped/reset by the gate. The full command deliberately reinstalls root dependencies with `npm ci`; avoid concurrent development commands that use the same dependency tree during installation.

```sh
npm run verify:foundation
```

The runner has **no skip, remote or deploy option**. It rejects known live credential environment variables before executing checks, forces default-off mock flags and disables Cloudflare process-secret/remote-fetch behavior. Local private provisioning/credentials must remain out of the committed source and Docker context. Signature scans are supplemental, not comprehensive secret detection or token validation.

Execution order:

1. `npm ci --no-audit --no-fund` (frozen root lockfile; install errors stop the gate).
2. `check:secrets`, `lint`, `typecheck`, `test`.
3. `test:migrations`: empty/repeat/bootstrap upgrade/ledger/sentinel restore, four distinct local D1/R2 identities (remote-name fixtures remain synthetic and remote:false).
4. `build`: Vite assets, production-entry Worker **dry-run only**, browser/Worker bundle audits.
5. `test:runtime -- --browser`: fresh disposable test Docker project; default-off readiness/all bindings; 30 Chromium tests at Worker 8789, then 30 at Vite 5175; binding persistence and outage/mock/failure/reset checks; test volume cleanup in finally.

The first failed stage exits nonzero and is recorded as **failed**, not a skipped/passed live integration. Docker stage failures retain browser reports/traces and print bounded local logs before normal cleanup. Abrupt process termination/host crash can prevent finally cleanup; rerun the gate to reclaim only its fixed verification project. This gate intentionally does not add a generic cleanup command that could delete dev resources.

## Artifacts and security boundary

- The ignored gate summary records source commit, dirty-working-tree flag, timestamps, completed check outcomes, explicit live skips and `deploymentAttempted: false`. A dirty run is never represented as a clean commit. Interrupted runs can remain `running`; they are not success.
- Browser JUnit/HTML/trace output is separated into **worker** and **web** target directories. Traces are retained for success and failure to make local evidence inspectable; normal ad hoc browser runs still retain failures only. The runner clears only these named report directories before each run to avoid stale success artifacts.
- Actions uploads **only** the gate summary plus root browser test-results/report directories, with hidden summary inclusion and seven-day retention. It does not upload local databases, buckets, recovery points, private provisioning or the whole local state directory. Traces contain fixture UI/network data; do not run these tests with real customer data or credentials.
- Source scan checks Git-tracked (even if newly ignored) and nonignored untracked files; source archives use explicit directory exclusions. It prints only JSON-escaped file/rule metadata, never matching source or credential text. It covers selected private-key/AWS/GitHub/provider assignments and private-config filenames, not arbitrary/high-entropy secrets or Git history. Do not treat a green scan as proof that no credential can exist.
- Untrusted PRs run tests without deployment secrets. GitHub may require approval for first-time fork contributors. Read-only token and pinned actions reduce risk; a malicious PR can change its own test code/workflow, so branch protection and trusted review remain repository-owner controls.

Inspect reports from root after the gate:

```sh
node node_modules/@playwright/test/cli.js show-report playwright-report/worker
node node_modules/@playwright/test/cli.js show-report playwright-report/web
```

Run one report server at a time; stop it with Ctrl+C. Open a retained trace from the report. Reports are ignored generated files, not committed acceptance evidence.

## Findings fixed while verifying

The first complete run intentionally did not hide failures: Worker tests passed, but Vite failed four browser cases. Vite's default CORS injected an allow-origin header into Worker denials; [Vite config](../apps/web/vite.config.ts) now leaves API CORS to the Worker. Shell fault tests formerly matched only built hashed chunks; [the shell suite](../tests/e2e/shell.spec.ts) now intercepts real modules in built and source modes. All 30 cases run in each mode with **no skip/retry used to hide these failures**.

ESLint surfaced one existing unused recovery import, removed without behavior change. Tooling uses supported ESLint 10 / typescript-eslint / React Hooks plus YAML test parsing. The minimum Node patch is raised from 22.12 to 22.13 for ESLint 10 compatibility; Docker already runs a newer 22 patch. `minimatch` is overridden to patched 11.0.1+ for GHSA-g3hv-75wg-m249; actual lint/glob consumers and fresh lockfile install were exercised. Dependency audit reported zero advisories after resolution. No production dependency was added.

## Executed evidence — 2026-10-31

| Check | Result and boundary |
|---|---|
| Full local gate, VS Code process task | Passed all 8 stages, dirty source based on 92b629c. Final summary passed; no deployment attempted |
| Unit/contracts | 139 passed in the full gate; follow-up task discoverability assertion raises the final unit inventory to 140 |
| Lint/source signatures/boundaries/types | Passed, including actual synthetic-secret failure with redacted output and TS2322 contract mismatch rejection |
| Migration/storage integration | 2 passed against real local emulators: replay/repeat/upgrade/restore and four-identity D1/R2 isolation |
| Chromium Worker / Vite | 30 + 30 passed, zero failed/skipped; separate root JUnit/HTML reports and retained traces |
| Docker binding gate | All four binding smoke results, restart retention, API outage/recovery, four mock combinations, removed Workflow/DO failures, disposable reset/replay passed; verification containers/volume removed, dev still running |
| Clean Linux source-only image | Dockerfile lockfile installation and core lint/signature/type/unit/migration/build checks passed as nonroot Node 22 with `--network none`, no host state/source mounts. This is clean-container reproducibility, **not hosted clean-checkout CI evidence** |
| Dependency audit | `npm audit --audit-level=moderate`: zero vulnerabilities after patched override |
| Action pins | All three referenced commit SHAs resolved via read-only GitHub API |
| Browser manual observation | Fresh built-Worker Settings page: keyboard skip link focused main; keyboard Catalogue link navigated and focused main. Existing shared Vite tab stalled under integrated automation, so it was not counted as manual keyboard evidence; automated Vite Chromium suite passed |
| Hosted Actions run | **Not run**: modified source/workflow uncommitted and unpushed. Requires operator-approved commit/push and run URL/results before closing FND-011/RAL-005 |

Host macOS Node 25.9.0, Docker CLI 29.4.1/Compose 5.1.3, Wrangler 4.154.0; Linux container Node 22.23.4. Existing Zod annotation and >500 kB chunk warnings remain; performance/physical screen-reader release gates are not certified. No external service credential or private business dataset was supplied. UI/role/tenant/idempotency/audit mutations are N/A for this CI support slice; existing environment/security negatives and shell keyboard coverage are exercised, not substituted for future authenticated tenant tests.

## Manual validation

1. **Find the action:** Terminal → Run Task… → **Rallie: Foundation — Full local gate (CI equivalent)**. This task is in [the workspace task list](../.vscode/tasks.json), not Run and Debug. Or run `npm run verify:foundation` from root.
2. **Check result:** expect eight passing stages, 30 tests for each browser target, D1/R2/Workflow/DO output, explicit `SKIPPED` cloud/AI/Windows integrations, and final `passed`/no deployment. A nonzero command means failure even if earlier tests passed. Look at summary and reports; do not infer success from files merely existing.
3. **Inspect artifacts:** open each report with the commands above. Check real health/deep links, mobile focus, chunk/render failure recovery, slow API retry and foreign-origin rejection. Confirm no skipped browser tests and inspect a trace.
4. **Rerun:** run the gate again; it must pass with fresh verification state, preserve dev data, clear stale named reports, and clean its own verification volume. Host network/package install failures remain real failures, not automatic mock fallback.
5. **Negative controls:** run `npm test -- --run scripts/foundation-gate.test.mjs`. Expect all tests passed because they observed a deliberately failed mocked gate, redacted fake secret and a rejected TypeScript mismatch. Their printed synthetic `failed` summary is test-owned, not the real outer gate summary. Do not paste a real token to test scanning.
6. **Keyboard sanity:** start/rebuild dev via Terminal task, open http://127.0.0.1:8788/settings, Tab to Skip to content → Enter, then keyboard-activate Catalogue. Expect main focus and Catalogue heading, visible preview/nonproduction copy. On a narrow viewport, open navigation, Tab within it, Escape and verify trigger focus.
7. **Actual outage:** Terminal → Run Task… → **Rallie: Docker — Stop API only (outage check)**; reload Vite http://127.0.0.1:5174/ and expect API unavailable. Run **Restart containers (preserve data)**, then keyboard-activate Retry connection. These are Terminal tasks, not debug actions. Chunk faults are reproducibly exercised by the tests, not by deleting built files.
8. **Hosted acceptance (remaining):** review/commit/push the changed workflow, source and root lockfile to an approved branch and open a PR or merge to main according to repository policy. In GitHub **Actions → Foundation checks (no deployment)** inspect the run: Node/browser install, all gate stages, uploaded reports/summary, live skips and absence of deployment jobs. Record the run URL, commit, test totals and artifact names in FND-011/RAL-005, then mark DONE only if the clean-checkout run passed. Do not commit generated reports/private state or add credentials to make this foundation workflow green.