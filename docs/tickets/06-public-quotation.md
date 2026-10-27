# 06 — Public quotation

Documentation-only decomposition of [IMPLEMENTATION](../IMPLEMENTATION.md), whose 80 parent requirements remain authoritative. Screen sources are [DESIGN](../DESIGN.md) P1–P4, Q4 capability controls and §§5–6. No parent/index changes or implementation completion are claimed here.

**Parent coverage (5):** RAL-028, RAL-030, RAL-031, RAL-033, RAL-035.

**22 tickets:** PUB-001–PUB-022, each a roughly half-day feature or focused test slice after dependencies. Read screenwise; execute by dependencies, including later-listed capability infrastructure. `Parent gate RAL-xxx` means the original cross-file parent acceptance gate. Seller share delivery, lifecycle commands and proposal decisions stay with their owning parent gates; no speculative cross-file child IDs are used.

## Working contract

- Customers possess a bearer capability, not a Rallie account or verified legal identity. Every public request verifies token hash, exact revision binding and allowed operation. Public reads are side-effect-free; approval is not payment, billing or PDF generation.
- Public schemas are constructed from an explicit safe allowlist, never by serializing an internal entity and deleting fields. Cost/profit, private aliases, extraction provenance, unshared drafts and unrelated identifiers stay absent from network, DOM, accessibility text, PDF/download paths, analytics and logs.
- Use bounded typed requests, stable safe errors, rate limits, HTTPS, private/no-store and no-referrer responses. No third-party analytics, sensitive local-storage persistence or logged raw tokens. Seller capability controls require Owner/Employee membership, nested ownership and CSRF/origin protection.
- UI tickets inherit loading/empty/unavailable/validation/pending/success/recoverable-error states as relevant, visible focus, native controls, Tab/Shift+Tab and Enter/Space. Modal Escape/cancel restores focus; consequential confirmation starts at Cancel or explanatory content. Never intercept IME composition or browser shortcuts.
- D1 transactions are bounded atomic batches; conditional state and durable operation keys, not browser disabling, enforce idempotency. Migrations need empty replay/upgrade tests. Evidence remains pending until commands, environment, commit, assertions and traces are recorded; no implementation tests are claimed by this documentation task.

## P1 — Read a customer-safe offer

### PUB-001 — Project only the capability-bound safe revision
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-019; Parent gate RAL-029
- **UI tasks:** Define loading, ready, empty/unavailable and retry fixtures for P1; no new widget in this contract slice. Errors carry safe copy and retry information for keyboard-accessible consumers.
- **API/backend tasks:** Implement `GET /api/public/quotes/:shareToken` with explicit safe DTO: seller/customer display, date/revision/hash, snapshot lines, totals and eligible action flags. Token binds one immutable revision; never follow mutable current-draft pointer or serialize internal entities.
- **DB tasks:** None; read capability/revision and safe lifecycle state using authorized joins; isolate any operational access telemetry from commercial events.
- **Verify:** Compare allowlist response snapshots with an internal fixture containing distinctive cost/alias/evidence markers: none leak. Automated foreign-revision/token and GET-side-effect tests show no approval, revision, PDF or voucher writes.
- **Evidence:** pending.

### PUB-002 — Render the mobile offer header and safe status
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-001
- **UI tasks:** Single reading column with shop identity/contact, quote/customer/date/revision, actual validity and textual status. No app rail/login/catalogue links/ads. Support loading/error/empty states; linear heading order and keyboard Retry.
- **API/backend tasks:** Consume only safe header/status fields; contact is shown only when the token is authorized to reveal it. Do not fetch internal business/customer objects to fill missing data.
- **DB tasks:** None.
- **Verify:** Open at 320–360 px and keyboard-read heading/contact/status; unsupported fields stay absent rather than invented. Automated DOM/network tests find no internal shell, private fields, registration requirement or access to unshared customer edits.
- **Evidence:** pending.

### PUB-003 — Display snapshot lines and exact totals accessibly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-002
- **UI tasks:** Show brand/name/SKU, quantity/UOM, MRP/discount where appropriate, agreed rate and line/quote totals. Handle long names, paise, empty lines and safe tax/terms context without horizontal dependence; never show profit, even hidden or in accessible descriptions.
- **API/backend tasks:** Format frozen values under the shared currency policy; do not recalculate from live catalogue prices or request seller pricing. Invalid/incomplete safe data becomes unavailable, not guessed totals.
- **DB tasks:** None.
- **Verify:** Change seller/global MRP and reopen token: displayed revision/amount remains identical. Automated money/DOM/accessibility snapshots and mobile long-line fixtures preserve exact paise and contain no private markers.
- **Evidence:** pending.

### PUB-004 — Expose only eligible actions without disturbing reading
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-003
- **UI tasks:** Approve/Suggest changes/contact actions reflect safe eligibility; already-approved displays revision/time instead of duplicate CTA. Changes sent, seller preparing, historical approval and billing acknowledgment are truthful, not an invoice. Sticky actions reserve safe-area space and never hide focus.
- **API/backend tasks:** Consume server eligibility; refresh offers a deliberate View latest action only when authorized, never auto-replaces reading/selection or exposes a new revision via old token. UI disabling is not server authorization.
- **DB tasks:** None.
- **Verify:** Exercise all safe status fixtures with keyboard on mobile; focus/selection remains after refresh. Automated tests show no active mutation CTA for ineligible state, no invented invoice and no commercial writes from rendering/refresh.
- **Evidence:** pending.

## P2 — Approve exactly the displayed revision

### PUB-005 — Confirm the shop, revision and amount deliberately
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-031
- **Depends on:** PUB-004
- **UI tasks:** Confirmation names shop/quote/exact revision and total, explains not payment, offers Cancel and Approve ₹X. Initial explanatory/Cancel focus, modal trap, Escape restore and pending duplicate guard; no global approval shortcut.
- **API/backend tasks:** Define typed approval request carrying displayed revision ID/content hash and operation key; validate locally without substituting whatever revision becomes current. No mutation until explicit confirm.
- **DB tasks:** None; persistence belongs to PUB-006.
- **Verify:** Open/cancel then reopen and confirm by keyboard; screen reader announces amount/revision. Component tests prove cancel/view/IME Enter sends nothing, and request captures displayed identity/hash, not a later response's values.
- **Evidence:** pending.

### PUB-006 — Atomically record one eligible exact-revision approval
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-031
- **Depends on:** PUB-005; PUB-019
- **UI tasks:** Consume pending/approved/retry/conflict contract; success identifies exact revision/time and focuses result heading. No additional screen beyond P2.
- **API/backend tasks:** `POST /api/public/quotes/:shareToken/approve` verifies token binding, current shared eligibility, non-void/non-expired state and immutable hash in one conditional operation. Bind key to payload; reject forged hashes and stale targets, never approve newer content implicitly.
- **DB tasks:** Add approval quote/revision/hash/time/capability/customer-name record, applicable uniqueness policy, durable operation result and audited APPROVED transition in bounded atomic batch.
- **Verify:** Double-submit/parallel same operation yields one approval/event and consistent response. D1 tests reject wrong hash/revision, revoked capability, expired/void offer and key with changed payload; original revision bytes never change.
- **Evidence:** pending.

### PUB-007 — Require renewed confirmation after a stale approval
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-031
- **Depends on:** PUB-006
- **UI tasks:** Stale result explains shop updated quotation, preserves old context and focuses reload instruction. View latest is explicit and available only through authorized capability policy; otherwise ask shop for a new link. Never auto-confirm the replacement.
- **API/backend tasks:** Return stable non-enumerating conflict and authorized recovery metadata; do not let an old capability fetch/approve an unrelated replacement revision. New confirmation obtains its own expected revision/hash.
- **DB tasks:** None.
- **Verify:** Customer loads rev1; seller shares rev2; submit rev1. Automated race test confirms neither obsolete offer nor rev2 is approved, and UI requires deliberate new review/confirmation before any successful action.
- **Evidence:** pending.

### PUB-008 — Recover an approval after a lost response
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-031
- **Depends on:** PUB-006
- **UI tasks:** Checking approval status after uncertain network outcome; retained operation context, honest pending/error and keyboard Retry. Never invent success or immediately offer a second independent approval; success announces recorded revision/time.
- **API/backend tasks:** Specify capability-scoped safe approval-result read or replay of the same key/payload; response reports durable outcome only. Rate-limit checks; revalidate token and never persist raw capability in local storage.
- **DB tasks:** None; reuse durable approval-operation result/uniqueness.
- **Verify:** Drop response after commit, reload/check/retry: one approval is shown and no new operation is silently created. Automated pre-commit disconnect versus post-commit disconnect tests distinguish unknown from success and deny invalid-token outcome reads.
- **Evidence:** pending.

### PUB-009 — Gate proposals on passing approval-locking races
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-031; RAL-035
- **Depends on:** PUB-006; PUB-007; PUB-008
- **UI tasks:** Test only: two customer tabs, slow submit, stale confirmation and double activation preserve context/focus and exact amount announcements.
- **API/backend tasks:** Add deterministic concurrent share/edit-versus-approve tests using the existing seller revision contracts; verify serialized eligible outcome, not mutable-pointer inference. This is the approval-locking prerequisite for proposal work.
- **DB tasks:** None; inspect immutable hashes, conditional current-state guards, single approval and append-only audit.
- **Verify:** Run local-D1 race matrix repeatedly with controlled barriers; one valid outcome, no newer implicit approval, no duplicate record. Record failures as blocking; proposals cannot claim readiness before this gate passes.
- **Evidence:** pending.

## P3 — Propose quantity/removal changes only

### PUB-010 — Edit requested quantities against a named base
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-033
- **Depends on:** PUB-009; Parent gate RAL-032
- **UI tasks:** Show base revision and original/requested quantities with product-labeled controls, inline errors and pending-shop-review total wording. No fields for MRP/discount/rate/cost or add-item picker; cancel returns to Suggest changes with dirty protection.
- **API/backend tasks:** Define local proposal draft schema using allowed base-line IDs and domain quantity bounds; safe revision DTO is the only source. No network mutation while typing and no price-setting operations in contract.
- **DB tasks:** None; unsent editing is not a seller draft or approval.
- **Verify:** Keyboard edit fractional/boundary quantities and cancel; original quote remains identical. Component tests reject invalid values, retain fields after validation and expose no unauthorized commercial or catalogue-add controls.
- **Evidence:** pending.

### PUB-011 — Remove or restore proposal lines explicitly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-033
- **Depends on:** PUB-010
- **UI tasks:** Named Remove/Undo removal with original/requested diff and stable focus. All-removed proposal requires explicit confirmation, not a silently agreed zero-value order; no-difference state disables Send with explanation.
- **API/backend tasks:** Normalize allowed quantity/removal payload against base revision; distinguish removals from invalid zero quantity and unchanged rows. No server mutation in this editing slice.
- **DB tasks:** None.
- **Verify:** Remove/restore first and last lines using keyboard, then attempt all-removed submission. Automated diff tests show no hidden line duplication, unchanged rates and explicit all-removed confirmation.
- **Evidence:** pending.

### PUB-012 — Persist one pending proposal without editing the quote
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-033
- **Depends on:** PUB-011; PUB-019
- **UI tasks:** Send changes pending/submitted/error with duplicate guard; confirmation says quote has not changed yet. Preserve local fields on recoverable failure and focus submitted result only after durable response.
- **API/backend tasks:** `POST /api/public/quotes/:shareToken/proposals` takes base revision, allowed line operations and key. Verify eligibility/token/base/line ownership, reject all price/internal/business fields and stale/unknown lines; throttle spam and bind canonical payload hash.
- **DB tasks:** Add `customer_proposals` quote/base/capability/payload/hash/time/PENDING with unique scoped operation and immutable submitted content; no quote-line updates.
- **Verify:** Submit/replay same proposal: one pending row and unchanged seller revision/hash/approval. Contract tests inject MRP/cost/discount/price/foreign lines and changed-key payload: all fail without partial writes.
- **Evidence:** pending.

### PUB-013 — Retain proposal input across retry and stale-base conflicts
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-033
- **Depends on:** PUB-012
- **UI tasks:** Keep edited values after failure; same-operation retry after lost response. Stale base shows comparison/review instruction, withdrawn/unavailable blocks Send, and cancellation restores focus. Never silently rebase requests onto new prices.
- **API/backend tasks:** Provide safe replay/status outcome and explicit stale eligibility code; recovery requires deliberate new base and operation. Mark persisted proposals obsolete when appropriate without destroying original payload or line references.
- **DB tasks:** Proposal status/obsolescence reason and audit link; retain base revision/provenance and original payload.
- **Verify:** Lose submit response, retry, then change seller revision before another submit. Automated tests retain one original proposal, reject stale mutation, preserve unsent input and never rewrite old evidence to match newer content.
- **Evidence:** pending.

### PUB-014 — Show proposal outcome without implying acceptance or approval
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-033
- **Depends on:** PUB-013
- **UI tasks:** Pending, obsolete, accepted and rejected safe outcome copy; requested quantities remain a request until shop action. Repriced/new offer requires new review/approval; no public price editing or implied final total. Status refresh never steals focus.
- **API/backend tasks:** Define capability-bound safe proposal status DTO; expose no seller decision internals or another capability's proposals. Integrate seller outcomes only behind Parent gate RAL-034; deterministic fixtures can verify UI before that gate.
- **DB tasks:** None; read existing status and base/new-revision lineage without mutation.
- **Verify:** Render each contract fixture and later integrate actual seller accept/reject: original proposal remains readable and quote approval is never inherited. Automated privacy/side-effect tests assert outcome viewing changes no seller data.
- **Evidence:** pending.

## P4 — Unavailable, historical and network states

### PUB-015 — Render non-enumerating invalid or revoked link states
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-019
- **UI tasks:** Generic unavailable-link explanation and ask-shop guidance; no internal shell, unauthorized contact or active approval/proposal controls. Heading receives appropriate route focus and plain keyboard navigation works.
- **API/backend tasks:** Map malformed/unknown/revoked/unauthorized capability responses to consistent safe shape; no lookup hints, business identity or distinguishable secret-debug output. Rate-limit repeated guessing.
- **DB tasks:** None.
- **Verify:** Open malformed, guessed, revoked and foreign-revision fixtures. Automated response/DOM checks reveal no quote/shop existence, raw token or private data; mutation attempts fail generically.
- **Evidence:** pending.

### PUB-016 — Distinguish historical offers from current eligible offers
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-004; Parent gate RAL-032
- **UI tasks:** Historical/expired/void/approved-old-revision copy follows actual capability policy; show safe history only if authorized and no active mutation controls. Explain new offer needs review; keyboard View latest is never an implicit approval.
- **API/backend tasks:** Consume safe lifecycle eligibility; expired capability itself uses generic unavailable policy, while a valid capability may reveal expired-offer history only if permitted. Old links never follow the draft or approve replacement content.
- **DB tasks:** None; reads evaluate durable state and server-time validity.
- **Verify:** Advance time, void and revise approved offers; mobile UI reflects exact old revision without enabling mutation. Automated scheduler-disabled expiry and old-token tests preserve old approval while rejecting new-content approval through that token.
- **Evidence:** pending.

### PUB-017 — Treat network failure as retryable uncertainty, not withdrawal
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-030
- **Depends on:** PUB-002; PUB-008; PUB-013
- **UI tasks:** Network Retry distinct from unavailable link; retain reading/proposal context and in-flight approval check state. No repeated focus jumps/live announcements; online recovery must not submit automatically.
- **API/backend tasks:** Classify network/service errors separately from capability denial with bounded retry/backoff; no token-bearing telemetry or sensitive browser storage. Stop abandoned reads without treating a canceled request as a commercial failure.
- **DB tasks:** None.
- **Verify:** Offline read, offline proposal edit and lost approval response each recover through their correct explicit path. Browser tests show no false withdrawn/success message, duplicate mutation or token logging after reconnect.
- **Evidence:** pending.

## Supporting capability service and Q4 link controls

These are shared security/controls prerequisites, not extra customer screens. Complete them before their dependent P1 tickets; the seller share transaction remains Parent gate RAL-029.

### PUB-018 — Issue random revision-bound capabilities with hash-only storage
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-028
- **Depends on:** Parent gate RAL-027
- **UI tasks:** N/A for backend issuance; define safe issued/unavailable/expired diagnostics for Q4 without returning recoverable token lists. No separate keyboard surface.
- **API/backend tasks:** Define authorized issuance service for Owner/Employee, cryptographic entropy policy, revision eligibility and one-time plaintext return. Record TTL/replacement policy explicitly; rate-limit issuance, redact token/URL and never expose token recovery endpoint.
- **DB tasks:** Capability unique hash, quote/revision/issuer/created/expiry/revoked metadata with FKs and indexes; no plaintext share-token column or plaintext cached idempotency result.
- **Verify:** Issue for a saved revision and inspect D1/logs: hash/metadata only. Automated randomness-format, tenant/CSRF/revision authorization and migration tests reject invalid issuance and ensure response capture is the only plaintext delivery.
- **Evidence:** pending.

### PUB-019 — Resolve capabilities securely on every public request
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-028
- **Depends on:** PUB-018
- **UI tasks:** N/A for middleware; safe error/eligibility DTO feeds public loading/unavailable/retry states without private diagnostics.
- **API/backend tasks:** Hash lookup and bounded timing-safe comparison where applicable; enforce revision binding, expiry/revocation and action scope. Apply rate limits, private no-store/no-referrer headers, log redaction and no third-party token leakage; GET is read-only.
- **DB tasks:** None beyond hash index and metadata; no access-as-approval event or token plaintext persistence.
- **Verify:** Test unknown/expired/revoked/valid tokens and cross-revision mutations; only authorized bound revision is readable. Automated header/log/redirect tests find no token leaks, and DB state remains unchanged by lookup.
- **Evidence:** pending.

### PUB-020 — Reuse a held link or explicitly replace lost plaintext
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-028
- **Depends on:** PUB-018; PUB-019
- **UI tasks:** Q4 Copy/reuse/regenerate controls with bearer warning and accessible pending/success/error. Explain lost plaintext cannot be recovered; explicit replacement consequence and safe confirmation focus. Keep tokens out of persistent browser storage.
- **API/backend tasks:** Authenticated reuse verifies held token hash, quote/revision and eligibility. Missing/invalid token requires new capability under declared revoke/keep policy; lost-response retry may rotate rather than reconstruct. Bind operation recovery without persisting plaintext token results.
- **DB tasks:** Atomic capability replacement metadata/event where policy requires; retain historical binding and hash-only storage.
- **Verify:** Reuse valid held token, clear it, then replace after a lost issuance response. Automated tests prove no reconstruction/list endpoint, no same key sharing different content, correct prior-link policy and no raw tokens in D1/logs/local storage.
- **Evidence:** pending.

### PUB-021 — Revoke a public capability deliberately
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-028
- **Depends on:** PUB-019
- **UI tasks:** Q4 revoke confirmation names affected revision/access consequence without displaying unavailable secret. Pending/already-revoked/success/conflict/retry states; Cancel initial focus and return to invoking control.
- **API/backend tasks:** Define authenticated Owner/Employee revoke command using capability metadata ID, expected state/key and nested quote ownership; CSRF protected. Public reads/mutations immediately recheck revocation; no arbitrary business capability listing.
- **DB tasks:** Conditional revoked timestamp and audited actor/action; idempotent result, no deletion of revision or approval history.
- **Verify:** Revoke/replay then attempt public GET/approve/propose: all denied per safe policy. Race and tenant tests prevent post-revocation mutation; historical approval remains, and keyboard cancel leaves link usable.
- **Evidence:** pending.

## Focused public integration gate

### PUB-022 — Verify sharing privacy and the cross-screen revision journey
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-035
- **Depends on:** PUB-009; PUB-014; PUB-015; PUB-016; PUB-017; PUB-020; PUB-021; Parent gate RAL-029; Parent gate RAL-034
- **UI tasks:** Test only: seller share/copy popup fallback, mobile read/approve, propose, seller reject/accept/reprice/reshare and fresh approval; include 320–360 px, keyboard, stale tab and slow network.
- **API/backend tasks:** Extend adversarial suite for token guessing, rate limits, forged hash, cross-quote token, seller CSRF, proposal price injection, headers and allowlist privacy. No real WhatsApp delivery claim and no account requirement.
- **DB tasks:** None; inspect hash-only persistence, deterministic hashes, immutable lineage and one approval/decision under parallel requests.
- **Verify:** Run local-D1 and browser journey; expect exact-revision approval, pending proposals without quote edits, old approval retained and new offer requiring new approval. Assert public network/DOM/accessibility/download/log surfaces contain no cost/profit/token leakage and view creates no PDF/voucher; capture evidence before closing parent gate.
- **Evidence:** pending.

## Screen integration checklist — all pending

- [ ] P1: PUB-001–PUB-004 safe header/lines/totals and eligibility render only the bound immutable revision.
- [ ] P2: PUB-005–PUB-009 confirmation, atomic approval, stale recovery and uncertain response pass locking tests before proposals.
- [ ] P3: PUB-010–PUB-014 restrict to quantity/removal, preserve requests, distinguish pending versus accepted and integrate Parent gate RAL-034 without transferring approval.
- [ ] P4: PUB-015–PUB-017 separate unavailable/historical/network states without leaking identity or moving focus.
- [ ] Q4 support: PUB-018–PUB-021 complete hash-only issue/resolve/reuse/revoke; actual share transaction and WhatsApp presentation use Parent gate RAL-029.
- [ ] PUB-022 closes only the sharing slice; add-item catalogue proposals and opt-in billing policies remain deferred under Parent gate RAL-076, not first-release controls.

## Parent-to-child map

| Parent | Child tickets |
| --- | --- |
| RAL-028 | PUB-018–PUB-021 |
| RAL-030 | PUB-001–PUB-004, PUB-015–PUB-017 |
| RAL-031 | PUB-005–PUB-009 |
| RAL-033 | PUB-010–PUB-014 |
| RAL-035 | PUB-009, PUB-022 |