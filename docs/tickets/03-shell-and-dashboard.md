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
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-001, RAL-003 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** Parent gate RAL-001; local emulator startup evidence under RAL-002.
- **UI checklist:** [ ] Dashboard, Catalogue, Quotations, Tally, Settings in that order; Admin reserved for verified platform claim later; skip link, header/nav/main, one h1, active route and meaningful title; no Inventory/Compare/charts.
- **API/backend checklist:** [ ] Route manifest distinguishes currently available modules from non-actionable future placeholders; never infer operational authorization from link visibility.
- **DB checklist:** None; static navigation introduces no domain tables.
- **Verify:** 1. Tab from page start: skip link reaches main and every link has visible focus/current state. 2. Open each route: correct heading/title and honest availability; no fake domain action.
- **Evidence:** pending.

### SHL-002 — Adapt the rail and navigation drawer without losing focus
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001.
- **UI checklist:** [ ] Use 224px rail/56px context bar at desktop, 72px compact rail where suitable, explicit mobile navigation button/drawer; accessible expanded labels, safe close/return focus, no duplicate hidden tab stops.
- **API/backend checklist:** None; responsive presentation must not issue mutations or refetch entire business datasets.
- **DB checklist:** None; optional collapsed-rail preference must not become business data.
- **Verify:** 1. Keyboard resize through desktop/tablet/360px and 320 CSS px/400% zoom: logical focus survives. 2. Navigation opens/closes by keyboard and touch, controls are not obscured by sticky regions or virtual keyboard.
- **Evidence:** pending.

### SHL-003 — Restore routes and non-secret navigation state
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001.
- **UI checklist:** [ ] Browser Back/Forward restores route and appropriate query state; not-found offers safe navigation; route change focuses meaningful heading without disrupting background refresh.
- **API/backend checklist:** [ ] Worker serves SPA deep links but `/api/*` unknown/error routes remain JSON; never put tokens/private costs in navigation state or analytics.
- **DB checklist:** None; route state is not a browser database replica.
- **Verify:** 1. Direct-load and refresh Catalogue/Settings paths then Back/Forward: expected route restored. 2. Request unknown API path: JSON error, not HTML; inspect URL/telemetry for secret absence.
- **Evidence:** pending.

## Cold-start and route-state surfaces

### SHL-004 — Show cold-start recovery only while critical bootstrap is unresolved
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-001, RAL-003, RAL-007 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001; use controlled bootstrap fixtures before Parent gate RAL-007, then verify real session integration.
- **UI checklist:** [ ] Static mark and “Opening your workspace…” only on genuinely unresolved cold start; ready state renders immediately, no timer/minimum splash; meaningful status around 1s, Retry/sign-in recovery after 10s without progress.
- **API/backend checklist:** [ ] Bootstrap adapter consumes safe health/session states; distinguish unknown auth from signed-out; retry is bounded and never replays mutations.
- **DB checklist:** None; bootstrap uses existing session contract once identity lands.
- **Verify:** 1. Delay/fail bootstrap with controlled clock: truthful status/recovery appears. 2. Ready startup, warm route changes and background refresh show no splash; keyboard recovery works without motion.
- **Evidence:** pending.

### SHL-005 — Display truthful environment and unavailable-service context
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-002, RAL-003, RAL-004 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001; environment validation and health contract evidence under RAL-004/RAL-003.
- **UI checklist:** [ ] Nonproduction banner, separate mock labels, unprovisioned versus unhealthy status; text/readable icons, no costs or secrets in global notifications.
- **API/backend checklist:** [ ] Consume minimal `/health` readiness and sanitized runtime capabilities; production never presents mock success or exposes binding/account IDs.
- **DB checklist:** None; status display requires no domain persistence.
- **Verify:** 1. Simulate dev, staging, missing binding and disconnected API: correct copy and accessible status. 2. Production mock configuration is rejected upstream rather than displayed as ready.
- **Evidence:** pending.

### SHL-006 — Lazy-load non-current modules without eager heavy dependencies
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)); design §14.
- **Depends on:** SHL-001, SHL-003.
- **UI checklist:** [ ] Shell/current-route essentials load first; route skeleton fits real content; no splash on navigation, no mandatory animation.
- **API/backend checklist:** [ ] Split available non-current feature modules; future review/Admin/Tally remain navigation-only; reserve separate explicit-action PDF renderer/source-viewer chunks and lean public entry, without implementing them; intent/idle prefetch respects Save-Data.
- **DB checklist:** None; code splitting must not add persistence or bulk prefetch data.
- **Verify:** 1. Inspect production build/network: non-current chunks absent at boot, no PDF imports. 2. Navigate with Save-Data: no eager all-route prefetch; current shell remains responsive.
- **Evidence:** pending.

### SHL-007 — Recover a failed lazy route without discarding the shell
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** SHL-006.
- **UI checklist:** [ ] Route-scoped loading/error boundary preserves nav and authorized state; Retry retains route; full reload warns if edits might be lost; static reduced-motion loading remains understandable.
- **API/backend checklist:** [ ] Separate chunk-load/network failure from API authorization/error envelope; retries are bounded and cancel stale route requests.
- **DB checklist:** None; failures cannot create or reset domain data.
- **Verify:** 1. Block a chunk: shell still navigable and keyboard Retry recovers after unblocking. 2. Retry amid dirty fixture state: no silent full reload, no focus jump on unrelated refresh.
- **Evidence:** pending.

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
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003 ([requirement](../IMPLEMENTATION.md)); design §6.
- **Depends on:** SHL-001, SHL-002.
- **UI checklist:** [ ] Named help entry and discoverable focus order; shortcuts follow documented registry, never fire in editable controls/IME; plain links/buttons remain usable when shortcuts disabled; dialogs restore invoking focus.
- **API/backend checklist:** None for basic keyboard navigation; consume own-user shortcut preferences only after identity settings exist, with safe disabled/default behavior beforehand.
- **DB checklist:** None; preference persistence belongs to access/settings, not shell.
- **Verify:** 1. Complete route navigation without mouse, then with shortcuts disabled. 2. Type shortcut-like characters during input/composition: no route change; Escape closes only active dismissible surface.
- **Evidence:** pending.

### SHL-010 — Capture the shell browser acceptance handoff
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-003, RAL-005 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** SHL-001–SHL-007, SHL-009; foundation API/emulator smoke evidence under RAL-002/RAL-003. SHL-008 is a later identity extension, not a foundation blocker.
- **UI checklist:** [ ] Browser suite asserts skip link, current route, deep links, mobile drawer, loading/error focus and reduced motion; manual inspect 1366×768, 1280×800, 1920×1080 and narrow/zoom layouts.
- **API/backend checklist:** [ ] Include machine-readable health and unknown API JSON checks; record actual production asset loading, not screenshots alone.
- **DB checklist:** None; reuse isolated foundation fixture without future domain schemas.
- **Verify:** 1. Run shell Playwright suite on clean local startup: assertions pass. 2. Review keyboard trace and build/network evidence; hand results to RAL-005 without implying live deployment.
- **Evidence:** pending.

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