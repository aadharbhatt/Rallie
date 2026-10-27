# 05 — Quotation workspace

Documentation-only decomposition; every ticket is TODO, not an implementation claim. The 80 parent requirements remain authoritative in [IMPLEMENTATION](../IMPLEMENTATION.md); screen and interaction contracts come from [DESIGN](../DESIGN.md), especially Q1–Q7 and §§5–6. This file does not replace the parent backlog or edit its index.

**Parent coverage (14):** RAL-020, RAL-021, RAL-022, RAL-023, RAL-024, RAL-025, RAL-026, RAL-027, RAL-029, RAL-032, RAL-034, RAL-036, RAL-037, RAL-038.

**35 tickets:** QTE-001–QTE-035. Each is a roughly half-day implementation or focused verification slice once its dependencies are satisfied; estimate excludes waiting on parent gates. Screen order is reading order, not execution order. Shared parent coverage with another file means complementary responsibilities, not duplicate delivery. `Parent gate RAL-xxx` refers to the original parent acceptance gate, never an invented cross-file child.

## Working contract

- Every authenticated endpoint below resolves Owner/Employee business membership server-side, validates nested ownership, uses bounded typed schemas and stable safe errors, and protects cookie mutations against CSRF/origin abuse. No posted tenant, totals, status, or hash is trusted. Read routes have no commercial side effects.
- Every UI ticket includes relevant loading, empty, ready, validation, pending, success, retry, permission and expired-session states; native labels, visible focus, Tab/Shift+Tab and Enter/Space; safe dialog Escape and focus restoration. IME input and browser shortcuts are never intercepted. Each ticket's Verify adds its particular checks.
- D1 is authoritative. Money is integer paise under one versioned pricing policy; migrations require empty replay and previous-slice upgrade tests. Retryable mutations bind operation key to canonical payload. Tests use Vitest, real local D1 bindings and Playwright as appropriate, not in-memory substitutes for persistence invariants.
- Backend work belongs to the narrow feature ticket that needs it. `DB tasks: None` means no new schema, not permission to bypass existing constraints. Billing and relationship prompts are gated by their original parents; do not implement Tally or automatic relationship additions here.
- Evidence stays pending until an implementer records commands, environment, commit, assertions and relevant screenshots/traces. No implementation tests were run for this documentation task.

## Q1 — Quotations list

### QTE-001 — Read the scoped quotation list and dashboard count
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-026
- **Depends on:** QTE-003; QTE-019
- **UI tasks:** Render quote/customer, current and approved revision, total, status and last activity with Open links; distinguish approved from billed and newer drafts. Empty state offers New quote; loading/error/retry are keyboard reachable.
- **API/backend tasks:** Define bounded `GET /api/quotes?cursor=` and scoped dashboard aggregate DTOs; recent-activity order has a stable tie-breaker. Authorize every row and aggregate; unavailable counts are not zero.
- **DB tasks:** Add business/status/updated-time list indexes; read existing quote/revision state without mutation.
- **Verify:** Seed two businesses and open the list by keyboard; only current-business rows/counts appear. Automated cursor tests show no repeated rows; list and dashboard fixtures agree; GET changes no events, PDFs or billing records.
- **Evidence:** pending.

### QTE-002 — Search and bookmark lifecycle filters
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-026
- **Depends on:** QTE-001
- **UI tasks:** Add customer/phone/quote-number search and Draft/Shared/Changes proposed/Approved/Tally pending/Billed/Void/Expired filters plus billing-error indication. Restore query/filter after Build; no-results Clear filters and ordinary keyboard controls.
- **API/backend tasks:** Extend the list contract with bounded query/status filters; validate enums and retain membership-scoped SQL. Do not equate billing failure with approval revocation.
- **DB tasks:** Add only measured lookup indexes required by the scoped query; no lifecycle mutation.
- **Verify:** Filter, open, return and reload a bookmarked list; state is retained. Automated search/invalid-filter/cross-business tests pass and approved versus billed results remain distinct.
- **Evidence:** pending.

## Q2 — Workspace frame and tabs

### QTE-003 — Create one durable untitled draft deliberately
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-020
- **Depends on:** Parent gate RAL-019
- **UI tasks:** New quote is explicit, guarded while pending, with retry/error and an untitled empty workspace. Move focus to the new quote heading; page load never creates a quote.
- **API/backend tasks:** Specify authenticated `POST /api/quotes` with operation key and `GET /api/quotes/:id`; creation permits no customer and persists a replayable result, rejecting key/payload changes.
- **DB tasks:** Create tenant-scoped quote identity/version/timestamps, mutable draft/line foundation and creation operation uniqueness; no approval fields yet.
- **Verify:** Double-activate New quote, retry after a lost response, then reload: one quote and draft survive. D1 tests reject another business's ID and prove navigation alone creates nothing.
- **Evidence:** pending.

### QTE-004 — Activate independent quote tabs accessibly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-023
- **Depends on:** QTE-003
- **UI tasks:** One tab per quote ID, customer/number/total labels and dirty/error cues; sibling Close controls and Open quotes overflow menu. Arrows/Home/End move focus, Enter/Space activates manually, Tab enters panel. Preserve per-tab search, scroll and pending input.
- **API/backend tasks:** Consume scoped quote GET per newly opened quote; arrow focus alone does not fetch or create quotes. Never reuse another tab's response as the active quote.
- **DB tasks:** None; existing drafts remain authoritative.
- **Verify:** Open two customers, type distinct inputs, switch by keyboard and reopen the same ID: two tabs, no crossed state. Playwright verifies tab roles, manual activation and overflow actions without nested interactive elements.
- **Evidence:** pending.

### QTE-005 — Restore authorized tab IDs from the server
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-023
- **Depends on:** QTE-004
- **UI tasks:** Restore up to eight last-used IDs with per-tab loading; inaccessible/deleted quotes show safe recovery. Clear obsolete business/account state without leaking labels; restoration does not auto-close a dirty session tab.
- **API/backend tasks:** Revalidate every ID through authenticated GET after account/business changes. Local storage contains IDs only, scoped per user/business, never prices, customer data, documents or tokens.
- **DB tasks:** None.
- **Verify:** Reload authorized tabs and compare server content; remove membership and restore again. Automated forged-ID and storage inspections prove inaccessible data is absent and local contents confer no authority.
- **Evidence:** pending.

### QTE-006 — Resolve unsaved work before closing or leaving
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-023; RAL-025
- **Depends on:** QTE-004; QTE-017
- **UI tasks:** Offer Save and close / Keep editing / Discard unsaved edits, initially focusing Keep editing. Failed save keeps tab open. Close active tab focuses right neighbor, then left, then New; background close preserves focus. Attach unload warning only while dirty.
- **API/backend tasks:** Await the existing save acknowledgment before close; discard returns to server-saved draft, never deletes quote/history. Do not claim unload/crash persistence.
- **DB tasks:** None.
- **Verify:** Keyboard-test each close choice, save failure and last-tab close. Automated navigation tests show saved drafts cause no warning, failed saves retain text and closing never invokes delete/void.
- **Evidence:** pending.

### QTE-007 — Adapt Build panels without losing edits
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-023
- **Depends on:** QTE-004
- **UI tasks:** Desktop search/customer left and quote/totals right; narrow layout uses usable panels with Jump to search/quote links. Keep quote identity/save state visible, touch controls reachable and focused content clear of sticky actions; no Compare mode.
- **API/backend tasks:** None beyond the authenticated quote DTO; layout changes must not issue mutations or reset request ownership.
- **DB tasks:** None.
- **Verify:** Resize while editing each tab and while a request is pending; text and caret intent survive. Playwright desktop/narrow keyboard checks find every action and confirm no resize-triggered save/create/PDF calls.
- **Evidence:** pending.

## Q3 — Customer and catalogue selection

### QTE-008 — Select a business-owned customer
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-020
- **Depends on:** QTE-003
- **UI tasks:** Search/select lightweight name/phone customer; support no results, unavailable search and untitled draft. Label combobox results; Escape returns focus without assignment, explicit selection commits.
- **API/backend tasks:** Define bounded scoped customer search and `PATCH /api/quotes/:id/customer` with expected draft version; validate same-business customer FK and preserve historical customer snapshots.
- **DB tasks:** Add `customers` business/name/phone and scoped lookup index; quote customer reference permits null and enforces tenant association.
- **Verify:** Two businesses may contain similar customers. Select one, reload, and confirm association; automated nested customer-ID tampering is denied and typing/arrow focus alone never assigns.
- **Evidence:** pending.

### QTE-009 — Create or edit customer details without merging people
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-020
- **Depends on:** QTE-008
- **UI tasks:** Inline name/phone create/edit with field errors, save/retry and address-book-impact notice. Draft phone may be absent; share validation is separate. Cancel restores trigger focus and protects dirty input.
- **API/backend tasks:** Specify scoped customer create/update schemas with idempotent creation and versioned update. Record identity policy: shared phone is not a uniqueness/merge key; historical revisions never read mutable address-book text.
- **DB tasks:** Customer version/audit and creation-operation constraint; no phone-only unique index.
- **Verify:** Create two people sharing a phone and edit only one; both remain distinct. Automated cross-tenant edit, duplicate-request and old-revision snapshot tests pass; keyboard validation retains entered text.
- **Evidence:** pending.

### QTE-010 — Search only My Catalogue in Build
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-024
- **Depends on:** QTE-004; Parent gate RAL-014
- **UI tasks:** Debounced results show brand/SKU/name, active MRP/default price and contextual dated stock only when available. Preserve query after Add; loading/empty/retry states and explicit focused Add buttons, never Enter-to-add from typing/IME.
- **API/backend tasks:** Specify `GET /api/quote-search?q=&cursor=` using bounded tenant-private search and full-SKU ranking; expose only this seller's carried/eligible products and safe global-match count.
- **DB tasks:** None; reuse parent D1 FTS5 and exact-SKU indexes.
- **Verify:** Search exact SKU, alias, suffix and no match; expected order and match reason appear. Real D1 tests prove full equality outranks suffix and another seller's aliases/costs cannot surface.
- **Evidence:** pending.

### QTE-011 — Bridge an empty seller search to explicit catalogue adoption
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-024
- **Depends on:** QTE-010; Parent gate RAL-016
- **UI tasks:** Offer View matching global products and add to my catalogue, opening the existing pricing sheet. Cancel/error returns to search; successful adoption announces availability, restores focus and requires a separate Add line action.
- **API/backend tasks:** Consume approved-global search and authorized seller-adoption contracts; never accept an unpriced global ID at the quote-line endpoint.
- **DB tasks:** None; adoption writes belong to the parent catalogue gate.
- **Verify:** Adopt using keyboard, then inspect the quote: no line until explicit Add. Automated cancel, adoption failure and direct-global-ID tests leave the draft unchanged.
- **Evidence:** pending.

### QTE-012 — Add a stable snapshot line exactly once
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-024; RAL-021
- **Depends on:** QTE-010; QTE-019
- **UI tasks:** Add feedback announces product/quantity while retaining result focus and query. Display per-item pending/retry; offer Jump to quote instead of stealing focus. Relationship suggestions remain inert until their owning gate.
- **API/backend tasks:** `POST /api/quotes/:id/lines` takes seller-product ID, quantity, expected draft version and operation key. Validate carried/access policy; snapshot seller display overrides, MRP/cost/price once. Define repeated deliberate Add behavior separately from request replay.
- **DB tasks:** Stable draft-line IDs/order and snapshot fields with same-business product checks; atomic version/event/add-operation record.
- **Verify:** Add then change catalogue price/name; line remains frozen. Replay the operation and retry concurrently: one addition effect. Tests reject cross-business/unpriced products and distinguish a second deliberate Add from replay.
- **Evidence:** pending.

## Q2–Q3 — Line editing, pricing and persistence

### QTE-013 — Edit quantity with shared precision rules
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-022; RAL-025
- **Depends on:** QTE-012
- **UI tasks:** Product-labeled +/- and direct quantity/UOM editing; preserve intermediate text, commit on Enter/blur, keep caret during total updates. Invalid, missing and out-of-range values show actionable errors.
- **API/backend tasks:** Define quantity precision, fractional-unit policy, bounds and rounding before coding; versioned line PATCH validates nested ownership and rejects overflow/invalid quantities using shared domain rules.
- **DB tasks:** Quantity/UOM checks and conditional draft-version updates; revision rows remain untouched.
- **Verify:** Edit integral/fractional boundary quantities by keyboard; browser/server golden results agree. Contract tests reject overflow, invalid units and foreign line IDs without partially updating totals.
- **Evidence:** pending.

### QTE-014 — Switch explicitly between discount and manual rate
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-022; RAL-025
- **Depends on:** QTE-013
- **UI tasks:** Show active derived/manual pricing basis, percentage precision and paise-preserving money fields. Field-level errors and nonblocking negative-margin warning; Tab/Enter commits without changing shop defaults.
- **API/backend tasks:** Extend scoped versioned line PATCH with a discriminated price-mode contract; establish precedence, discount bounds, rounding and display policy. Server recomputes agreed rate and rejects forged totals.
- **DB tasks:** Persist draft price mode, discount precision, integer unit price and calculation-policy version with checks.
- **Verify:** Switch modes repeatedly around rounding boundaries; expected golden rates match browser/server. Tests prove quote-only edits do not change seller prices, snapshots or cost; invalid precision/overflow is rejected atomically.
- **Evidence:** pending.

### QTE-015 — Remove a line with predictable recovery and focus
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-025
- **Depends on:** QTE-012
- **UI tasks:** Product-labeled Remove with explicit confirmation (not toast-only undo); pending/error preserves the row. On success focus next/previous action, or empty quote/Add products after last removal; cancel restores trigger.
- **API/backend tasks:** Versioned `DELETE /api/quotes/:id/lines/:lineId` validates nested ownership and replay policy; stale delete conflicts and cannot remove a newer unrelated line.
- **DB tasks:** Atomic draft removal, recalculated totals/version and event; never delete immutable revision lines.
- **Verify:** Cancel and confirm first/last-line removal with keyboard, inject failure and retry. Automated stale/nested-ID tests and old-revision comparison prove no history loss or double effect.
- **Evidence:** pending.

### QTE-016 — Show authoritative totals and honestly incomplete profit
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-022
- **Depends on:** QTE-013; QTE-014; QTE-015
- **UI tasks:** Show MRP/quote totals, meaningful savings and private profit. Missing costs show Incomplete — cost missing for N lines, never zero-cost profit. Display agreed INR/tax assumptions, not an invented GST engine; announce committed totals without moving focus.
- **API/backend tasks:** Centralize versioned integer-paise calculation and unknown-profit propagation; server rejects inconsistent client totals. Separate internal totals from customer-safe values and canonical hash inputs.
- **DB tasks:** Store pricing-policy version and currency/tax/terms context on snapshots; cost remains nullable/internal.
- **Verify:** Run golden quantities/discount/manual/paise/missing-cost fixtures in browser and Worker. Test ₹6,000.50 as 600050 paise, partial unknown profit, overflow and tampered totals; visible labels and screen-reader output match policy.
- **Evidence:** pending.

### QTE-017 — Debounce saves and flush only acknowledged edits
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-025
- **Depends on:** QTE-013; QTE-014; QTE-015
- **UI tasks:** Unsaved → Saving → Saved at time, or Couldn't save · Retry/offline. Approximately 500 ms debounce plus blur/action flush; retain pending text and restrained live announcements.
- **API/backend tasks:** Serialize versioned PATCH/DELETE requests per quote; expose an awaitable flush barrier for Share/PDF. Ignore obsolete responses and persist only acknowledged draft state; no render side effects.
- **DB tasks:** Reuse atomic conditional line/totals/version/event writes; no revision on every keystroke.
- **Verify:** Fake-clock test rapid typing yields bounded requests; blur flushes once. Delay/reorder responses and disconnect: latest text survives, Saved is never false, and actions wait or fail safely rather than sharing unsaved content.
- **Evidence:** pending.

### QTE-018 — Resolve two-editor conflicts without overwriting input
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-025
- **Depends on:** QTE-017
- **UI tasks:** Show local versus saved values and explicit reload/reapply choices; focus conflict heading and retain local input. Block Share/PDF while unresolved; permission loss offers safe exit, not a misleading retry.
- **API/backend tasks:** Return stable conflict code/current version through the scoped save contract; reapply is a deliberate new versioned command, not a blind force overwrite. Protect concurrent line/totals/event updates.
- **DB tasks:** None; exercise draft compare-and-swap constraints.
- **Verify:** Two clients edit the same draft concurrently: one succeeds, one sees conflict and intact input. Automated reapply/reload tests preserve prior revisions and prove old responses cannot mark newer text saved.
- **Evidence:** pending.

### QTE-019 — Freeze a deterministic immutable revision
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-021
- **Depends on:** QTE-003
- **UI tasks:** Distinguish mutable Draft from Saved revision; show preparing/success/conflict through callers. No new standalone screen; callers retain focus and expose retry only with a known version.
- **API/backend tasks:** Define authenticated snapshot command requiring expected draft version and operation key. Server canonicalizes ordered customer-visible seller/customer/product snapshots, quantities, prices, totals and terms using a versioned policy; excludes cost/profit and volatile audit timestamps from hash.
- **DB tasks:** Add append-only `quote_revisions`, immutable `quote_lines`, unique quote/revision number, frozen hash input/hash version and `quote_events`; atomically allocate revision and lines in a tested bounded D1 batch, rejecting oversized snapshots explicitly.
- **Verify:** Snapshot twice concurrently and replay a key: unique numbering and one operation outcome. Automated hash fixtures are deterministic, price/customer edits leave old bytes unchanged and submitted hash/totals cannot override server computation.
- **Evidence:** pending.

## Q4 — Share an exact saved offer

### QTE-020 — Prepare the share sheet from an acknowledged revision
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-029
- **Depends on:** QTE-009; QTE-016; QTE-018; QTE-019; Parent gate RAL-028
- **UI tasks:** Share sheet shows customer, exact revision/total, bearer-link warning and Saving/Link ready/failure. Validate international phone with focusable errors; prevent share while flush/conflict unresolved.
- **API/backend tasks:** `POST /api/quotes/:id/share` binds expected draft version, operation key and optional held token. Recompute/freeze target, acquire capability through parent contract and construct only trusted Rallie-origin URL/message; retries bind identical content.
- **DB tasks:** Atomic share status/event/revision/capability metadata under bounded operation; retain prior shared revision as historical. Never persist plaintext token for recovery.
- **Verify:** Edit then Share, lose response and retry: intended content is shared once, never a later draft under the same key. D1 tests cover stale version/invalid phone/CSRF/tenant denial and zero PDF/bill writes.
- **Evidence:** pending.

### QTE-021 — Open WhatsApp or copy the prepared link deliberately
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-029
- **Depends on:** QTE-020
- **UI tasks:** User-activated Open WhatsApp link after async save, labeled new tab; Copy link fallback, copy error/retry and honest WhatsApp opened state. Keep dialog focus logical and return to Share on close; never claim delivered/read.
- **API/backend tasks:** Consume server-encoded Click to Chat message containing seller/customer/total/link only. Verify target origin and phone encoding; public link remains revision-pinned; no WhatsApp Business API or delayed automatic redirect.
- **DB tasks:** None; opening/copying does not duplicate share events or documents.
- **Verify:** Keyboard-open and simulate popup/clipboard failure; visible fallback remains usable. Automated URL decoding finds no cost/profit/internal fields or arbitrary redirect, and repeated copy/open makes no commercial mutation.
- **Evidence:** pending.

## Q6 — History and customer proposal decisions

### QTE-022 — Browse immutable revisions and event history
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-021; RAL-026
- **Depends on:** QTE-019
- **UI tasks:** Read-only chronological timeline and labeled revision selector show actor/time/total and exact approval/PDF revision. Loading/empty/retry/permission states; keyboard navigation never enables editing a historical row.
- **API/backend tasks:** Define bounded authenticated history/revision reads with tenant-safe joins; current draft and approved historical revision remain distinct. Include later event types only when backed by actual data.
- **DB tasks:** Indexed append-only events with actor/revision/timestamp/request provenance; immutable revisions joined by quote and business.
- **Verify:** Read older revision after customer/price edits; original values and event order remain. Automated IDOR and GET-side-effect tests prove history neither generates PDF nor approves/bills.
- **Evidence:** pending.

### QTE-023 — Display the proposal diff and its eligibility
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-034
- **Depends on:** QTE-022; Parent gate RAL-033
- **UI tasks:** Pending/obsolete/accepted/rejected proposal panel with base revision, quantity changes/removals and text diffs, not color alone. Loading/error/empty states; stale comparison warns against blind application and returns focus to opener.
- **API/backend tasks:** Specify authenticated proposal detail/list DTO including base/current revision and decision eligibility; expose only owning-business proposals and retain original payload.
- **DB tasks:** None; read proposal/base-line/event records established by parent gate.
- **Verify:** Render removed Basin Mixer and Diverter 1→2, plus stale and already-decided fixtures. Keyboard/contract tests show accurate diffs, no editable customer rates and no cross-tenant proposal access.
- **Evidence:** pending.

### QTE-024 — Reject a proposal without modifying the quote
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-034
- **Depends on:** QTE-023
- **UI tasks:** Explicit rejection confirmation with pending/success/conflict/retry; preserve proposal audit and return focus to status. No required rejection comment unless contract supports it.
- **API/backend tasks:** Authenticated rejection command requires proposal/base/current version and operation key; validate nested ownership and single decision, rejecting accept/reject races.
- **DB tasks:** Atomic proposal decision plus event and unique decision guard; no draft/revision line write.
- **Verify:** Reject, retry and reload: one rejection, unchanged quote/hash. Concurrent reject/accept contract tests allow one outcome and cross-business requests fail; keyboard cancel changes nothing.
- **Evidence:** pending.

### QTE-025 — Accept allowed proposal changes into a new revision
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-034
- **Depends on:** QTE-023; QTE-019; QTE-018
- **UI tasks:** Accept into new revision confirmation; show pending/conflict and result heading with reprice/reshare instructions. Obsolete bases require reconciliation, never automatic apply; new revision is visibly unapproved.
- **API/backend tasks:** Authorized decision command binds expected current version/base/operation key; revalidate line membership and allowed quantity/removal diff, recompute seller pricing and freeze a new snapshot. Customer payload cannot set rates.
- **DB tasks:** Atomic decision/new draft+revision/event lineage within tested bounds; unique decision guard. Original revision/proposal/approval remain immutable and approval is not transferred.
- **Verify:** Accept the diff and compare old/new revisions; only intended quantities/removals differ. Parallel/stale acceptance tests produce one outcome; new content requires explicit share and fresh customer approval.
- **Evidence:** pending.

## Q7 — Consequential lifecycle commands

### QTE-026 — Revise shared or approved content explicitly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-032; RAL-026
- **Depends on:** QTE-019; QTE-022; Parent gate RAL-031
- **UI tasks:** Revise notice identifies old approval and new draft needing approval; safe confirmation focus and recoverable conflict. Billing-pending state blocks ambiguous mutation and points to its owning workflow, not an invented cancel.
- **API/backend tasks:** Define authenticated expected-version revise transition, never arbitrary status PATCH. New draft does not alter token target or prior approval; deterministic conditional transition races approval safely.
- **DB tasks:** Append lifecycle event and conditional current draft/revision/status updates; preserve approval and billed-voucher references.
- **Verify:** Revise approved rev2 toward rev3: rev2 hash/approval persist and rev3 is unapproved. Automated transition/race tests reject invalid states and old-token approval of replacement content.
- **Evidence:** pending.

### QTE-027 — Void an offer without reversing accounting
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-032; RAL-026
- **Depends on:** QTE-026
- **UI tasks:** Void confirmation names quote/revision, public consequence and no voucher reversal; initial Cancel focus, pending/success/conflict/retry. History stays browsable and status is textual.
- **API/backend tasks:** Scoped expected-version void command checks lifecycle and idempotency; public mutation eligibility reads durable void state. Preserve any accounting job's immutable payload and explicit policy gates.
- **DB tasks:** Void timestamp/event and conditional status update; no destructive historical deletion or voucher mutation.
- **Verify:** Cancel then confirm with keyboard, replay and attempt public approval/proposal: mutation fails once voided. Tests prove one audit outcome, retained history and unchanged billed voucher references.
- **Evidence:** pending.

### QTE-028 — Enforce real expiry even without a scheduler
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-032; RAL-026
- **Depends on:** QTE-026
- **UI tasks:** Display actual configured validity and expired history, not cosmetic expiry; setting/changing validity uses explicit confirmation and safe focus. Unconfigured expiry is absent; conflict/retry retains input.
- **API/backend tasks:** Define authenticated expected-version validity command and server-time eligibility policy; evaluate expiry on reads/mutations so scheduler downtime cannot admit approval. Preserve revision-bound terms and require revision when commercial terms change.
- **DB tasks:** Persist validity timestamps and append events/conditional lifecycle changes; no rewrite of frozen terms.
- **Verify:** Advance test clock past expiry with scheduler disabled: public actions fail while allowed history remains. Boundary/race tests and keyboard confirmation verify no retroactive approval or timestamp invention.
- **Evidence:** pending.

## Q5 — Explicit PDF and document history

### QTE-029 — Prepare the PDF target only on Generate
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-036
- **Depends on:** QTE-018; QTE-019; Parent gate RAL-035
- **UI tasks:** Generate PDF flushes edits, then shows preparing exact revision/error/retry with duplicate guard. No invocation on hover, prefetch, save, share or public view; keep caller focus stable.
- **API/backend tasks:** Authenticated `POST /api/quotes/:id/pdf` prepares revision/document operation using expected version/key and returns an allowlisted customer-safe document DTO. Explicitly separate preparation from render/upload completion; API does not render server-side.
- **DB tasks:** Reuse immutable snapshot and operation identity; preparation alone creates no finalized document row.
- **Verify:** Generate after an edit and compare returned revision/hash; stale/unauthorized calls fail. Automated action spy proves non-generation events never call preparation/render, and DTO contains no private cost/profit/evidence.
- **Evidence:** pending.

### QTE-030 — Lazy-render the revision with a readable document layout
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-036
- **Depends on:** QTE-029
- **UI tasks:** Dynamically load browser renderer on Generate; Loading tools/Generating revision N/failure/retry with polite announcements. Render self-hosted ₹ fonts, repeated headings, selectable text, long descriptions and unstranded totals; label Quotation — not a tax invoice.
- **API/backend tasks:** None beyond safe prepared DTO; no server browser, remote font fetch, client cost serialization or rendering of current mutable state. Include actual seller/customer/terms only; accessible HTML remains primary alternative.
- **DB tasks:** None; failed render finalizes nothing.
- **Verify:** Render long multi-page and paise fixtures; text totals/identity match frozen revision. Automated bundle test excludes renderer from initial load, render spy records explicit activation only, and PDF text contains no private fields; do not claim tagged accessibility without evidence.
- **Evidence:** pending.

### QTE-031 — Complete a local download without confusing quote tabs
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-036; RAL-037
- **Depends on:** QTE-030
- **UI tasks:** Download-ready explicit link, generation failure retry and close semantics; focusable result without stealing focus. Bind file label to originating revision even after tab switch; never claim completed downloads can be recalled.
- **API/backend tasks:** Specify authenticated idempotent successful-generation completion for download-only mode, distinct from preparation and archival. Completion asserts a client outcome, not a server-verified upload; failures never masquerade as stored artifacts.
- **DB tasks:** Introduce `quote_documents` revision/generator/time/operation uniqueness and explicit download-only state with nullable R2 key; finalize only after explicit successful rendering, not failed preparation.
- **Verify:** Generate in A, switch to B, download: A's revision/file is used. Browser restriction/retry tests keep a usable final link; duplicate completion produces one row and failed renderer produces none.
- **Evidence:** pending.

### QTE-032 — Archive the generated Blob with verified immutable metadata
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-037
- **Depends on:** QTE-031
- **UI tasks:** Separate Download ready from Stored copy, upload pending/failure/retry; preserve local download when archive fails. Keyboard retry archives the same generated document, not a new unrelated revision.
- **API/backend tasks:** Define short-lived scoped upload/finalize grants; authorize quote/revision, enforce type/size and server-computed object SHA-256, never trust browser hash. Idempotent finalize binds document operation/object; no public R2 access.
- **DB tasks:** Add immutable SHA-256/R2 key/storage status to document metadata; unique operation/object keys and revision FK. Preserve prior objects; no finalized stored record for failed upload.
- **Verify:** Fail upload then retry, replay finalize and tamper key/hash/type/size. Local R2/D1 tests produce one stored artifact, reject foreign access and retain download-only result and earlier revision documents.
- **Evidence:** pending.

### QTE-033 — Retrieve authorized historical documents
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-037
- **Depends on:** QTE-032; QTE-022
- **UI tasks:** Documents list identifies revision/date/actor and download-only versus stored state; loading/empty/error and unavailable-local-copy guidance. Named keyboard download actions return focus predictably; no automatic regeneration.
- **API/backend tasks:** Bounded authenticated document list/download contracts validate nested quote/document business ownership and issue short-lived private access only for stored objects.
- **DB tasks:** Revision/document listing index; reads never create new artifact or metadata.
- **Verify:** Retrieve an old stored PDF after customer/catalogue/quote changes: same bytes/hash. Automated IDOR/expired-grant/download-only tests deny unsafe access and show no render/R2 write triggered by list/download.
- **Evidence:** pending.

## Focused integration gates

### QTE-034 — Verify quotation isolation and immutable-price golden path
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-027
- **Depends on:** QTE-001; QTE-002; QTE-005; QTE-006; QTE-007; QTE-009; QTE-011; QTE-016; QTE-018; QTE-022
- **UI tasks:** Test only: keyboard create/select customer, search/Add, quantity/discount/manual rate, remove, save/reload; include empty quote, unknown cost and failed-save recovery on desktop/narrow screens.
- **API/backend tasks:** Extend existing role harness for quote/customer/nested-line IDs, forged totals and stale versions; no production endpoint changes unless a discovered defect gets its own fix.
- **DB tasks:** None; replay/upgrade migrations and assert ₹5,000 snapshot stays ₹5,000 after global and seller values become ₹6,000.
- **Verify:** Run the named Vitest/local-D1/Playwright matrix; expect independent server-backed tabs, unchanged snapshots and denied cross-business access. Record failures honestly; this focused gate does not certify sharing or Tally.
- **Evidence:** pending.

### QTE-035 — Verify PDF laziness, privacy and revision binding
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-038
- **Depends on:** QTE-029; QTE-030; QTE-031; QTE-032; QTE-033
- **UI tasks:** Test only: keyboard Generate, renderer failure, archive failure, retry, old-document retrieval and mobile public viewing. Verify progress does not duplicate activation or obscure focus.
- **API/backend tasks:** Instrument renderer/preparation/R2 calls across save, share, price edit, customer view, approval and explicit Generate; check rendering/public DTO allowlists and nested document authorization.
- **DB tasks:** None; compare finalized document rows/object hashes before and after the event matrix.
- **Verify:** Non-generation events create zero PDF rows/artifacts; explicit successful Generate creates the expected revision document. Failed rendering creates none, optional archival is independent, and changed quote generates a new artifact without replacing old bytes.
- **Evidence:** pending.

## Screen integration checklist — all pending

- [ ] Q1: QTE-001–QTE-002 list/filter state and server aggregate agree; New/Open reuse QTE-003–QTE-004.
- [ ] Q2 frame: QTE-003–QTE-007 server-backed tabs, restoration, close guard and narrow layout preserve independent work.
- [ ] Q3 and Q2 editing: QTE-008–QTE-019 cover customer, search/adoption, line CRUD, pricing, save conflicts and immutable snapshots; relationship additions wait for Parent gate RAL-060.
- [ ] Q4: QTE-020–QTE-021 await capability gate and expose exact revision plus usable WhatsApp/copy fallback; capability issuance/reuse/revocation remains Parent gate RAL-028.
- [ ] Q6: QTE-022–QTE-025 keep history immutable; proposal acceptance requires reshare and fresh approval.
- [ ] Q7: QTE-026–QTE-028 enforce revise/void/expiry; billing entry waits for Parent gate RAL-068 and Parent gate RAL-071, and never invokes billing from history.
- [ ] Q5: QTE-029–QTE-033 separate preparation, browser render, local download and optional archival; QTE-035 verifies no implicit PDFs.
- [ ] QTE-034 closes only the quotation foundation; parent sharing/PDF gates remain mandatory before ingestion.

## Parent-to-child map

| Parent | Child tickets |
| --- | --- |
| RAL-020 | QTE-003, QTE-008, QTE-009 |
| RAL-021 | QTE-012, QTE-019, QTE-022 |
| RAL-022 | QTE-013, QTE-014, QTE-016 |
| RAL-023 | QTE-004–QTE-007 |
| RAL-024 | QTE-010–QTE-012 |
| RAL-025 | QTE-006, QTE-013–QTE-015, QTE-017–QTE-018 |
| RAL-026 | QTE-001–QTE-002, QTE-022, QTE-026–QTE-028 |
| RAL-027 | QTE-034 |
| RAL-029 | QTE-020–QTE-021 |
| RAL-032 | QTE-026–QTE-028 |
| RAL-034 | QTE-023–QTE-025 |
| RAL-036 | QTE-029–QTE-031 |
| RAL-037 | QTE-031–QTE-033 |
| RAL-038 | QTE-035 |