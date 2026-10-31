# RAL-003 — application shell and health evidence

## Delivery and limits

Started 2026-10-30; verified in this implementation session. Owner: GitHub Copilot. Uncommitted working tree based on `fb34baf`; no new commit/PR. The session continued across the local midnight boundary; existing RAL-001/RAL-002 evidence is not re-dated.

RAL-003 covers FND-009 and SHL-001–007, SHL-009–010. It does **not** implement authentication, membership, saved catalogue/quotes, ingestion, accounting, environment provisioning or deployment. Existing catalogue/quotation fixture interactions remain explicitly labeled previews; they do not call fictional mutation APIs or claim persisted success. Admin remains absent until a verified platform claim exists. No migration was added or changed; only the foundation migration exists.

The FND-009 dependency on the entirety of FND-008 was circular: RAL-004 owns FND-008 and depends on RAL-003. The local health ticket instead consumes the already-verified RAL-002 runtime flags. Full staging/production resources, origins and secrets remain FND-008/RAL-004. SHL-004's foundation adapter reports health, **not session authorization**; real session integration belongs to SHL-008/RAL-007. SHL-005's shell display is complete for the currently supported dev/test/production/unconfigured runtime contract; staging configuration/testing remains the RAL-004 handoff, not a fabricated supported environment.

## What changed

- [Shell](../apps/web/src/app/shell.tsx): persistent health context, runtime/readiness status on every route, explicit fixture/unavailable notices, exact five-item navigation, skip-to-main, route focus/title/current state, accessible mobile navigation, visible focus recovery on breakpoint changes. The approved 248/64px headerless workbench supersedes older 224/72px/context-bar checklist wording.
- [Navigation manifest](../apps/web/src/app/navigation.ts): module availability is explicit and is not authorization. Intent prefetch respects Save-Data. No data prefetch, PDF renderer or future domain implementation was introduced.
- [Route-local loading and render boundary](../apps/web/src/components/lazy-page.tsx), [router](../apps/web/src/app/router.tsx): loading skeletons and sanitized failures leave navigation mounted; explicit Retry attempts the current page again without reloading the document. Abandoned route completions cannot replace the selected route. Route component state may remount on retry/navigation; shell state survives. This is not a persistence guarantee for fixture quote edits.
- [Health adapter](../apps/web/src/lib/use-health.ts), [workspace status](../apps/web/src/components/workspace-status.tsx): one shell-owned request; no health refetch/splash on ordinary navigation. If initially unresolved for roughly 1s, show a static opening/readiness message; timeout at 10s offers keyboard Retry. Ready startup has no mandatory splash. API failure never silently opts into mocks. Explicit retry restores focus to main; background Dashboard refresh leaves its button focused.
- [Runtime notice](../apps/web/src/components/runtime-notice.tsx): separate extraction/Tally stub labels and unconfigured D1 versus failed D1 probe. These messages are infrastructure status, not failed business actions.
- [Keyboard help](../apps/web/src/components/command-dialogs.tsx): session-only shortcut opt-out; ordinary links/buttons remain usable. Ctrl/Cmd+K, Ctrl/Cmd+B and `?` do not intercept editable controls or IME composition. Escape remains the active modal's dismissal behavior; Radix traps/restores focus.
- [API regression coverage](../apps/api/src/index.test.ts): same unhealthy binding yields readiness 503/unready but shallow liveness 200/alive without a second D1 query or exception disclosure. Existing health/API routing implementation was reused, not replaced.

### Health contract

| Request | Expected result | Meaning |
|---|---|---|
| `GET /health/live` | 200 JSON, `status: alive` | Worker can respond; no database read/write and no dependency-readiness claim. |
| `GET /health` with reachable D1 | 200 JSON, `status: ok`, `readiness: ready` | Bounded read-only D1 `SELECT 1` probe passed. |
| `GET /health` with missing/failing/stalled D1 | 503 JSON, `status: degraded`, `readiness: unready` | `not_configured` differs from `error`; D1 probe timeout is 2s. No resource identifiers/stack traces. |
| Unknown `/api`, `/api/*` | 404 JSON error with code/message/request ID | Never HTML, even with `Accept: text/html`. |
| Browser document `/catalogue`, `/settings`, unknown UI path | SPA document | Deep links/refresh work; unknown UI route offers Dashboard recovery. |

Readiness concerns the currently required foundation D1 dependency. Optional R2/Workflow/DO entries report **binding presence only**, not connectivity or implemented features. Actual four-binding local smoke is verified separately. Health responses use no-store; invalid mock configuration is rejected upstream. Build version remains the existing package `0.0.0`, not a fabricated release identifier.

## Executed verification

Environment: macOS, existing Docker/Colima local runtime; container Node 22; Wrangler 4.154.0; Chromium Playwright. No live credentials, cloud deploy, real AI, Windows or Tally were used.

| Executed command/check | Actual outcome |
|---|---|
| `npm run typecheck` | Passed browser/Worker/domain/contract/DB boundaries, all workspace packages and tooling/tests. |
| `npm test` | **100 tests passed in 9 files**; API bindings here are explicit unit doubles. |
| `npm run build` | Vite production assets, Worker dry-run and browser/Worker audits passed. Non-blocking Zod annotation warnings and the ~503kB initial JS chunk warning remain; this is not a performance-target claim. Feature chunks are split; no PDF dependencies. |
| `npm run test:migrations` | **1 real D1 emulator integration passed**: empty replay, harmless second apply, prior-state upgrade/version ledger. Temporary isolated state cleaned up. |
| VS Code “Rallie: Docker — Start / rebuild” | Healthy web/Worker from rebuilt image snapshots. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8788 npm run test:e2e -- --workers=2` | **27/27 passed**, against the Docker Worker serving built production assets with local D1. [Shell suite](../tests/e2e/shell.spec.ts), [foundation suite](../tests/e2e/foundation.spec.ts), [runtime suite](../tests/e2e/runtime.spec.ts). |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8788 npm run test:e2e -- --grep 'shortcuts respect\|mobile drawer\|failed page chunk\|slow cold' --repeat-each=3 --workers=2` | **12/12 passed** repeated focus/recovery cases after synchronizing on modal focus restoration. |
| VS Code “Rallie: Docker — Verify isolated test runtime” (`npm run test:runtime`) | Real local D1/R2 read/write, Workflow completion, DO persistence, restart retention, outage, independent flags/default-off recovery, removed optional bindings and disposable test reset/replay all passed. Development data was not reset. |
| `git diff --check` | Passed. |

Initial browser runs exposed shared-status selector ambiguity, the newly added help checkbox in tab order, refresh focus loss, and a dialog-close test race; all were corrected and the final full/repeated suites passed. Chunk tests must target **8788**, not Vite at 5174: development source modules do not use the built hashed chunk paths. Failure injection and clocks are explicitly controlled Playwright fixtures, not claimed real network incidents.

Browser inspection used Settings at 1366×768, 1280×800, 1920×1080, 360×800 and 320×800: one h1/main, no document horizontal overflow. A 320px mobile drawer screenshot was visually inspected, with readable labels, current state, close control and focus indicator. Automated layout coverage also exercises all five routes at narrow/desktop widths. 320 CSS px is the 400%-zoom reflow surrogate; physical browser zoom and screen-reader certification are not claimed. Screenshots are session evidence, not committed golden images. Playwright retains traces only on failure; passing tests do not imply a stored success trace.

Actual manual outage: on the web origin, Settings stayed navigable after “Stop API only”; the shell said **API unavailable** and dependency readiness unknown (no mock fallback). Restart containers, wait for the real Worker health to pass, then Retry restored **Local development** and separate default-off service labels. An early retry while Worker was still starting correctly remained unavailable; it did not fabricate recovery.

### Applicability review

- DB/schema/tenant/roles: no new domain tables or authenticated API. Role/tenant negative tests are N/A for this shell-only delivery; membership wiring and authorization remain SHL-008/identity gates. Link visibility is never security.
- Commercial mutations/idempotency/audit: N/A; health is read-only and no production business command was added. Fixture edits are explicitly not saved.
- UI: loading, available preview, empty/no-match, not-found, recoverable page failure, API outage, pending refresh and keyboard retry covered. Permission/expiry and dirty commercial-data guards await their owning authenticated/persisted slices. No silent document reload is offered here.
- Local emulator evidence does not complete cloud deployment, RAL-004 isolation, RAL-005 CI, live AI or real Tally gates. No production accessibility/performance conformance claim.

## Manual validation checklist

### 1. Start and identify the correct origin

In VS Code, choose **Tasks: Run Task → Rallie: Docker — Start / rebuild**. It preserves development data. The normal development UI is [http://127.0.0.1:5174](http://127.0.0.1:5174/). For production-asset routing/chunk checks use [http://127.0.0.1:8788](http://127.0.0.1:8788/). Source changes require rebuilding the containers. Keep mock flags off.

### 2. Keyboard, routes and honest scope

1. Reload a page, press Tab then Enter on **Skip to content**: main receives visible focus.
2. Visit Dashboard → Catalogue → Quotations → Tally → Settings. Check current-link highlighting, page title, one page heading, no Admin/Compare, and preview/unavailable notices. No control should imply a real saved quotation or live accounting connection.
3. Use **Find a page**, type `settings`, use arrows/Enter; use Escape to dismiss another opening and check focus returns to its trigger. Open **Keyboard shortcuts**; Tab cycles through Close and the opt-out checkbox. Disable shortcuts: normal navigation/buttons still work. Re-enable if desired.
4. Outside text inputs try Cmd/Ctrl+K, Cmd/Ctrl+B and `?`. In catalogue search type `?` and try those combinations: typing/editing is not hijacked. Browser find/refresh/new-tab remain browser commands.
5. On the built origin, direct-load [Catalogue search](http://127.0.0.1:8788/catalogue?q=DEMO-BM-101) and [Settings](http://127.0.0.1:8788/settings); refresh. Search, navigate, and use Back/Forward: expected route/query return. Open a nonexistent UI route: safe Dashboard link remains available.

### 3. Responsive navigation

Use browser responsive mode at 360px and 320px (also check 400% browser zoom). The compact rail and content remain usable without page-wide horizontal scrolling. Activate **Open navigation**, Tab/Shift+Tab inside the drawer, Escape to return focus to the trigger. Reopen and select a page: drawer closes and focus moves to main. Resize to desktop while open: drawer closes and focus stays on a visible main region. At desktop, expand/collapse the rail and confirm current-page state is not reset merely by toggling it.

### 4. Health, JSON errors and a real outage

1. Dashboard → **Connection** should say **API responding · database reachable**. Expand **Connection details**: D1 is a read-only probe; optional bindings explicitly say presence only. Refresh must not steal focus or create a splash.
2. Open [liveness](http://127.0.0.1:8788/health/live): JSON `alive`. Open [readiness](http://127.0.0.1:8788/health): JSON `ok`/`ready`, no secrets or infrastructure IDs. Open [unknown API](http://127.0.0.1:8788/api/unknown): JSON 404 error, not the SPA.
3. **Use 5174 for the outage**, because 8788 also serves the built UI and disappears with the Worker. Open Settings, run **Rallie: Docker — Stop API only (outage check)**, then reload. Expect **API unavailable**, unknown readiness, working preview navigation, no mock success. Run **Restart containers (preserve data)**, wait until readiness is responding, then activate **Retry connection**. Expect Local development/default-off labels again. Do not use any reset-data task.

### 5. Route loading/failure recovery (built origin only)

1. Open a fresh tab at built Settings. In browser DevTools enable Disable cache. Use Request blocking to block the actual hashed **tally-…js** URL (pattern `*tally-*.js`); ensure Tally has not already loaded/prefetched. Reload Settings after adding the block if needed.
2. Navigate to Tally. Expect **This page couldn’t load**, focus on the error heading, URL still `/tally`, and a usable sidebar. Remove the block, focus **Retry page**, press Enter. Tally should load without a full document reload. A previously evaluated/cached module will not demonstrate chunk failure; use a fresh tab/reload.
3. With a slow/unresolved health request, the initial opening message appears around 1s and Retry appears by 10s; ordinary warm navigation does not replay the opening message. DevTools throttling may resolve earlier; the automated controlled-clock test deterministically verifies these thresholds.

The app remains a foundation preview after these checks. Persisted business workflows are deliberately later tickets.