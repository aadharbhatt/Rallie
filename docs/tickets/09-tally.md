# 09 — Tally screens and deterministic bridge

Sources: [parent requirements and operational boundary](../IMPLEMENTATION.md), [T1–T6, S3 and shared UI design](../DESIGN.md).

All tickets are TODO planning, not implementation evidence. Target one roughly half-day behavior or bounded test exercise per ticket, using the listed dependencies. Parent requirements remain authoritative. API paths marked proposed must be finalized with fixtures. Cross-file gates use RAL parents only. Listing screens first does **not** change delivery order: typed fake protocol → pairing/real transport/Windows bridge → **real stock sync** → mappings → requested masters → approved Sales Vouchers → fault/reconciliation gate. Real stock evidence is required before mapping implementation; stock-item success and accounting-context sign-off precede real voucher work. Fake success is explicitly labeled, production refuses mock, and missing Windows/Tally access blocks real gates.

## Parent mapping inventory

| Parent | Required coverage | Children |
| --- | --- | --- |
| RAL-061 | Typed deterministic protocol, durable jobs, opt-in fake | TAL-025–TAL-027 |
| RAL-062 | Owner pairing, company confirmation, rotation/revocation | TAL-002–TAL-005 |
| RAL-063 | Hibernating DO, outbound WSS, scoped/fenced transport | TAL-001, TAL-028, TAL-034 |
| RAL-064 | Real Windows service, SQLite execution ledger, safe local XML | TAL-029–TAL-031 |
| RAL-065 | Real stock masters, triggers, generations and truthful freshness | TAL-006–TAL-008 |
| RAL-066 | Explicit mapping proposals/confirmation, invalidation | TAL-009–TAL-011, TAL-035 |
| RAL-067 | Explicit stock-item request and verified identity | TAL-012–TAL-013 |
| RAL-068 | Approved immutable preflight, accounting context, stock policy | TAL-014–TAL-016 |
| RAL-069 | Normal Sales Voucher, truthful response and totals reconciliation | TAL-017–TAL-018 |
| RAL-070 | Safe retry, ACK loss, uncertain crash, reconciliation, fencing | TAL-021–TAL-022, TAL-032–TAL-034 |
| RAL-071 | Status, inventory, jobs, diagnostics, asymmetric visibility | TAL-001, TAL-019–TAL-024 |
| RAL-072 | Real Windows/Tally security, one-voucher and role/keyboard gates | TAL-036–TAL-038 |

All operational APIs authorize current business membership and bind connection/company/item/job server-side; only Owner may change setup/credentials. Device credentials never substitute for seller authorization. Tally owns accounting/inventory; Rallie owns quotation pricing. Tally→Rallie carries masters, stock, identities, selected rate observations and results; Rallie→Tally carries explicitly requested masters and approved customer/line/quantity/rate/voucher context. No automatic two-way price loop, inbound shop port, AI reasoning or MCP in billing.

## T1 — Connection overview

### TAL-001 — Show four separate connection and freshness facts
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-063, RAL-071
- **Depends on:** TAL-027
- **UI / keyboard:** Bridge connection, Tally reachable, Confirmed company and Last stock sync independently labeled. Not configured/pairing/offline/reconnecting/stale/Tally closed/no company/wrong company/error states; Owner setup link, Employee asks Owner. Mock badge never blends with real. Native links and restrained start/result announcements.
- **API / backend:** Proposed business-scoped `GET /api/tally/status` returns independent observed timestamps/states and permitted actions; do not infer stock freshness from heartbeat.
- **DB / migrations:** None; read persisted connection/job/sync state, not socket-memory truth.
- **Verify:** Fake fixtures vary each fact independently; automate Owner/Employee/other-business access and unknown/stale display. Last-known stock remains dated while bridge is offline; status refresh never steals focus.
- **Evidence:** pending; fake UI verification is not real connectivity evidence.

## S3 — Owner setup and connection management

### TAL-002 — Generate and regenerate an expiring pairing code
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-062
- **Depends on:** TAL-027
- **UI / keyboard:** Explain Windows bridge, Tally running/company loaded/HTTP enabled; trusted download only when available. Owner-only Connect shows code like RALLIE-8F3D-92KQ, expiry, Copy, waiting/expired and Regenerate; ordered step heading focus, selectable code, no timed keyboard puzzle.
- **API / backend:** Proposed owner-only `POST /api/tally/pairing-challenges` with TTL, rate limits and regeneration-invalidates-old policy; redact code from logs/analytics and deny Employee requests.
- **DB / migrations:** Add hashed, expiring, single-use challenges bound to business/owner with consumed/revoked timestamps; no plaintext code persistence.
- **Verify:** Generate/copy/expire/regenerate; old code fails, new code works only once. Automate role/tenant denial, throttle and log-redaction tests.
- **Evidence:** pending TTL/storage policy and tests.

### TAL-003 — Redeem a pairing challenge for a scoped device
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-062
- **Depends on:** TAL-002
- **UI / keyboard:** Setup waits for bridge, then reports paired device/local probe pending; wrong/expired/replayed code gives safe retry. Installer pairing input has label/error focus; no browser localhost XML call.
- **API / backend:** Proposed redeem endpoint atomically consumes hashed challenge, issues device-scoped credentials, rate-limits brute force and forbids device-chosen business/company. Transport is outbound TLS only.
- **DB / migrations:** Introduce tally_connections business/device/status/last_seen/credential metadata; unique challenge consumption/device binding; no plaintext device secret in cloud DB.
- **Verify:** Race two redeem requests: one credential issuance. Automate expired/replayed/wrong-business attempts, transaction rollback and secrets absence; opt-in fake remains visibly fake.
- **Evidence:** pending.

### TAL-004 — Confirm the discovered fiscal company explicitly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-062
- **Depends on:** TAL-003
- **UI / keyboard:** Reachability/no-company/multiple-company/selected-company-gone states; radio/select lists full company/fiscal identity, e.g. Arihant Sanitation FY26-27. Explicit Confirm, never first-company auto-bind; step focus and resumable server-backed wizard.
- **API / backend:** Typed list-company result bound to paired device; owner-only company-confirm validates discovered identity/version. Record confirmed context before authorizing initial sync; forged Employee/device company choice denied.
- **DB / migrations:** Add confirmed company key/fiscal identity/config version/actor/time; connection remains unconfirmed until command succeeds.
- **Verify:** Discover two companies and explicitly choose second; no jobs against first. Automate disappeared company, stale discovery, tenant/role denial and reload retaining confirmed setup.
- **Evidence:** pending.

### TAL-005 — Rotate or revoke a connection without losing unknown jobs
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-062
- **Depends on:** TAL-004
- **UI / keyboard:** Owner-only rotate/disconnect confirmation explains pending and uncertain jobs; revoked/failed/connected states; safe Cancel focus. Normal Sales only in v1; optional voucher/auto-billing controls absent until deferred approval.
- **API / backend:** Owner-only credential rotation/revoke command checks config version; invalidate old credential/sessions and preserve authorized read/reconciliation access to retained jobs. Company reconfiguration must invalidate old mapping eligibility.
- **DB / migrations:** Credential generation/revocation metadata and audited config changes; never cascade-delete jobs, company evidence or local intent.
- **Verify:** Old credentials cannot handshake, dispatch or submit result after revocation; rotated credentials remain scoped. Automate Employee denial and pending/UNCERTAIN job retention after disconnect.
- **Evidence:** pending.

## T1–T2 — Inventory synchronization and dated observations

### TAL-006 — Schedule one stock refresh per confirmed context
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-065
- **Depends on:** TAL-005, TAL-031
- **UI / keyboard:** Sync now with active-equivalent-job explanation; pending/start/result announcements, navigation allowed while sync runs; company always visible.
- **API / backend:** Typed sync-items jobs for startup, reconnect, manual, pre-billing and configured connected-only periodic interval. Recheck confirmed company per run; dedupe equivalent triggers, not continuous mirroring. Document chosen interval and tested initial XML path versus ODBC capability differences.
- **DB / migrations:** Scoped sync generation/job keys, durable trigger/attempt state; interval configuration version and no socket-only queue.
- **Verify:** Fire reconnect/manual/periodic together: one logical refresh; offline retains pending durable work and wrong company blocks. Automate trigger matrix with fake, then execute real XML refresh.
- **Evidence:** pending interval decision, real bridge/XML trace.

### TAL-007 — Browse stock with units and absolute freshness
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-065
- **Depends on:** TAL-006
- **UI / keyboard:** Native item table: stable identity/name, aliases/Part No if supplied, UOM, observed closing/current stock, optional configured rate, sync timestamp and mapping link. “14 pcs · Last synced 7 minutes ago” has absolute accessible time; unknown Not available, never 0. Loading/empty/stale/error preserve last-known data.
- **API / backend:** Proposed paginated company/business-scoped items GET returns observations with generation/completeness/time, not seller selling-price updates; bound page/search input.
- **DB / migrations:** Introduce tally_items unique connection/company/item key with aliases/UOM/stock/rate/sync time; stable key policy documented from real response.
- **Verify:** Real item fixture populates identity/unit/rate correctly; unknown/stale distinct. Automate tenant/company isolation, pagination and assertion that row view/sync does not mutate shop prices.
- **Evidence:** pending real XML fixture and screen trace.

### TAL-008 — Publish complete sync generations without false freshness
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-065
- **Depends on:** TAL-007
- **UI / keyboard:** Partial/failed sync identifies incomplete observations and safe Retry; no full-fresh badge after partial results. Focus remains on explicit action; missing/deleted items explained.
- **API / backend:** Validate generation/checkpoint ownership and company on each result; define tombstone/removal policy and resume without mixing concurrent generations.
- **DB / migrations:** Generation checkpoints/completion marker, item observation generation and tombstone constraints; stale attempt cannot publish newest snapshot; rates remain observations.
- **Verify:** Fail midway then reconnect/retry; full freshness changes only after complete valid generation, no deleted live item from partial page. Automate stale result and concurrent sync; record successful real stock sync **before mapping work**.
- **Evidence:** pending real stock gate and failure-injection report.

## T3 — Mapping queue and confirmation

### TAL-009 — Propose explainable candidates without accounting approval
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-066
- **Depends on:** TAL-008
- **UI / keyboard:** Unmapped/Proposed/Confirmed/Rejected filters; seller brand/SKU/name versus candidates identity/name/UOM/stock/time/reason. Radio group includes None of these; manual search always available; keyboard arrows/Space choose, not confirm.
- **API / backend:** Scoped mapping proposal/list contract: existing confirmed wins, exact SKU→Part No/alias, exact normalized name, then brand+fuzzy candidate, otherwise unmapped. Even exact/high-confidence proposal requires explicit confirmation.
- **DB / migrations:** Introduce seller_product_tally_map with business/seller product/connection/company/item key/method/confidence/status/version/confirmed_by/at; scoped uniqueness and endpoint FKs.
- **Verify:** Fixture each ranking tier and similar SKU/name; none automatically becomes confirmed. Automate foreign-company candidate filtering and stable confirmed mapping reuse.
- **Evidence:** pending mapping fixtures after real stock gate.

### TAL-010 — Confirm or reject the selected mapping explicitly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-066
- **Depends on:** TAL-009
- **UI / keyboard:** Confirm mapping button names selected company/item; None/reject stays unmapped. Pending/error/version-conflict/confirmed states; optional next row only after explicit action, no refresh focus theft.
- **API / backend:** Owner/Employee confirm/reject command validates same business/connection/company/seller item, expected version and operation key; candidate confidence cannot authorize command.
- **DB / migrations:** Atomic confirmation/rejection actor/time/version update under scoped unique map; retain rejection evidence.
- **Verify:** Select exact proposal then confirm; only now eligible. Automate cross-company item spoof, two-user race, repeat confirmation and None remaining unbillable.
- **Evidence:** pending.

### TAL-011 — Reassign and invalidate mappings only for future work
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-066
- **Depends on:** TAL-010
- **UI / keyboard:** Reassignment previews old/new stable identity/company and future-only effect; company changed/item removed becomes invalid/unmapped with actionable recovery; keyboard confirmation returns to detail.
- **API / backend:** Scoped versioned reassignment/invalidation policy tied to real item-key stability; verify current confirmed context. Existing billing payloads/history are immutable and cannot silently follow reassignment.
- **DB / migrations:** Preserve map version history or equivalent immutable job snapshots; tombstone/company-config change invalidates active eligibility without deleting old evidence.
- **Verify:** Reassign after a historical job fixture: old evidence unchanged, new preflight sees new map. Automate deletion/company change, stale version and mismatched UOM review cases.
- **Evidence:** pending.

## T4 — Explicit stock-item creation

### TAL-012 — Confirm a missing master request or cancel without writes
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-067
- **Depends on:** TAL-011
- **UI / keyboard:** Unmapped actions Create stock item in Tally / Map manually / Cancel; form shows confirmed company, name/SKU/UOM/required master context and accounting-side consequence. Validation summary, safe focus, pending and return to mapping list.
- **API / backend:** Proposed scoped create-item endpoint validates allowed fields, seller item/company/UOM/master context and operation key, then persists typed job; never auto-create all missing masters during billing.
- **DB / migrations:** Existing durable cloud/local intent records hold immutable payload/hash; no optimistic tally_item/mapping insert.
- **Verify:** Cancel and Map manually cause no accounting write; invalid UOM blocks enqueue. Automate tenant/company injection, duplicate click and same key/different payload conflicts.
- **Evidence:** pending.

### TAL-013 — Persist a created identity only after verified Tally success
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-067
- **Depends on:** TAL-012
- **UI / keyboard:** Job ID survives pending/rejection/duplicate-existing/unknown/success states; actual returned identity on success, mapping focus restored; timeout says reconcile, not safely failed.
- **API / backend:** Parse typed create-item outcome and real XML LINEERROR even under HTTP 200; verify stable identity/company. Existing matching name alone is not proof of newly created identity. Unknown writes block blind retry and use reconciliation policy.
- **DB / migrations:** Atomically record verified item identity and confirmed map with job result; retain local ledger intent/results and no mapping on ambiguous response.
- **Verify:** Real create-item then repeat request creates one or reconciles existing; HTTP 200/LINEERROR remains unmapped. Automate restart/duplicate/unknown response; record real successful master before voucher work.
- **Evidence:** pending real response and master-creation gate.

## T5 / Q7 — Approved billing preflight and result

### TAL-014 — Bind preflight to the current approved immutable revision
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-068
- **Depends on:** TAL-013, Parent gate RAL-031
- **UI / keyboard:** APPROVED — READY TO BILL entry opens revision/total/company/Normal Sales preflight, not a write; checklist links return to same preflight. Loading/stale approval/unsaved edit/permission states; safe heading focus.
- **API / backend:** Proposed preflight command takes revision ID/hash and expected quote version; revalidate membership/current approval and immutable contents. Viewing/approval never queues billing; mutable draft cannot be used.
- **DB / migrations:** Persist preflight identity, approved revision/hash/config version findings; FK/snapshot constraints prevent replacing pinned context with draft.
- **Verify:** Approve revision 2, edit revision 3, attempt old/stale billing: blocked. Automate no job on view/approval, forged revision/hash and foreign quote rejection.
- **Evidence:** pending.

### TAL-015 — Resolve and sign off the accounting context
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-068
- **Depends on:** TAL-014
- **UI / keyboard:** Actionable ledger/master/UOM/customer/GST/address/place-of-supply/currency/rate-basis blockers; Normal Sales mode visible, no fabricated tax totals. Error links return to the exact checklist context.
- **API / backend:** Freeze business/accountant-approved customer/ledger/GST/address/place-of-supply requirements, quantity/UOM, tax-inclusive/exclusive rates, discounts and voucher/tax ledgers. Validate mappings and required masters; unresolved tax context blocks rather than inventing a GST engine.
- **DB / migrations:** Snapshot configured accounting policy/version/company/mapping versions and agreed totals-reconciliation policy in preflight; introduce only needed versioned config constraints.
- **Verify:** Matrix each missing/mismatched context → blocked and zero voucher dispatch; valid fixture matches signed accounting template. Automate wrong-company/master/map cases; record accountant sign-off before real voucher work.
- **Evidence:** pending business/accountant policy approval and matrix.

### TAL-016 — Refresh stock and record policy-controlled shortage consent
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-068
- **Depends on:** TAL-015
- **UI / keyboard:** Checklist distinguishes bridge online, Tally reachable, correct company, mapped lines, masters and fresh stock. Show affected shortage quantities and allowed override confirmation; no silent substitution/rate change. Stale/error returns to refresh.
- **API / backend:** Pre-billing refresh must finish valid generation; revalidate config/map/quote versions before dispatch eligibility. Apply approved warning/block/authorized-override policy, not invented availability logic.
- **DB / migrations:** Preflight records stock generation, findings and authorized override actor/time/reason; do not overwrite approved quote contents.
- **Verify:** Offline/wrong company/unmapped/stale/failed refresh each prevents dispatch; shortage blocks or permits explicit recorded override per policy. Automate expiry/race after preflight and quantity/rate immutability.
- **Evidence:** pending.

### TAL-017 — Enqueue one explicit normal Sales Voucher request
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-069
- **Depends on:** TAL-016
- **UI / keyboard:** Confirm immutable revision/company/approved total then Create bill in Tally. Queued/TALLY_PENDING disables duplicate billing with reason; user may leave for Job details; no optimistic BILLED.
- **API / backend:** Proposed bill command rechecks approved/preflight context and enqueues CREATE_SALES_VOUCHER with business/company/quote/revision-scoped key and immutable payload hash; typed deterministic template only, no MCP/AI agent.
- **DB / migrations:** Atomic durable job plus quote-pending event, unique effective operation for approved revision/context; job payload cannot mutate on retry.
- **Verify:** Double-click and request timeout yield one durable job; no job from view/approval/share. Automate stale preflight/map/quote races and same-key payload mismatch; exercise signed real normal-voucher template.
- **Evidence:** pending.

### TAL-018 — Show BILLED only after a verified voucher outcome
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-069
- **Depends on:** TAL-017
- **UI / keyboard:** Queued → delivered/executing → awaiting result → BILLED with voucher number/master ID/time, or actionable TALLY_ERROR/unknown. Polite announcements; background ACK never steals another screen's focus. Optional mode stays hidden, never mislabeled Billed.
- **API / backend:** Parse CREATED/ALTERED/ERRORS/LINEERROR; HTTP 200 alone fails success test. Verify company/voucher identity and returned amounts/taxes against signed agreement policy; unexpected ALTERED/amount mismatch needs explicit resolution.
- **DB / migrations:** Persist verified result/identity and quote event atomically; BILLED only on validated successful ACK. Tally rate/accounting observations never overwrite Rallie prices.
- **Verify:** Real approved quote creates intended single Sales Voucher; missing master/LINEERROR stays unbilled. Automate malformed/mixed success-error response, wrong company/identity/amount and immutable price snapshots.
- **Evidence:** pending redacted real XML/voucher and accountant sign-off.

## T6 — Job history, safe retry and reconciliation

### TAL-019 — Browse scoped sync and billing job history
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-071
- **Depends on:** TAL-018
- **UI / keyboard:** Native table/filter/pagination for operation, quote/revision, company, created/updated, status, attempts and result; loading/empty/error. Keyboard filters/links, stable Back restoration; viewing never executes.
- **API / backend:** Proposed business-scoped jobs GET with bounded cursor/filter DTO; attempts distinguish delivery attempts from logical commercial action; other-company job access denied.
- **DB / migrations:** Business/connection/company/status/created indexes verified by query plans; no unbounded browser fetch.
- **Verify:** Mixed sync/item/voucher fixtures paginate deterministically; automate cross-business ID/list denial and no job re-enqueue on refresh/filter/back.
- **Evidence:** pending.

### TAL-020 — Inspect a job without unsafe cancellation or raw payloads
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-071
- **Depends on:** TAL-019
- **UI / keyboard:** Detail shows immutable quote/revision/company, attempts, timestamps, correlation, sanitized line/master errors and voucher result/link. Queued/active/error/unknown/billed distinct; Cancel absent unless real cancellation semantics exist.
- **API / backend:** Authorized job detail returns state-derived permitted actions, not generic resubmit; voucher links are scoped/validated, no secrets or unredacted XML/commercial payload dumps.
- **DB / migrations:** None; read retained job/evidence with indexed identity.
- **Verify:** Open each state with keyboard; unknown warns Awaiting confirmation — do not create another bill. Automate raw secret/phone/XML redaction and no side effects on GET.
- **Evidence:** pending.

### TAL-021 — Retry only a demonstrably safe existing operation
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-070, RAL-071
- **Depends on:** TAL-020, TAL-032, TAL-034
- **UI / keyboard:** Explicit retry confirmation explains same operation/key; Retrying differs from UNCERTAIN. Unknown state offers reconciliation, not Retry; preserve focus/error context.
- **API / backend:** Scoped retry endpoint uses protocol-state eligibility and expected job version; replay known completed result or confirmed-safe failure only. Never mint a new commercial key or mutate payload; enforce per-action policy.
- **DB / migrations:** Attempt/lease update under existing unique logical job with immutable hash; completed/reconciled state cannot be regressed.
- **Verify:** Retry known completion recovers original voucher, safe failure retains key, unknown denied. Automate concurrent retries, wrong role/company and stale attempt completion.
- **Evidence:** pending.

### TAL-022 — Reconcile an unknown outcome with explicit evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-070, RAL-071
- **Depends on:** TAL-020, TAL-033, TAL-034
- **UI / keyboard:** UNCERTAIN explains not safe failure; authorized search/link-result flow confirms company/reference/voucher evidence, with ambiguous/no-proof/manual-review states. Keyboard confirmation and audit visible; no blind resend button.
- **API / backend:** Query tested stable external correlation/reference within confirmed company; record proof of unique existence or supported absence. If Tally cannot prove existence/absence/uniqueness, require manual reconciliation under explicit policy; link result validates identity/totals and authorization.
- **DB / migrations:** Immutable reconciliation actor/reason/evidence/time, correlation and result transition fenced by expected job version; unique completion cannot be overwritten by late worker.
- **Verify:** Test exactly one, zero-with-proof, multiple and unsupported search outcomes; only policy-proven resolution permits next action. Automate forged/foreign voucher link, late result and double reconciliation.
- **Evidence:** pending capability proof and manual procedure.

## T1 / H1 — Operational visibility and diagnostics

### TAL-023 — Expose redacted diagnostics and safe recovery guidance
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-071
- **Depends on:** TAL-022
- **UI / keyboard:** Readable diagnostic ID, connection/probe/company/sync/job error and safe next action; no trapped modal. Distinguish Tally closed/HTTP disabled/no company; Employee cannot access credential setup.
- **API / backend:** Scoped sanitized diagnostics DTO with allowlisted fields/action policy; redact credentials, pairing codes, phones and raw commercial XML; no arbitrary LAN probe or support command tunnel.
- **DB / migrations:** Bounded diagnostic retention/index if stored; no secret payload logging.
- **Verify:** Inject each failure and inspect a safe recovery link; automate redaction and Employee re-pair denial. Diagnostics must never suggest blindly retrying uncertain vouchers.
- **Evidence:** pending.

### TAL-024 — Drive the Dashboard Tally card from real job state
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-071
- **Depends on:** TAL-023, TAL-001, Parent gate RAL-018
- **UI / keyboard:** Dashboard card shows real company/connection/last seen/stock freshness and job attention, with links to mapping/jobs/settings by role; stale/offline/mock not green success; no charts or live inventory claim.
- **API / backend:** Business-scoped compact status aggregate reuses persisted connections/jobs, not fixtures; preserve asymmetric sync policy and per-action permissions.
- **DB / migrations:** None; bounded indexed aggregate query, no seller-price mutation.
- **Verify:** Disconnect bridge while dated stock remains; Dashboard and Tally page agree without conflating facts. Automate tenant isolation, mock badge, unknown-result link and no circular price sync.
- **Evidence:** pending.

## Non-screen feature — protocol and opt-in fake (build first)

### TAL-025 — Freeze and validate the typed bridge message contract
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-061
- **Depends on:** Parent gate RAL-060, Parent gate RAL-035
- **UI / keyboard:** None; protocol contract only.
- **API / backend:** Add tally-protocol package and fixtures for connect, heartbeat, list-company, sync-items, create-item, create-voucher and job-result. Commands require protocol_version/message_id/job_id/idempotency_key/type/payload/sent_at; results require message_id/job_id/success/result/error_code/error_message/completed_at. Validate version, types, size, replay and device/business binding; no arbitrary commands/MCP/AI.
- **DB / migrations:** None; schemas/fixtures precede job storage.
- **Verify:** Round-trip all command/results, reject unknown versions/types, oversized payload, missing IDs and mismatched binding; automated deterministic schema/compatibility tests.
- **Evidence:** pending versioned protocol fixtures.

### TAL-026 — Persist cloud job intent and ownership before dispatch
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-061
- **Depends on:** TAL-025
- **UI / keyboard:** None; durable command state contract only.
- **API / backend:** Authorized enqueue/claim/complete primitives persist operation/hash/status/attempt/result with scoped idempotency and lease/attempt fencing; D1 is job truth, never socket memory. Same key/hash returns existing job; mismatched payload conflicts.
- **DB / migrations:** Introduce tally_sync_jobs with business/connection/company scope, unique operation key, immutable payload hash, claim owner/lease/attempt and result metadata; conditional state transitions and FKs.
- **Verify:** Crash after intent/before dispatch, race claims, expire lease and retry completion; one logical job remains. Automate key/hash conflict, stale attempt and cross-business result denial.
- **Evidence:** pending migration replay and transaction tests.

### TAL-027 — Exercise all protocol commands with an explicitly fake bridge
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-061
- **Depends on:** TAL-026
- **UI / keyboard:** Mock connection/jobs visibly labeled; unsupported-service state and readable diagnostics, never simulated BILLED presented as real accounting.
- **API / backend:** Opt-in fake implements protocol deterministically with configurable connect/heartbeat/company/stock/item/voucher/failure/ACK-drop scenarios; production startup/config rejects fake and no silent real-service fallback.
- **DB / migrations:** Mark test fixture provenance/environment; fake durable jobs remain distinguishable and never certify real ledger/voucher behavior.
- **Verify:** Contract suite exercises every message/failure, restart and duplicate/hash mismatch; production mock configuration fails. Assert fake results cannot be reported as real integration evidence.
- **Evidence:** pending fake-only suite and production refusal test.

## Non-screen feature — real transport and Windows execution

### TAL-028 — Route scoped outbound WSS through a hibernating Durable Object
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-063
- **Depends on:** TAL-004, TAL-026
- **UI / keyboard:** None beyond status events consumed by TAL-001.
- **API / backend:** Worker authenticates device handshake and routes business/company-scoped hibernatable DO; heartbeat/reconnect backoff, duplicate-session policy, protocol bounds and revocation enforcement on dispatch/result. Bridge initiates outbound WSS, no inbound shop port or command tunnel.
- **DB / migrations:** Persist jobs/results in D1 around transport; DO metadata supports routing reconstruction, not sole accounting truth. Attach authenticated scope/attempt to restored sessions.
- **Verify:** Hibernation/restart/reconnect reconstruct route and dispatch pending jobs without lost success; automate foreign device/company/job result, oversized messages and duplicate sessions. Record emulator and deployed traces separately.
- **Evidence:** pending deployed DO proof; local emulation alone insufficient.

### TAL-029 — Install and operate a minimal real Windows service
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-064
- **Depends on:** TAL-028
- **UI / keyboard:** Minimal accessible install/pair/diagnostic flow; explicit unsupported platform and Tally-not-running guidance. No screenshot/UI automation.
- **API / backend:** Choose and record Go or .NET/version; service implements cloud connection, Tally adapter and reliable execution only. Install/start/stop/restart, secure OS credential storage and outbound reconnect; no catalogue/quote business logic or arbitrary cloud-selected URLs.
- **DB / migrations:** None yet beyond secure device state; no plaintext secrets in config/logs.
- **Verify:** On supported real Windows, install/start/stop/restart and reconnect with stored credential; inspect permissions/log redaction. macOS fake does not pass; unavailable hardware is BLOCKED at execution.
- **Evidence:** pending language/version, Windows/service logs.

### TAL-030 — Persist local SQLite execution intent and cached results
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-064
- **Depends on:** TAL-029
- **UI / keyboard:** None; diagnostics expose state safely without local ledger secrets.
- **API / backend:** Allowlisted execution records intent before calling Tally; same key/hash returns completed result, changed payload conflicts, unfinished write becomes uncertain and cannot blindly rerun after restart.
- **DB / migrations:** Local SQLite ledger job_id/idempotency_key/payload_hash/status/correlation/result with uniqueness and transactional before-send/completion states; durable restart/reconnect recovery.
- **Verify:** Restart before send, after known completion and with in-flight write: respectively safe dispatch, cached result, UNCERTAIN. Automate duplicate delivery and changed hash; inspect real Windows durable ledger.
- **Evidence:** pending local schema/restart tests.

### TAL-031 — Probe local Tally and bound safe XML processing
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-064
- **Depends on:** TAL-030
- **UI / keyboard:** Local diagnostics distinguish HTTP disabled/unreachable/no loaded company; no browser-to-localhost request or raw secret output.
- **API / backend:** Probe `http://127.0.0.1:9000` under fixed/approved local configuration, timeout/response-size limits; XML escaping, parser external entities disabled and typed allowlist. Reject arbitrary LAN URL/SSRF and malformed responses; service has no screen scraping.
- **DB / migrations:** None; safe probe result persisted as observation, not accounting success.
- **Verify:** Real Tally probe and list-company succeed; automated XXE, XML injection, oversized/timeout/malformed and arbitrary-host cases fail safely without writes. Record Tally/company version/configuration.
- **Evidence:** pending real probe plus parser security suite.

## Non-screen feature — uncertain writes and cross-reference safety

### TAL-032 — Recover a lost cloud ACK from the durable local result
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-070
- **Depends on:** TAL-018, TAL-030
- **UI / keyboard:** Awaiting confirmation/Retrying refers to same original operation; not a new Create bill affordance.
- **API / backend:** Implement/replay eight-step scenario: persist cloud job → dispatch → persist local intent → Tally creates → persist local result → drop cloud ACK → reconnect/redeliver same key/hash → return cached original result. No exactly-once transport assumption.
- **DB / migrations:** Unique cloud completion and local cached result preserve original voucher/correlation/payload hash; retries increment attempts only.
- **Verify:** Inject drop after local persistence and before ACK; verify one actual voucher, original result after retry and one quote completion event. Automate scenario with fake and repeat on real Windows/Tally.
- **Evidence:** pending timing trace and redacted voucher identity.

### TAL-033 — Quarantine a crash after write but before local persistence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-070
- **Depends on:** TAL-032
- **UI / keyboard:** UNCERTAIN is not safe failure; show Awaiting confirmation — do not create another bill, retained job/reference and authorized reconciliation entry.
- **API / backend:** Restart detects before-send intent without conclusive result; block automatic resend. Test stable external correlation/reference query by company; document actual Tally existence/absence/uniqueness capabilities and manual fallback when proof unavailable.
- **DB / migrations:** Persist uncertain status/correlation and immutable intent across restart, never delete to permit a new key.
- **Verify:** Kill service after successful Tally write but before ledger completion; restart sends no second write. Automate unsupported/ambiguous correlation responses and inspect one real voucher or explicit unresolved manual block.
- **Evidence:** pending fault timing and Tally reconciliation capability proof.

### TAL-034 — Fence stale transport and execution completions
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-063, RAL-070
- **Depends on:** TAL-033
- **UI / keyboard:** None; stale completions cannot regress visible reconciled/billed states.
- **API / backend:** Conditional completion verifies device/business/company/job/hash/attempt/lease and credential generation; late socket/worker cannot overwrite newer reconciliation. Reject forged result even with valid unrelated device credential.
- **DB / migrations:** Conditional versioned transitions and unique completion marker; retained reconciliation outcome dominates obsolete attempts, no destructive retry reset.
- **Verify:** Expire lease, reconcile, then inject old ACK and duplicate session result; original decision remains. Automate revoked credential, cross-company result, mismatched hash and concurrent reconciliation races.
- **Evidence:** pending concurrency/fencing tests.

### TAL-035 — Integrate mapping references with canonical product merges
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-066
- **Depends on:** TAL-011, Parent gate RAL-055
- **UI / keyboard:** Mapping conflict/merge impact is explicit; no hidden remapping of billed products; authorized reassignment preview remains future-only.
- **API / backend:** Implement versioned Tally mapping merge hook after mappings exist; active seller overlay collisions require explicit policy, same business/company binding and expected versions. Never discard one accounting mapping silently.
- **DB / migrations:** Reconcile active mapping uniqueness/FKs while retaining original product/map IDs in immutable jobs/results; no cascade deletion or rewriting historical voucher context.
- **Verify:** Merge products where a business carries both with different maps; unresolved collision blocks, approved policy preserves history and active uniqueness. Automate replay, stale map version and tenant privacy.
- **Evidence:** pending merge-hook migration and regression tests.

## Integration verification — real environment, not fake completion

### TAL-036 — Verify the real bridge security and isolation boundary
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-072
- **Depends on:** TAL-024, TAL-034, TAL-035
- **UI / keyboard:** Permission/unsupported/expired/revoked states explain safe recovery; diagnostic copy contains no secrets.
- **API / backend:** Run revocation, forged device/result, cross-company/business, malformed/XXE XML, duplicate delivery, hash mismatch and timeout suite; prove outbound-only connectivity and no MCP/AI billing path.
- **DB / migrations:** Inspect cloud/local ledger under scoped access with secrets/PII redacted; verify no unauthorized job/result/credential writes.
- **Verify:** Execute on declared Windows/Tally versions and staging transport; Employee cannot pair/reconfigure, authorized operational actions remain scoped. Missing real access blocks this gate regardless of fake success.
- **Evidence:** pending real threat matrix and environment report.

### TAL-037 — Verify one real voucher across restart and lost acknowledgements
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-072
- **Depends on:** TAL-036
- **UI / keyboard:** End-to-end owner setup then operational stock → mapping → item create → preflight → bill; offline/wrong company/shortage/import error and uncertain recovery visible.
- **API / backend:** Repeat real integration in required order with supported company configuration; eight-step ACK-loss scenario and crash-before-local-result policy; HTTP 200/LINEERROR never bills.
- **DB / migrations:** Inspect one approved revision, one effective billing operation/result, one actual Tally voucher after recovery; immutable payload/correlation survives service/transport restart.
- **Verify:** Check voucher directly in real Tally, reconcile amount/company/identity and collect redacted ledger traces; unknown unprovable outcome remains blocked/manual, not a claimed pass. Real AI is not involved in billing.
- **Evidence:** pending real voucher/test report and accounting sign-off; unavailable Windows/Tally is release-blocking.

### TAL-038 — Verify all Tally screens and role-safe keyboard journeys
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-072
- **Depends on:** TAL-037
- **UI / keyboard:** Owner S3 and Employee T1–T6 journeys, desktop/touch widths, keyboard-only company radios/mapping/preflight/retry/reconcile; loading/empty/disconnected/stale/wrong-company/unmapped/pending/error/uncertain/billed. Background refresh never steals focus; successful user-directed completion focuses result heading.
- **API / backend:** Automated end-to-end assertions for view/approval = zero billing jobs, explicit action = one, unsafe retry denied and authorized sanitized diagnostics; real mode never uses fake data.
- **DB / migrations:** Validate no price synchronization loop, no historical mapping/revision mutation and no job deletion on revoke.
- **Verify:** Run keyboard and accessible-state checks with real job evidence; verify stock absolute timestamps and optional mode hidden. Record supported configuration and remaining limitations; no declaration of support without TAL-036–TAL-037 evidence.
- **Evidence:** pending screen traces and Tally slice sign-off.

## Screen and feature completion checklist

- [ ] T1: TAL-001, TAL-006–TAL-008 — four facts, safe sync and dated stock evidenced.
- [ ] S3: TAL-002–TAL-005 — owner pairing, explicit fiscal company, rotation/revocation evidenced.
- [ ] T2: TAL-007–TAL-008 — truthful observations and real complete generation evidenced **before mappings**.
- [ ] T3: TAL-009–TAL-011, TAL-035 — explicit mapping, reassignment, invalidation and merge safety evidenced.
- [ ] T4: TAL-012–TAL-013 — requested master and verified stable identity evidenced **before vouchers**.
- [ ] T5/Q7: TAL-014–TAL-018 — signed accounting context, approved revision, refreshed stock, one normal voucher evidenced.
- [ ] T6: TAL-019–TAL-022 — history, state-safe retry and authorized reconciliation evidenced.
- [ ] H1/diagnostics: TAL-023–TAL-024 — real, redacted and role-safe visibility evidenced.
- [ ] Protocol/fake: TAL-025–TAL-027 — versioned deterministic tests and production fake refusal evidenced.
- [ ] Real bridge: TAL-028–TAL-031 — deployed hibernation and real Windows/local XML/ledger evidenced.
- [ ] Fault safety: TAL-032–TAL-034 — lost ACK, uncertain crash and stale completion evidenced.
- [ ] Final real gates: TAL-036–TAL-038 — security, one-voucher and keyboard/role journeys signed off.

Documentation, local emulation and fake success do not check off real implementation or deployment. Attach commits, migration outputs, automated results, environment versions, redacted traces and explicit blocked limitations before completion.