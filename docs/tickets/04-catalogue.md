# Catalogue — screen-first, feature-level tickets

Sources: [parent requirements](../IMPLEMENTATION.md), [design inventory and C1–C4 specifications](../DESIGN.md). All original parent details, binding contracts and acceptance criteria remain requirements. This plan is not evidence that scaffolding implements them. Target one observable behavior, generally no more than half a day after prerequisites; subdivide if needed rather than treating a screen as one ticket.

## Current layout direction

Follow [Desktop workbench](../WORKSPACE-UX.md): compact toolbar, native comparison table, and contextual inspector beside the table above 1150 px (below it otherwise). The preview supports local fixture filtering, product inspection, close/Escape focus restoration, and contained table scrolling. This does not complete server search, global/shop scope, stock, price provenance, permissions, or the production product drawer. Do not label a local fixture as saved seller data.

## Explicit parent mapping

- RAL-012 → CAT-001–CAT-002, CAT-019–CAT-020, CAT-030.
- RAL-013 → CAT-003, CAT-013, CAT-021–CAT-023, CAT-030.
- RAL-014 → CAT-004–CAT-006, CAT-010–CAT-011, CAT-030.
- RAL-015 → CAT-007–CAT-014, CAT-030.
- RAL-016 → CAT-015–CAT-018, CAT-030.
- RAL-017 → CAT-019–CAT-029, CAT-030.
- RAL-018 → CAT-026, CAT-029–CAT-030 (drift integration; H1 UI is the shell/dashboard handoff).
- RAL-019 → CAT-030; consumes verified RAL-018 dashboard evidence.

C4 is the design's screen-level extension of RAL-017 explicit adoption, not a new automatic repricing policy. C5 relationships, source-PDF inspection, ingestion, quotation editing and Tally implementation remain outside this file; show labeled unavailable context/navigation only until their parent slices land. Do not create their tables. Global identity is read-only for sellers. Owner and Employee can mutate only their business overlay. Proposed endpoints/DTO supplements require approved fixtures. Use integer paise, bounded discount precision, optimistic versions, scoped parameterized SQL/escaped FTS, origin/CSRF checks and safe error envelopes throughout. `Parent gate RAL-xxx` means verified parent acceptance, not assumed file existence.

## C1 — Catalogue: identity and scoped read support

### CAT-001 — Recognize approved products by normalized brand and full SKU
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-012 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** Parent gate RAL-011.
- **UI checklist:** [ ] Define approved/pending labels without allowing provisional records into Global Catalogue; display original SKU punctuation.
- **API/backend checklist:** [ ] Specify normalization, active identity uniqueness, provisional identity and merge-target read policy; no seller canonical write endpoint; suffix matches are not identity equality.
- **DB checklist:** [ ] Add normalized-unique brands and global products with display/normalized SKU, brand FK, name/description, status and merge target; defer claim FKs until their slice.
- **Verify:** 1. Normalization variants resolve one approved identity. 2. Jaquar ALD-CHR-079N and KUP-CHR-35079NKPM remain distinct; provisional fixtures are excluded globally; replay migration/seed safely.
- **Evidence:** pending.

### CAT-002 — Read immutable approved MRP versions with effective-date policy
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-012 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-001.
- **UI checklist:** [ ] Approved MRP/date distinguish latest eligible version and unknown date (“Not supplied”), never substitute today.
- **API/backend checklist:** [ ] Finalize future-effective/latest-price policy and approved provenance DTO; ordinary seller commands cannot overwrite historical prices or publish versions.
- **DB checklist:** [ ] Append-only product price versions use integer paise, product FK, effective date/provenance and latest pointer; pointer must reference that product and eligible approved version.
- **Verify:** 1. Append fixture versions and resolve latest under agreed date policy. 2. Attempt overwrite/wrong-product pointer: rejected; historical rows unchanged and seed replay deterministic.
- **Evidence:** pending.

### CAT-003 — Persist a private seller overlay with explicit pricing basis
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-013 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-002.
- **UI checklist:** [ ] Agree labels for active/global/override MRP, missing cost and derived/manual default quote price; blank cost remains unknown.
- **API/backend checklist:** [ ] Define overlay DTO and pricing precedence, paise rounding, discount bounds, nullable fields and expected version; globally readable DTOs exclude private cost/aliases/overrides.
- **DB checklist:** [ ] Unique business/product overlay with active same-product price FK, optional MRP/cost, discount/default quote basis, carried flag, display overrides, version/timestamps; scoped alias storage.
- **Verify:** 1. Same product has independent A/B prices and null cost. 2. Wrong-product active version and duplicate overlay violate constraints; no canonical product/price row changes.
- **Evidence:** pending.

### CAT-004 — Maintain real D1 full-text and exact-code indexes
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-014 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-001, CAT-003.
- **UI checklist:** None; index maintenance supports C1 without a new administration screen.
- **API/backend checklist:** [ ] Define transactional index maintenance/rebuild path covering brand, SKU, name/description, approved and tenant-local aliases; private terms are scoped before results are returned.
- **DB checklist:** [ ] Real D1 FTS5 plus normalized-SKU B-tree and explicit SKU segment strategy; private alias index cannot expose cross-business matches.
- **Verify:** 1. Insert/edit/rebuild fixture terms on emulated D1: results agree. 2. Roll back alias mutation: no stale private index entry; capture query plans, not an in-memory search substitute.
- **Evidence:** pending.

### CAT-005 — Rank full exact SKU above segments and broad matches
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-014 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-004.
- **UI checklist:** [ ] Show readable match reason without rewriting displayed SKU; stable ordering supports focused result selection.
- **API/backend checklist:** [ ] Rank full normalized exact SKU, exact/prefix seller alias, name, brand+name, description, broad alias; explicit segment matches never claim full-code equality; bound/escape query syntax.
- **DB checklist:** [ ] Use B-tree exact path plus scoped FTS ranking and deterministic tie-breaker.
- **Verify:** 1. Test exact ALD-CHR-079N, `079n`, `079 body`, `jaquar kubix diverter` and Cera F1013101: expected rank/reason. 2. Punctuation, empty/injection-like input and suffix collisions remain safe and distinct.
- **Evidence:** pending.

### CAT-006 — Return bounded scoped catalogue search pages
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-014 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-005.
- **UI checklist:** [ ] Response supports result count, match reason and stable next-page controls without downloading all products.
- **API/backend checklist:** [ ] Finalize `GET /api/catalogue/mine?q=&cursor=` and `/global` query/page-size limits, deterministic opaque cursor and filter binding; seller-only quote-search seam is typed only, no quote implementation.
- **DB checklist:** [ ] Apply membership filters in query before private alias/overlay projection; add pagination index only with measured query-plan need.
- **Verify:** 1. Page through repeated-rank fixture results: no duplicates/skips under documented snapshot policy. 2. Tamper with tenant/scope/query cursor and oversized query/page: safe reject, no private terms or prices leak.
- **Evidence:** pending.

## C1 — My Catalogue and Global Catalogue tabs

### CAT-007 — Preserve separate query and filter state per catalogue scope
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-015 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-006.
- **UI checklist:** [ ] Manual-activation accessible My/Global tabs, labeled scope-aware search; arrows move tab focus, Enter/Space activate; browser Back/Forward restores appropriate non-secret query/filter state.
- **API/backend checklist:** [ ] Active tab calls only matching `/mine` or `/global` contract; abort/discard old-scope requests and clear business-keyed state on context change.
- **DB checklist:** None; reuse scoped read indexes.
- **Verify:** 1. Different search in each tab survives repeated keyboard switching and Back. 2. Slow prior scope/business response cannot overwrite current rows or reveal old private data.
- **Evidence:** pending.

### CAT-008 — Display My Catalogue's private commercial columns
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-015 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-003, CAT-007.
- **UI checklist:** [ ] Native table shows identity, Your MRP, latest approved/new-price cue, cost or “Not entered”, discount, default quote, carried/status and Open; pending global identity is labeled; prioritize identity/MRP/quote/update on narrow layout.
- **API/backend checklist:** [ ] `/mine` returns server-computed active/latest context and scoped seller values; no guessed live Tally stock.
- **DB checklist:** [ ] Scope all product/price/overlay joins; do not compare a seller price against another product's latest row.
- **Verify:** 1. Fixture active ₹5,000/latest ₹6,000 shows both without auto-adoption. 2. Keyboard/narrow row detail retains access to every commercial field; B cannot request A's cost.
- **Evidence:** pending.

### CAT-009 — Display approved Global Catalogue and current-shop adoption state
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-015 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-007, CAT-002.
- **UI checklist:** [ ] Brand/SKU/name, latest approved MRP/date and Add/Open or Already in your catalogue; no private cost/margin columns and no provisional global records.
- **API/backend checklist:** [ ] `/global` projects published facts and a minimal current-shop membership flag only; cannot return another seller's pricing or aliases.
- **DB checklist:** [ ] Approved product filter with scoped existence check for current seller overlay; no global mutations.
- **Verify:** 1. Shared product shows Add for A and Already added for B as appropriate. 2. Inspect complete JSON, not just UI: no private commercial fields or provisional identity leakage.
- **Evidence:** pending.

### CAT-010 — Debounce search without losing input or result focus
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-014, RAL-015 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-007, CAT-008, CAT-009.
- **UI checklist:** [ ] Immediate input echo with initial ~200ms measured debounce; loading/error retains query, match reason is readable, search focus stays put; Enter acts on explicitly focused result, not a hidden default.
- **API/backend checklist:** [ ] Cancel stale requests and ignore late responses; request identifier/query key includes business and scope; errors use bounded safe envelope.
- **DB checklist:** None; existing search indexes and limits apply.
- **Verify:** 1. Type quickly with reversed response order: only latest query results appear. 2. Keyboard Enter during composition/loading never adds/opens a hidden result; retry retains prior query.
- **Evidence:** pending.

### CAT-011 — Apply explicit filters, sorting and cursor pagination
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-014, RAL-015 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-006, CAT-007.
- **UI checklist:** [ ] Brand and scope-appropriate carried/status/price-update filters, result count and bounded page controls; native sort buttons announce direction; reset cursor on query/filter/sort change, preserve per-scope choices.
- **API/backend checklist:** [ ] Finalize allowlisted `brand`, `carried`, `status`, `hasUpdates`, `sort` supplements; cursor binds normalized filter/sort set and current authorized scope.
- **DB checklist:** [ ] Scoped filter queries use measured indexes; no invented category tree or full-dataset client filtering.
- **Verify:** 1. Filter/sort/page with keyboard: count and rows match fixtures. 2. Reuse cursor with foreign business or changed filters: reject/restart safely rather than mixing results.
- **Evidence:** pending.

### CAT-012 — Distinguish initial empty catalogue, no match and failed load
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-015 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-008, CAT-009, CAT-010.
- **UI checklist:** [ ] Empty shop offers Browse global; no-match offers clear filters/explicit global bridge; loading skeleton/retry preserves geometry and query; New PDF/Import history entry clearly unavailable until ingestion, no working-looking dead button.
- **API/backend checklist:** [ ] Distinguish empty successful result from 401/403/service error; never convert denied/unavailable into zero products.
- **DB checklist:** None; no ingestion schemas or uploads.
- **Verify:** 1. Seed empty shop, unmatched query and API failure: distinct reachable actions/copy. 2. Keyboard retry/clear/filter/global bridge preserve intended scope; unavailable ingestion entry explains prerequisite without implying functionality.
- **Evidence:** pending.

### CAT-013 — Show seller display corrections without altering canonical identity
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-013, RAL-015 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-003, CAT-008, CAT-009.
- **UI checklist:** [ ] My Catalogue uses private name/description overrides with clear local-correction cue; Global remains canonical; pending identity label is not hidden by local text.
- **API/backend checklist:** [ ] Define allowlisted display fields in scoped seller DTO; no override of canonical SKU/brand/status/global price through local display payload.
- **DB checklist:** [ ] Read overlay display fields only for authenticated business; preserve canonical fields and future snapshot compatibility.
- **Verify:** 1. A's corrected name differs in My view while B and Global remain unchanged. 2. Inspect search/result projections for cross-tenant alias/override leakage and incorrect approval labels.
- **Evidence:** pending.

### CAT-014 — Open a product and restore the exact invoking row context
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-015 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-008, CAT-009; drawer implementation acceptance under CAT-019 before full integration verification.
- **UI checklist:** [ ] Explicit Open works by keyboard; retain scope/query/filter/page/scroll/row identity; close returns focus to original row or safe table heading if removed.
- **API/backend checklist:** [ ] Route/overlay state contains only product ID and appropriate non-secret search context; reopening always authorizes detail request, not cached ID trust.
- **DB checklist:** None; context retention is not local database replication.
- **Verify:** 1. Open from page two and close: same row/scroll/query, no hidden duplicate tab stop. 2. Remove authorization while open: safe closure/recovery without cached private content.
- **Evidence:** pending.

## C2 — Add to my catalogue pricing sheet

### CAT-015 — Open a focused sheet with the selected approved price
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-016 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-009.
- **UI checklist:** [ ] Small sheet, not new page: product identity, selected global MRP/date, optional cost, discount, calculated quote, Cancel/Add; focus first editable field and restore invoking Add on cancel.
- **API/backend checklist:** [ ] Read latest eligible approved product/price context before confirmation; inaccessible/deapproved/already-added state is recoverable and not silently substituted.
- **DB checklist:** None on open/cancel; existing approved product/version reads only.
- **Verify:** 1. Keyboard open, Escape/Cancel: focus returns with no row created. 2. Product becomes inaccessible between list and open: safe message, no private/global mutation.
- **Evidence:** pending.

### CAT-016 — Calculate a default quote price with honest missing cost
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-016 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-003, CAT-015.
- **UI checklist:** [ ] Blank cost remains “Not entered”/unknown profit; discount-derived result updates immediately; manual basis if supported is explicitly labeled, with accessible range/precision errors.
- **API/backend checklist:** [ ] Shared deterministic paise calculation and rounding fixtures; server recomputes rather than trusting client computed totals; finalize manual-price versus discount precedence.
- **DB checklist:** None until Add; null cost must not be coerced to zero by serialization.
- **Verify:** 1. Golden paise/discount boundary examples agree browser/server. 2. Blank cost, zero cost, invalid discount, overflow and excessive precision are distinguished predictably.
- **Evidence:** pending.

### CAT-017 — Add an approved product idempotently to the current business
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-016 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-015, CAT-016.
- **UI checklist:** [ ] Enter submits validated form after composition; pending disables duplicate Add; failure retains input; success restores result focus and Already in your catalogue state.
- **API/backend checklist:** [ ] `POST /api/catalogue/products/:productId/add` validates pricing fields/idempotency key and approved accessible identity; derive business, initialize selected same-product approved price, return existing overlay for equivalent retry.
- **DB checklist:** [ ] Unique business/product and atomic overlay+audit insertion; store null cost faithfully; no global row update.
- **Verify:** 1. Costless Add persists after reload with unknown profit. 2. Same-key retry returns same overlay; invalid discount, forged tenant and inaccessible product cause no writes.
- **Evidence:** pending.

### CAT-018 — Reconcile concurrent Add and changed-price responses
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-016 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-017.
- **UI checklist:** [ ] Already-added race offers Open existing; changed selected-price context requires explicit refreshed confirmation, not silent repricing; failed requests retain form/focus.
- **API/backend checklist:** [ ] Define conflicting idempotency-payload and duplicate-overlay outcomes; do not overwrite existing seller pricing on Add retry; reject stale/ineligible price according to approved selection policy.
- **DB checklist:** [ ] Concurrent writes create one overlay and corresponding effective audit; transaction rollback prevents orphan audit.
- **Verify:** 1. Two simultaneous Adds with differing costs leave one deliberate result, never last-write silent replacement. 2. Replay key with changed payload and simulate price eligibility change: clear conflict/recovery, global history untouched.
- **Evidence:** pending.

## C3 — Product detail, private pricing, history and aliases

### CAT-019 — Load an authorized product drawer with safe close behavior
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-012, RAL-017 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-008, CAT-009, CAT-017.
- **UI checklist:** [ ] Heading-focused modal drawer with identity/description → pricing → history → aliases → labeled relationship/Tally unavailable context; focus trap, loading/error/retry, dirty-close resolution and invoking-focus return; global-only product offers Add, not editable seller fields.
- **API/backend checklist:** [ ] `GET /api/catalogue/products/:id` returns approved global context plus only current-business overlay; no seller canonical edit route or unauthorized provenance/source access.
- **DB checklist:** [ ] Scoped overlay join by current membership and product; no relationship, source-PDF or Tally tables created.
- **Verify:** 1. Keyboard open/Tab/close at narrow width preserves catalogue context. 2. Foreign overlay/provisional identity request and permission revocation show safe state without cached cost exposure.
- **Evidence:** pending.

### CAT-020 — Display chronological approved price history and provenance
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-012, RAL-017 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-002, CAT-019.
- **UI checklist:** [ ] Chronological timeline labels Your active price, Latest approved and seller override separately; effective date “Not supplied” when absent; essential facts use headings/links, not hidden accordions.
- **API/backend checklist:** [ ] Detail/history contract includes allowed approval/provenance fields only; source links remain unavailable until authorized source feature exists, no public signed URL leakage.
- **DB checklist:** [ ] Read immutable same-product history and active pointer; no history updates on viewing or adoption.
- **Verify:** 1. Multi-version fixture displays correct order/labels/dates by keyboard/screen reader. 2. Current active older price remains active after new global append; unauthorized provenance omitted from full response.
- **Evidence:** pending.

### CAT-021 — Save private cost, discount, overrides and quote-price basis
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-013, RAL-017 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-003, CAT-019, CAT-016.
- **UI checklist:** [ ] Explicit Save with dirty/saving/saved/error and local pricing labels; null cost honest, manual versus derived quote clear; 409 preserves entered values and offers deliberate reconciliation.
- **API/backend checklist:** [ ] `PATCH /api/catalogue/seller-products/:id` allowlists MRP override/cost/discount/default price and basis plus expected version; Owner/Employee scoped equally, reject canonical over-posting and recompute derived price.
- **DB checklist:** [ ] Conditional overlay update+audit, increment version; no canonical/history writes and no future quote snapshot mutation.
- **Verify:** 1. Save/reload boundary paise values and null cost; global rows unchanged. 2. Two-tab stale save, foreign overlay and posted global SKU/status fail safely with no audit success on rollback.
- **Evidence:** pending.

### CAT-022 — Edit local display corrections and carried state without deletion
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-013, RAL-017 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-013, CAT-019, CAT-021.
- **UI checklist:** [ ] Local name/description edits clearly labeled, reset-to-global is explicit; carried toggle communicates retained history, no hard Delete; pending/error retains entered state.
- **API/backend checklist:** [ ] Seller PATCH validates display lengths/carried boolean and expected version; no canonical-field edits, status promotion or destructive cascade.
- **DB checklist:** [ ] Update overlay fields and audit only; preserve seller identity and historical reference compatibility.
- **Verify:** 1. Keyboard change/reset display and turn carried off: reload matches, Global unchanged. 2. B cannot see/edit A's corrections; stale version cannot overwrite latest state or remove history.
- **Evidence:** pending.

### CAT-023 — Add and remove seller-local aliases with search consistency
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-013, RAL-017 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-004, CAT-019, CAT-021.
- **UI checklist:** [ ] Labeled alias list/add/remove, empty/pending/duplicate/error feedback; local-only explanation, focus returns to next alias or section heading after remove.
- **API/backend checklist:** [ ] Proposed scoped alias create/delete under seller-product resource validates text/normalization, overlay version and alias ownership; no automatic global promotion.
- **DB checklist:** [ ] Scoped alias uniqueness plus atomic private FTS maintenance and audit; delete cannot leave searchable private residue.
- **Verify:** 1. Add alias, search it, remove and search again: correct results immediately. 2. B's query/alias ID cannot expose or remove A's alias; rollback leaves table/index consistent.
- **Evidence:** pending.

### CAT-024 — Preview explicit price adoption and override implications
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-017 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-020, CAT-021.
- **UI checklist:** [ ] Use this price version confirmation shows old/new MRP/date, active/override differences and resulting discount-derived default quote; explicit retain/clear override choice; manual default stays manual unless separately changed; safe initial focus.
- **API/backend checklist:** [ ] Finalize preview inputs: same-product approved target, expected overlay version and explicit override disposition; preview is read-only, not an implicit adoption.
- **DB checklist:** None on preview/cancel; read current overlay and eligible price only.
- **Verify:** 1. Preview ₹5,000→₹6,000 with retained/cleared override and manual/derived price: expected values. 2. Cancel by keyboard: no write/audit; changed eligibility/current version requires refreshed preview.
- **Evidence:** pending.

### CAT-025 — Adopt one approved price with atomic audit and conflict recovery
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-017 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-024.
- **UI checklist:** [ ] Deliberate confirm, pending/error/conflict/success; keep drawer/values on failure; result explicitly states existing quotes were not changed and restores relevant row focus.
- **API/backend checklist:** [ ] `POST /api/catalogue/seller-products/:id/use-price-version` takes target version, expected overlay version and retain/clear override choice; verify tenant, same product, approved eligibility and actor; harmless equivalent retry.
- **DB checklist:** [ ] Atomic D1 batch updates overlay pricing/reference/version and audit; historical price rows untouched; no access to future quote snapshots.
- **Verify:** 1. Adopt chosen version: only intended overlay/derived price changes. 2. Wrong-product/foreign version, stale overlay and injected audit failure cause safe conflict/rollback with no partial update.
- **Evidence:** pending.

## C4 — Price updates and batch adoption confirmation

### CAT-026 — List scoped price drift with differences and clear zero state
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-017, RAL-018 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-002, CAT-003, CAT-011, CAT-025.
- **UI checklist:** [ ] `/catalogue/updates` native table shows product, active/latest versions/MRP/dates, absolute/percentage change, override and action; brand/newer-price filters, loading/zero/error/retry, unknown date not today; zero denominator has defined “not applicable” percentage.
- **API/backend checklist:** [ ] Proposed `GET /api/catalogue/updates?brand=&cursor=` shares eligible-version drift predicate with `GET /api/dashboard`; bounded scoped cursor, version differences not accidental amount equality.
- **DB checklist:** [ ] Reuse overlay/latest joins and justified covering indexes; no unrelated future-schema dependency.
- **Verify:** 1. Same-price/new-version, future-dated, overridden and zero-price fixtures follow approved drift policy and match aggregate count. 2. B/foreign cursor cannot read A's update rows; no automatic adoption.
- **Evidence:** pending.

### CAT-027 — Select only the visible page and preview selected impact
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-017 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-024, CAT-026.
- **UI checklist:** [ ] Native row checkboxes and “Select this page” with single count announcement; no implicit cross-page selection; preview lists selected product/version/override/derived-price impact, excludes blocked rows visibly and keeps safe confirmation focus.
- **API/backend checklist:** [ ] Preview accepts bounded explicit seller-product/version tuples with expected versions, reauthorizes each row and returns eligible/blocked reason; cross-page-all is not offered without separately approved explicit scope/count contract.
- **DB checklist:** None on selection/preview; authorized current-row reads only.
- **Verify:** 1. Select page one then navigate: selection follows explicit documented page policy, never silently includes page two. 2. Stale/foreign row in preview is blocked without leaking details; Escape causes no write.
- **Evidence:** pending.

### CAT-028 — Commit selected price adoptions with per-row outcomes
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-017 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** CAT-025, CAT-027.
- **UI checklist:** [ ] Confirmation identifies bounded selection scope; result distinguishes succeeded/failed/blocked, retains failed selection and retry context, never says all succeeded after partial failure.
- **API/backend checklist:** [ ] Proposed bounded batch-adopt command reuses single-row approved-version/expected-version/override contract with operation keys; document per-row atomicity (not an unsupported all-row transaction guarantee).
- **DB checklist:** [ ] Each row update+audit atomic; partial batch is reported explicitly; retries skip equivalent completed operations and cannot duplicate effective audit or move unrelated products.
- **Verify:** 1. Mix valid/stale/foreign/wrong-product rows: only authorized valid rows adopt and outcomes are precise. 2. Retry after network loss: no duplicate adoption effects; failed rows retain usable keyboard recovery.
- **Evidence:** pending.

### CAT-029 — Refresh drift across catalogue, drawer and dashboard after adoption
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-017, RAL-018 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-025, CAT-026, CAT-028; dashboard aggregate/card implementation evidence under RAL-018 (not the completed parent gate).
- **UI checklist:** [ ] On adoption refresh active/latest labels, update table and dashboard count without reordering focus or discarding query; failed rows keep context, empty result gives “No price updates to review”.
- **API/backend checklist:** [ ] Invalidate only authorized business's detail/list/aggregate query keys; abort old-business response, preserve module-specific errors and actual freshness.
- **DB checklist:** None; authoritative scoped reads recompute from committed overlays, not browser decremented guesses.
- **Verify:** 1. Single and partial-batch adopt produce correct remaining count on all surfaces after reload. 2. A's adoption cannot affect B's active prices/count; global append never automatically moves either seller.
- **Evidence:** pending.

## C1–C4 — Minimal catalogue acceptance gate

### CAT-030 — Record catalogue keyboard, isolation and real D1 regression evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-012, RAL-013, RAL-014, RAL-015, RAL-016, RAL-017, RAL-018, RAL-019 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** CAT-001–CAT-029; Parent gate RAL-018.
- **UI checklist:** [ ] Keyboard search → global drawer/Add sheet → seller edit → alias → history/adopt → update list; verify loading/empty/error/dirty/conflict and preserved row/search state at desktop/narrow widths.
- **API/backend checklist:** [ ] Targeted IDOR suite covers GET/PATCH/add/adopt/batch/alias/cursor/global over-posting; use actual emulated D1 FTS5 fixtures for Jaquar ALD-CHR-079N, KUP-CHR-35079NKPM, Cera F1013101 and similar distinct codes across two businesses.
- **DB checklist:** [ ] Replay foundation-to-catalogue migrations; assert uniqueness, same-product FKs, index consistency, atomic audit, immutable history and seller/global isolation; no ingestion tables before gate acceptance.
- **Verify:** 1. Run focused acceptance suites and review keyboard trace: exact SKU first, words correct, costless add, private edits and explicit adoption all pass. 2. Confirm B cannot obtain A's cost/alias, global prices remain unchanged by seller edits and dashboard drift matches; record residual limitations and gate decision, not scaffolding success.
- **Evidence:** pending.

## Screen-level completion checklist

- [ ] C1 support: CAT-001–CAT-006 verified against real D1 with normalization, date/price policy, FTS rebuild/ranking and tenant cursor tests.
- [ ] C1 screen: CAT-007–CAT-014 verified for both scopes, filters, states, narrow tables and return-focus/search preservation.
- [ ] C2: CAT-015–CAT-018 verified with costless add, paise math, duplicate race and keyboard cancellation/submission.
- [ ] C3: CAT-019–CAT-025 verified with read-only canonical identity, private edits/aliases, immutable history and explicit atomic adoption; later relationship/Tally/source contexts honestly unavailable.
- [ ] C4: CAT-026–CAT-029 verified for drift, page-limited selection, impact preview, partial outcomes, retries and dashboard consistency.
- [ ] Gate: CAT-030 evidence accepted with all inherited RAL-012–RAL-019 criteria reviewed; future quote-snapshot regressions remain linked to RAL-027, not falsely passed before quote schema exists.

## Suggested implementation order

After Parent gate RAL-011: CAT-001 → CAT-002 → CAT-003 → CAT-004–CAT-006 → CAT-007–CAT-013. Implement CAT-015–CAT-018, then CAT-019 and complete CAT-014 integration; CAT-020–CAT-025 follow. Build CAT-026–CAT-028 and coordinate RAL-018 dashboard support before CAT-029. Close RAL-018 with dashboard evidence, then CAT-030/RAL-019 before any ingestion schema or workflow work. Selection, adoption and gates are separate small changes, never an entire-screen implementation ticket.