# Shell and Dashboard — screen-first tickets

Sources: [parent requirements](../IMPLEMENTATION.md), [design inventory, shell, H1 and loading specifications](../DESIGN.md). The 80 parent requirements remain authoritative. These tickets add implementable increments, not completion claims. Target one observable behavior per ticket, normally at most half a day after prerequisites. All source security, accessibility, responsive and evidence rules are inherited.

## Current layout direction

29 October refinement: no top route breadcrumb or duplicate sidebar help. Current-page path is bottom-left; Keyboard shortcuts only bottom-right. Both footer items share navigation highlight/focus styles. Use the Radix dialog/tooltip foundation and Radix quotation tabs rather than custom focus-management primitives. Keep the current page and shortcuts label visible at narrow widths.

Follow [Desktop workbench](../WORKSPACE-UX.md): 248/64 px rail with page finder and collapse toggle, no top header row, 29 px status strip, centered 880 px start page, 36 px regular heading, working product search, and rounded task shortcuts. Keep 14 px reading text and 12 px metadata; remove repeated overlines/metrics/badges. Finder remains accessible in collapsed/mobile rails. Keyboard and preloading remain. Authenticated identity, saved preferences, business-safe restoration, and production activity remain separate gates; no invented business KPIs.

## Explicit parent mapping

- RAL-001 → SHL-001, SHL-004 (minimal accessible entry).
- RAL-002 → SHL-005 (truthful local/mock context only).
- RAL-003 → SHL-001–SHL-007, SHL-009–SHL-010.
- RAL-004 → SHL-005 (nonproduction/unprovisioned context only).
- RAL-005 → SHL-010 (browser evidence for local foundation gate).
- RAL-007 → SHL-004, SHL-008 (session integration only).
- RAL-008 → SHL-008 (authorized business context only).
- RAL-018 → SHL-011–SHL-014.
- RAL-019 → SHL-014 (dashboard evidence consumed by catalogue gate).

Shell delivery under RAL-003 precedes identity; do not make foundation routing depend on complete auth. Initially inaccessible modules are honest placeholders. Real membership wiring arrives in SHL-008. Quotes, ingestion, Tally and admin are **navigation/unavailability only** here: no schemas, operational implementations, invented counts or claims that those slices are complete. Backend contracts described as proposed must be finalized with fixtures. Parent gates require accepted evidence; none imply nonexistent cross-file child dependencies.

## Authenticated application shell — navigation and layout

### SHL-001 — Render the exact primary navigation and page landmarks
- **Status:** DONE (started 2026-10-30; verified this session; uncommitted working tree based on fb34baf, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-001, RAL-003 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** Parent gate RAL-001; local emulator startup evidence under RAL-002.
- **UI checklist:** [x] Exact five-item navigation, no Admin/Compare/charts; skip link, nav/main/page-heading semantics, one h1/current route/title. Headerless workbench contract retained.
- **API/backend checklist:** [x] Manifest explicitly identifies foundation/fixture/information/unavailable modules; previews disclose no authenticated business or persisted mutation. Link visibility is not authorization.
- **DB checklist:** None; static navigation introduces no domain tables.
- **Verify:** 1. Tab from page start: skip link reaches main and every link has visible focus/current state. 2. Open each route: correct heading/title and honest availability; no fake domain action.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); 27/27 browser tests including skip focus, route/title/current state, preview notices and real API health. No domain DB/roles/tenant surface; authorization deferred to SHL-008.

### SHL-002 — Adapt the rail and navigation drawer without losing focus
- **Status:** DONE (started 2026-10-30; verified this session)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001.
- **UI checklist:** [x] Superseding 248/64px headerless workbench; explicit mobile navigation dialog/button, labels/expanded state, trapped/restored focus and visible-target recovery on resize. Radix isolates background tab stops.
- **API/backend checklist:** None; responsive presentation must not issue mutations or refetch entire business datasets.
- **DB checklist:** None; optional collapsed-rail preference must not become business data.
- **Verify:** 1. Keyboard resize through desktop/tablet/360px and 320 CSS px/400% zoom: logical focus survives. 2. Navigation opens/closes by keyboard and touch, controls are not obscured by sticky regions or virtual keyboard.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md): 320/360px mobile and desktop reflow, dialog Tab/Escape/selection/resize, sidebar state retention; actual 320px screenshot inspected. 320 CSS px is a zoom-reflow surrogate, not a physical 400%/screen-reader certification claim. No API mutation/DB.

### SHL-003 — Restore routes and non-secret navigation state
- **Status:** DONE (started 2026-10-30; verified this session)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001.
- **UI checklist:** [x] URL/query reload and Back/Forward, not-found Dashboard recovery, meaningful main focus on route change, no focus steal on health refresh.
- **API/backend checklist:** [x] Built Worker SPA deep links versus JSON `/api`/`/api/*` errors verified with HTML Accept header; navigation adds no private/token data or analytics.
- **DB checklist:** None; route state is not a browser database replica.
- **Verify:** 1. Direct-load and refresh Catalogue/Settings paths then Back/Forward: expected route restored. 2. Request unknown API path: JSON error, not HTML; inspect URL/telemetry for secret absence.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); real built-asset direct links/refresh and fixture search history pass; no browser DB replica or domain schema.

## Cold-start and route-state surfaces

### SHL-004 — Show cold-start recovery only while critical bootstrap is unresolved
- **Status:** DONE for RAL-003 foundation adapter (started 2026-10-30; verified this session); RAL-007 real session integration remains TODO and is not implied by this status.
- **Owner:** GitHub Copilot
- **Parents:** RAL-001, RAL-003, RAL-007 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001; use controlled bootstrap fixtures before Parent gate RAL-007, then verify real session integration.
- **UI checklist:** [x] Static mark/opening status only after ~1s unresolved initial health; 10s timeout with Retry, no minimum/warm-navigation splash. Sign-in recovery N/A until identity exists.
- **API/backend checklist:** [x] Safe shared health adapter, 10s bound/one explicit retry attempt, no mutations. Readiness is not session authorization; UI explicitly says authentication is unimplemented. Real unknown/signed-out session handling remains RAL-007.
- **DB checklist:** None; bootstrap uses existing session contract once identity lands.
- **Verify:** 1. Delay/fail bootstrap with controlled clock: truthful status/recovery appears. 2. Ready startup, warm route changes and background refresh show no splash; keyboard recovery works without motion.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); controlled-clock delayed/failed/ready bootstrap and keyboard recovery test, plus actual outage; real identity/session handoff is explicitly deferred, not mocked as authenticated.

### SHL-005 — Display truthful environment and unavailable-service context
- **Status:** DONE for current runtime/shell contract (started 2026-10-30; verified this session); RAL-004 staging/resource-isolation integration remains TODO.
- **Owner:** GitHub Copilot
- **Parents:** RAL-002, RAL-003, RAL-004 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001; environment validation and health contract evidence under RAL-004/RAL-003.
- **UI checklist:** [x] Runtime notice on every route; independent stub labels, unknown API state, missing versus failed D1; readable text and no private data in notifications.
- **API/backend checklist:** [x] Validated health/runtime DTO and default-off upstream production mock rejection reused; no resource/account IDs. Staging is not yet a supported runtime value and is reserved to FND-008, not fabricated here.
- **DB checklist:** None; status display requires no domain persistence.
- **Verify:** 1. Simulate dev, staging, missing binding and disconnected API: correct copy and accessible status. 2. Production mock configuration is rejected upstream rather than displayed as ready.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); 27 browser tests include default/independent labels, missing/failed D1 outside Dashboard; real outage/recovery and isolated flag/binding runtime tests passed. RAL-004 environment matrix remains separate.

### SHL-006 — Lazy-load non-current modules without eager heavy dependencies
- **Status:** DONE (started 2026-10-30; verified this session)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)); design §14.
- **Depends on:** SHL-001, SHL-003.
- **UI checklist:** [x] Persistent shell/current-route module with static/reduced-motion skeleton; no navigation splash/minimum animation.
- **API/backend checklist:** [x] Feature chunks split; intent prefetch respects Save-Data; no PDF imports, review/Admin/public implementation, or bulk domain data prefetch. Tally stays informational only.
- **DB checklist:** None; code splitting must not add persistence or bulk prefetch data.
- **Verify:** 1. Inspect production build/network: non-current chunks absent at boot, no PDF imports. 2. Navigate with Save-Data: no eager all-route prefetch; current shell remains responsive.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); built Worker request inspection proves non-current feature chunks absent at boot and Save-Data focus does not prefetch; delayed real chunk shows shell/skeleton. ~503kB initial JS warning recorded, no performance claim.

### SHL-007 — Recover a failed lazy route without discarding the shell
- **Status:** DONE (started 2026-10-30; verified this session)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-006.
- **UI checklist:** [x] Route-local chunk/render boundary preserves shell; one explicit Retry retains route/document, error heading and successful recovery receive meaningful focus. No full-reload action, hence no silent reload/dirty-data loss. Real authorized/dirty commercial state N/A before identity/persistence.
- **API/backend checklist:** [x] Page module failure distinct from health/API state; stale module completions ignored on unmount, one attempt per Retry. Browser imports are not forcibly abortable; late results cannot replace selected route.
- **DB checklist:** None; failures cannot create or reset domain data.
- **Verify:** 1. Block a chunk: shell still navigable and keyboard Retry recovers after unblocking. 2. Retry amid dirty fixture state: no silent full reload, no focus jump on unrelated refresh.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); blocked/unblocked built chunk recovers with retained document sentinel; render canary hidden from DOM, navigation survives; delayed old module cannot replace new route. Shell state preserved, fixture page state is not promised durable.

## Business/account context and settings navigation

### SHL-008 — Wire authorized business, account and role-specific navigation
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007, RAL-008 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001, SHL-003; Parent gate RAL-007; membership resolver and switch acceptance under RAL-008.
- **UI checklist:** [ ] Display safe business/name/role context and account/help menu; switch only permitted memberships after dirty resolution; Employee sees safe Business details but not employee/Tally-management controls; Admin requires separate platform claim.
- **API/backend checklist:** [ ] Use authenticated `GET /api/session` capabilities, not local role claims; direct routes retain server authorization; removed membership clears scoped caches before neutral recovery.
- **DB checklist:** None beyond identity-owned reads; no navigation-specific roles.
- **Verify:** 1. Owner/Employee/admin-without-membership navigate by keyboard: only allowed links and own account/preferences. 2. Revoke/switch membership: old business cost data never flashes; hidden-link bypass is still denied.
- **Evidence:** pending.

### SHL-009 — Expose safe keyboard navigation and help entry points
- **Status:** DONE (started 2026-10-30; verified this session)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)); design §6.
- **Depends on:** SHL-001, SHL-002.
- **UI checklist:** [x] Footer help/shortcut registry, ordinary keyboard links/buttons, session-only opt-out; no shortcut interception during input/contenteditable/IME; Radix focus trap/return. No saved user preference or roles invented.
- **API/backend checklist:** None for basic keyboard navigation; consume own-user shortcut preferences only after identity settings exist, with safe disabled/default behavior beforehand.
- **DB checklist:** None; preference persistence belongs to access/settings, not shell.
- **Verify:** 1. Complete route navigation without mouse, then with shortcuts disabled. 2. Type shortcut-like characters during input/composition: no route change; Escape closes only active dismissible surface.
- **Evidence:** [RAL-003 evidence](../SHELL-HEALTH.md); browser tests cover shortcuts/opt-out/composition, input-safe Cmd/Ctrl+K/B/?, browser shortcuts left alone, dialog Tab/Shift+Tab/Escape/return. Four timing-sensitive cases repeated three times (12/12).

### SHL-010 — Capture the shell browser acceptance handoff
- **Status:** DONE (started 2026-10-30; verified this session; uncommitted working tree based on fb34baf, no new commit/PR)
- **Owner:** GitHub Copilot
- **Parents:** RAL-003, RAL-005 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001–SHL-007, SHL-009; foundation API/emulator smoke evidence under RAL-002/RAL-003. SHL-008 is a later identity extension, not a foundation blocker.
- **UI checklist:** [x] Skip/current route, deep links, mobile drawer/resize, loading/error/retry focus and reduced-motion tests; browser inspection at required desktop widths plus 360/320px reflow surrogate. Physical zoom/screen-reader certification not claimed.
- **API/backend checklist:** [x] Machine-readable health/live and unknown API JSON; actual built feature chunk loading/blocking/retry/network assertions via Worker, not Vite or screenshots alone.
- **DB checklist:** None; reuse isolated foundation fixture without future domain schemas.
- **Verify:** 1. Run shell Playwright suite on clean local startup: assertions pass. 2. Review keyboard trace and build/network evidence; hand results to RAL-005 without implying live deployment.
- **Evidence:** [RAL-003 evidence and manual checklist](../SHELL-HEALTH.md): 27/27 full browser checks, 12/12 repeated recovery checks, 100 unit/contracts, typecheck/build/audit, D1 integration and isolated actual Docker bindings passed. Screenshot visually inspected in session; no passing trace claimed. Handoff is local only, not RAL-005 CI or deployment completion.

## H1 — Dashboard

### SHL-011 — Return tenant-scoped catalogue attention counts
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-018 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** Parent gate RAL-017; SHL-008.
- **UI checklist:** [ ] Define catalogue card count, freshness and “No price updates to review” zero copy; Review updates links to C4.
- **API/backend checklist:** [ ] `GET /api/dashboard` returns preaggregated catalogue newer-price count plus generated-at/availability metadata; resolve business server-side and exclude unpublished/future-ineligible versions according to approved policy.
- **DB checklist:** [ ] Compare seller active version with latest eligible approved version, not client price amounts; test query plan and add covering index only if justified.
- **Verify:** 1. Two businesses with different active versions receive different correct counts. 2. Foreign business/cursor injection cannot change scope; no full catalogue download or cross-tenant costs.
- **Evidence:** pending.

### SHL-012 — Render four compact work cards with honest availability
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-018 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-011.
- **UI checklist:** [ ] Catalogue updates, Quotations open/approved, PDF processing/review, Tally company/connection/last-sync in fixed two-column order/single column narrow; unavailable means unavailable, not zero; Owner-only setup link is gated.
- **API/backend checklist:** [ ] Dashboard response gives each future module `availability` and nullable data, not fabricated counts; define later handoffs to RAL-026, RAL-041/RAL-046 and RAL-071 without implementing their endpoints/tables.
- **DB checklist:** None beyond catalogue query; do not query or create future quotes, extraction or connections tables.
- **Verify:** 1. At 1366×768 all four compact cards fit first view; keyboard reaches permitted ordinary links. 2. Unsupported modules show explicit unavailable state; Employee cannot reach owner setup via card or direct route.
- **Evidence:** pending.

### SHL-013 — Retry one dashboard card without resetting the others
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-018 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-011, SHL-012.
- **UI checklist:** [ ] Per-card loading/zero/error/retry and last-success freshness; retained geometry, stable card order, no focus movement on refresh, no charts or trend percentages.
- **API/backend checklist:** [ ] Finalize per-module error envelope and bounded `GET /api/dashboard?module=catalogue` retry contract or equivalent scoped partial refresh; one module failure must not erase successful results or weaken membership checks.
- **DB checklist:** None; reuse aggregate query and do not cache counts across tenants.
- **Verify:** 1. Inject one card failure: other cards stay usable; keyboard retry changes only failed card. 2. Switch business during retry: abort/discard stale response, with no prior count flashed.
- **Evidence:** pending.

### SHL-014 — Verify dashboard drift and navigation after price adoption
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-018, RAL-019 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-011–SHL-013; Parent gate RAL-017.
- **UI checklist:** [ ] Keyboard Review updates → authorized product → explicit adoption → Dashboard shows correct refreshed count and timestamp; unavailable later-module links stay honest.
- **API/backend checklist:** [ ] Regression covers both roles, two tenants, stale fetches and partial errors; adoption invalidates only relevant business count, not unrelated cards or businesses.
- **DB checklist:** [ ] Assert dashboard count against underlying overlays before/after adopt; no automatic seller movement on global publication.
- **Verify:** 1. New global version increases drift without changing seller price; deliberate adoption removes the applicable drift. 2. Run two-tenant and card-state suite; record UI/aggregate evidence for RAL-019.
- **Evidence:** pending.

## Screen-level completion checklist

- [ ] Shell navigation/layout: SHL-001–SHL-003, SHL-009 verified by keyboard, deep link and responsive tests.
- [ ] Cold-start/route states: SHL-004–SHL-007 verified with failure injection, timing and bundle evidence, no forced splash or fake services.
- [ ] Business/account context: SHL-008 verified with real identity policy once available; not claimed from foundation placeholders.
- [ ] Foundation shell handoff: SHL-010 evidence accepted by RAL-005.
- [ ] H1: SHL-011–SHL-014 verified with tenant-isolated aggregates, partial retry, freshness and explicit future-module availability.

## Suggested implementation order

SHL-001 → SHL-002/SHL-003 → SHL-004/SHL-005/SHL-006 → SHL-007/SHL-009 → SHL-010 for foundation. Wire SHL-008 when identity is verified. After Parent gate RAL-017, implement SHL-011 → SHL-012 → SHL-013 → SHL-014 and pass results to the catalogue gate. Do not wait for future quotation/ingestion/Tally content to show honest unavailable cards.