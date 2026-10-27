# 10 — Operations, release verification and deferred experiments

Sources: [operational/deferred parent requirements](../IMPLEMENTATION.md), [M6, shared states and performance/review gates](../DESIGN.md).

These are TODO child tickets, not evidence that metrics, release gates or optional features exist. Each is a roughly half-day bounded behavior, measurement/drill, or optional **decision/prototype** exercise; a deferred spike does not authorize or certify a production rollout. Parents remain the 80 authoritative requirements. Instrumentation hooks belong in earlier feature slices; the operational gates below validate and expose them, not postpone all instrumentation until release. Proposed routes require frozen fixtures. Cross-file dependencies use parent gates, never invented child IDs.

## Parent mapping inventory

| Parent | Required coverage | Children |
| --- | --- | --- |
| RAL-073 | Last-24-hour resource, extraction-quality and integration metrics | OPS-001–OPS-003 |
| RAL-074 | Dated quotas/budgets, retention/recovery/rotation and restore drills | OPS-004–OPS-006 |
| RAL-075 | Performance, privacy/security, migrations, deployment and full journey | OPS-007–OPS-010 |
| RAL-076 | Optional public additions, OTP and opt-in post-approval automation | OPS-011–OPS-013 |
| RAL-077 | Optional offline, richer search, ontology/inference and voice experiments | OPS-014–OPS-017 |
| RAL-078 | Conditional extraction and orchestration fallback | OPS-018–OPS-019 |
| RAL-079 | Conditional fan-out, safeguarded assisted moderation, alias promotion | OPS-020–OPS-022 |
| RAL-080 | Optional bridge fleet improvements, Optional Vouchers and MCP tooling | OPS-023–OPS-025 |

**Release boundary:** OPS-001–OPS-010 are v1 gates. OPS-011–OPS-025 have **Release: deferred — not a v1 blocker** and require measured need, an approved decision and an explicitly bounded experiment before any new schema/store/service is introduced. No v1 ticket depends on a deferred ticket. Their security/domain invariants remain mandatory if later enabled; an experiment can be rejected without blocking v1. All fields below are implementation work to perform, not completion claims.

## M6 — Read-only platform operations, Last 24 hours

### OPS-001 — Present sourced resource consumption without false zeroes
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-073
- **Depends on:** Parent gate RAL-072
- **UI / keyboard:** Platform-only Last 24 hours text/table groups: Worker requests, D1 rows read/written, R2 storage and Class A/B operations, Workflows started/failed/steps/state, AI-extracted documents/neurons. Show period/time zone/units/source/updated time; zero/unavailable/stale/partial-source failure distinct. Explicit/low-frequency refresh preserves focus; no live ticker or seller charts.
- **API / backend:** Proposed platform-flag-only `GET /api/admin/operations` uses allowlisted provider/application aggregates with least-privilege provider credentials. Define source/window/denominator for each metric; actual provider consumption is not passed off as an app estimate. Never fetch all businesses into browser or include tokens/phones/raw documents.
- **DB / migrations:** Bounded aggregate buckets with source/window/version uniqueness and retention; no full commercial payload telemetry. Provider scrape failure retains dated prior observation.
- **Verify:** Seed positive/zero/missing/stale/partial sources and inspect honest labels; automate nonadmin/public denial and secret exclusion. Reconcile a known provider sample to displayed units/window; keyboard refresh never moves focus.
- **Evidence:** pending metric dictionary, provider fixture and UI trace.

### OPS-002 — Measure extraction quality with explicit denominators
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-073
- **Depends on:** OPS-001
- **UI / keyboard:** M6 quality rows: median extraction time, rows extracted, rows requiring human correction, exact full-SKU match %, possible duplicate %, AI document count; definitions/denominators and unavailable zero-denominator state accessible by ordinary links.
- **API / backend:** Aggregate immutable run/review outcomes by logical run and extractor version; distinguish retries from independent submissions, full SKU from suffix, pending review from known uncorrected rows. Validate metrics against labeled source corpus, not JSON validity alone.
- **DB / migrations:** Add only bounded quality counters/versioned aggregate fields needed; retained run/job truth outlives provider state. No source text/cost/private alias in shared telemetry.
- **Verify:** Use digital/multipage/repeated-header/missing SKU/missing price/comma/₹/duplicate-row/repeated-binary/changed-price/similar-SKU plus malformed/image-heavy fixtures with ground truth; automate known numerator/denominator/median and retry-deduplication checks. Report real AI and fake separately.
- **Evidence:** pending dictionary, corpus measurements and correction accuracy.

### OPS-003 — Report moderation, bridge reliability and search health
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-073
- **Depends on:** OPS-002
- **UI / keyboard:** M6 pending claims, online Tally agents and Tally job success %, plus labeled search latency/connectivity observations; denominator/window/freshness visible. Authorized redacted diagnostic links; partial outage never displays 100% success from missing samples.
- **API / backend:** Define logical-job success versus attempts, online heartbeat threshold, UNCERTAIN treatment and full-SKU search metrics. Aggregate scoped job/connection events; platform authorization is required for totals and linked diagnostics separately.
- **DB / migrations:** Bounded business-redacted reliability/search buckets with indexed time windows; retain job truth separately from short-lived telemetry.
- **Verify:** Fail/retry/reconcile one job and count one logical job with multiple attempts; stale agents are not online. Automate job-total reconciliation, missing denominators, unauthorized diagnostic links and privacy-safe route labels; measure telemetry overhead.
- **Evidence:** pending metric-source tests and overhead report.

## M6 operational messages / non-screen recovery features

### OPS-004 — Rehearse a bounded recovery and retention runbook
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-074
- **Depends on:** OPS-003, Parent gate RAL-006
- **UI / keyboard:** Accessible degraded/budget incident text links to authorized safe next steps; uncertain billing guidance explicitly forbids blind retry. Source/workflow unavailable never implies business records vanished.
- **API / backend:** Publish and rehearse a seeded incident checklist covering failed workflow/run replay, expired claim lease, stuck/uncertain bill and bridge disconnect; least-privilege audited replay, redacted request IDs, credential/token/device rotation/revocation. Freeze retention/deletion approval preserving legally required evidence without inventing jurisdiction rules; private R2 orphan cleanup checks durable references first.
- **DB / migrations:** None unless approved retention metadata is missing; document TTL boundaries for telemetry, originals/artifacts, orphan uploads and business truth. Workflow/Queue expiry must never delete source/review/revision/job intent.
- **Verify:** Run one scripted mixed incident fixture with expired workflow state and referenced/orphan artifacts: review survives, only eligible orphan removed, uncertain bill not resent. Automate replay authorization/redaction/reference guard; record operator, rotation procedure and unresolved policy owners.
- **Evidence:** pending retention approval, runbook and drill log; documentation alone is not a successful drill.

### OPS-005 — Restore a representative D1 snapshot without replaying bills
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-074
- **Depends on:** OPS-004
- **UI / keyboard:** None; isolated restore drill with readable operator report.
- **API / backend:** Use access-controlled backup/restore environment and documented migration recovery/rollback owner; disable external writes until correlation/lease reconciliation proves safe. Verify old artifacts and private R2 source access after restore.
- **DB / migrations:** Restore representative FKs, FTS rebuild, immutable sources/revisions, job leases, local/cloud correlation and historical artifact references; clear/fence obsolete execution ownership, not billing evidence.
- **Verify:** Restore snapshot containing completed and uncertain bills; query FK/FTS consistency, compare quote/source hashes and assert zero automatic voucher resends. Automate restoration invariants and permission denial; record actual recovery timings and rollback strategy.
- **Evidence:** pending restore log, timing and invariant report.

### OPS-006 — Configure dated budgets and evidence-based scaling gates
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-074
- **Depends on:** OPS-003, OPS-005
- **UI / keyboard:** M6 shows current configured limits/source/date, warning/degrade/cap actions and unavailable quota data; no guaranteed ₹0/free-at-scale claim. Accessible text/actions, never advise blind voucher retry.
- **API / backend:** Verify official current quotas, eligibility/regions before provisioning. Compare brief's unverified baseline: Workers 100k requests/day/10 ms CPU; D1 5m reads/day, 100k writes/day, 5 GB; R2 10 GB-month, 1m Class A/10m Class B/month/no Internet egress charge; Workflows 3k steps/day, 1 GB-month/default three-day Free state retention; AI 10k neurons/day; deferred Queues 10k operations/day/24h retention. Record conversion/image-heavy AI costs and active versus waiting Workflow CPU. Set measured warning/cap/degrade thresholds and escalation owner.
- **DB / migrations:** Versioned budget configuration/observations if persistence needed; bounded retention. Durable business/work IDs cannot rely on Workflow or Queue retention.
- **Verify:** Replay threshold crossings and provider outage; expected warning/cap/degrade occurs without false completion. Benchmark hashing/conversion/large JSON/upload size against real Worker limits; measure R2 originals/artifacts/operation classes and retries. Record gates: keep D1 while FTS/connectivity adequate; offline/search/fallback/Queue/fleet changes only on measured failure/demand. No arbitrary-size PDF promise.
- **Evidence:** pending dated official references, measurements and approved budget/scaling thresholds.

## Cross-screen performance and release verification

### OPS-007 — Enforce production bundle and loading-boundary budgets
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-075
- **Depends on:** OPS-006, Parent gate RAL-038
- **UI / keyboard:** Useful route shells/skeletons retain labels and primary-control positions; reduced motion respected, no blank splash counted as useful loading. PDF renderer/viewer and heavy admin tools load only on explicit need; failures expose Retry without focus loss.
- **API / backend:** Production build analysis includes shared dependencies and cold-cache critical transfers; public route excludes admin and seller-private code/data. Explicit PDF generation only, never on view/save/share/approval/hover/prefetch.
- **DB / migrations:** None.
- **Verify:** Automate gzip-equivalent budgets: authenticated shell+Dashboard ≤200 KB JS, public quote ≤100 KB, direct heavy route ≤300 KB excluding explicitly requested PDF/viewer; each incremental route ≤100 KB or measured approved exception; initial CSS ≤40 KB, network font requests 0. Network traces prove lazy boundaries and zero unsolicited PDF work; approved self-hosted fonts have explicit separate budget.
- **Evidence:** pending production build/chunk report and cold-load traces.

### OPS-008 — Measure representative interaction and field performance
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-075
- **Depends on:** OPS-007
- **UI / keyboard:** Catalogue 50-row page, 412-row paginated review, 100-line quote and eight open quotes stay responsive; saved label follows ACK not timer; background polling preserves focus. Test long-session layout shifts and PDF navigation responsiveness, not just initial paint.
- **API / backend:** Privacy-safe route-family/device aggregates never log public token paths, names/phones/quote/cost; report window/sample size and lab versus field separately. Report API and UI search timings including debounce.
- **DB / migrations:** None beyond bounded anonymous performance aggregates; no raw sensitive URLs.
- **Verify:** Production cold/warm runs on 1366×768 counter laptop and mid-range 360px Android, repeatable 1.6 Mbps down/750 Kbps up/150 ms RTT/4× CPU profile plus real devices. Gates: LCP ≤2.5s p75 desktop/mobile separately (aim 2s), INP ≤200ms p75 (aim 150ms), CLS ≤0.10 full lifetime (aim .05); no avoidable >50ms steady tasks, investigate every >100ms. Input/totals ≤100ms, search ≤500ms p95, warm shell ≤200ms/useful data ≤1s, cached quote switch ≤100ms, Saving visible ≤100ms/ACK aim ≤1s p95 after dispatch. Lighthouse is not field p75 or INP proof; absent field sample is an explicit limitation, not a pass.
- **Evidence:** pending device/browser/build/profile traces and labeled field measurements.

### OPS-009 — Verify security, migration and protected deployment gates
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-075
- **Depends on:** OPS-005, OPS-008, Parent gate RAL-006
- **UI / keyboard:** Permission/session/error states provide safe recovery without disclosing records; public views reveal no cost/profit or internal shell. Credential-dependent deployment blocked state explicit.
- **API / backend:** Run full role/tenant/IDOR/token/CSRF/idempotency/concurrency suite; live staging smoke and production config validation. Main CI deploy requires provisioned isolated resources/credentials and protected production approval, never mock success as deployment proof.
- **DB / migrations:** Execute empty replay and previous-release upgrade at representative volume; validate rollback/restore plan, FKs/FTS and durable external-effect correlation after recovery. No blind billed-work replay.
- **Verify:** Run malicious cross-tenant IDs, stale tokens/requests and concurrent mutations; all denied or safely conflicted. Replay/upgrade fixture yields equivalent business state. Record real staging health/deploy ID; unavailable credentials/resources remain release-blocking.
- **Evidence:** pending security suite, migrations, staging smoke and protected-deploy evidence.

### OPS-010 — Close the full vertical release journey with real evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-075
- **Depends on:** OPS-009, Parent gate RAL-072
- **UI / keyboard:** Fresh environment → Owner/Employee → seeded catalogue → quote/share/approve/explicit PDF → ingest/review → admin price/merge → explicit seller adoption/relationships → pair Tally/sync/map/create/bill. Desktop seller/mobile customer, slow network, keyboard-only and loading/empty/error/permission states; no incidental PDF/billing.
- **API / backend:** Verify every v1 RAL-001–RAL-074 requirement has implementation evidence or explicit release-blocking status; real AI, Windows/Tally, live staging and deployed health must support claimed capabilities. Approve limitations, deferred decisions and rollback owner; no hidden TODO in shipped behavior.
- **DB / migrations:** Compare source/revision/quote history and seller prices through journey; retain external correlation and one effective accounting result. Attach OPS-005/OPS-009 recovery/upgrade evidence.
- **Verify:** Run the automated journey plus design §15 review matrix and real provider/Windows/Tally reports. Record VoiceOver/Safari, NVDA/Firefox or Chrome, and TalkBack/Chrome versions/results; unperformed tests remain missing evidence. Cover 320px reflow, touch, 200%/400% zoom, text spacing, forced colors, measured contrast, long SKU/paise/fractional UOM and missing-cost states. Check native browser/OS shortcuts, IME/dead keys/AltGr/paste, optional shortcuts off, safe dialog/tab-close fallback, error focus across pagination and no poll focus theft. Assert source/correction separation and week-later review, independent customer tabs, rounding/save-conflict safety, exact-revision approval/reapproval, download versus archive failure, owner-only settings, one voucher after ACK drop and explicit adoption. Inspect response/markup/accessible names/logs/link preview/PDF for cost/profit leakage. Record state screenshots, build/deploy IDs, smoke/sign-offs and exceptions with owner/risk/resolution date; scaffolding never qualifies as DONE.
- **Evidence:** pending release manifest, end-to-end results and approvals.

## Deferred P3 — Public proposal item additions

### OPS-011 — Pilot capability-scoped seller-item additions to proposals
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-076
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured customer self-edit usage and approved bounded pilot.
- **UI / keyboard:** Safe seller-catalogue search/loading/no results; add Shower Arm, remove Basin Mixer, change Diverter quantity in proposal diff. Keyboard combobox/selection and explicit Send changes; no new customer account by default.
- **API / backend:** Capability-scoped public search returns safe carried-item DTOs only; proposal allows seller-product reference/quantity/removal, never customer-set cost/MRP/discount/unit price. Seller acceptance creates new revision requiring reapproval.
- **DB / migrations:** Only after approval, add proposed seller-product references to immutable/reviewable proposals with revision binding and tenant constraints.
- **Verify:** Prototype one measured journey and compare completion to baseline; automate uncarried/foreign/private item denial and immutable proposal/price injection. Reject pilot if need or privacy benefit unproven.
- **Evidence:** pending trigger data, approval and pilot/security results.

## Deferred P2 — Sensitive approval authentication

### OPS-012 — Evaluate an optional expiring OTP approval step
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-076
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: demonstrated sensitive-approval security need and approved policy.
- **UI / keyboard:** Accessible OTP input/consent, sending/expired/invalid/rate-limited/retry; retain exact revision/total and ordinary no-account flow outside opt-in policy; error focus avoids timed puzzle.
- **API / backend:** Capability/revision-scoped challenge verification with expiry, attempt/send limits and replay prevention; do not broaden quote access or approve a stale revision. Use vetted delivery/auth mechanism, never log codes.
- **DB / migrations:** Add hashed challenge/attempt/expiry metadata only for approved pilot; atomic single-use verification and bounded sensitive retention.
- **Verify:** Test expiry/replay/brute-force/stale revision and alternate-token attempts; one valid code permits only intended approval. Measure completion/security tradeoff and reject unnecessary friction.
- **Evidence:** pending policy/trigger, threat review and pilot tests.

## Deferred S3 — Approval-to-billing opt-in policy

### OPS-013 — Pilot explicit owner opt-in billing after approval
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-076
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured business automation demand and accounting/security approval.
- **UI / keyboard:** Owner toggle defaults off, explains accounting consequence and requires accessible confirmation; Employee cannot change policy. Page view never bills under any setting; unresolved preflight remains actionable.
- **API / backend:** Approved-revision event invokes exactly the existing authorization/preflight/idempotent billing command; no bypass of company/mapping/stock/tax checks. Bind event/version and reject stale/duplicate approval triggers.
- **DB / migrations:** Audited opt-in policy/version plus durable event/work identity; preserve existing immutable job payload and uncertainty handling.
- **Verify:** Default off → approval creates zero bill jobs; opt-in plus valid preflight → one existing-path job; repeated event/view → no second job. Automate stale approval/blocked preflight/Employee toggle denial.
- **Evidence:** pending demand, policy sign-off and isolated pilot results.

## Deferred C1 / Q2 — Connectivity and search experiments

### OPS-014 — Evaluate a bounded offline seller snapshot
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-077
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured counter outages harming sales, not architectural preference.
- **UI / keyboard:** Offline/stale/conflict labels and explicit recovery; quote snapshots unchanged, no falsely Saved state; ordinary keyboard search/edit fallback.
- **API / backend:** Pilot versioned bounded tenant-scoped snapshot/delta contract with revocation, conflict and schema-upgrade policy; evaluate SQLite-Wasm only if baseline D1/network workflow fails measured need.
- **DB / migrations:** ADR covers snapshot versions, local sensitive-data lifetime, deltas/conflicts/schema upgrades before adding store; server remains authoritative and isolation preserved.
- **Verify:** Disconnect/reconnect two tenants, revoke membership and upgrade schema; stale writes conflict without cross-tenant leak or immutable quote mutation. Measure sales-task recovery against baseline; reject complexity without benefit.
- **Evidence:** pending connectivity metrics, ADR and pilot results.

### OPS-015 — Benchmark richer search against the existing D1 baseline
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-077
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured FTS ranking/search failure and approved experiment.
- **UI / keyboard:** Existing search/loading/no results and explainable matches; no new Compare mode or hidden canonical classification. Preserve typed accessible fallback and explicit seller/global boundaries.
- **API / backend:** Benchmark one approved variant at a time: dedicated search, vector search or SKU-token learning against exact full-SKU/FTS fixtures; versioned bounded authorized search contract. Never embed private cost/aliases in a shared index.
- **DB / migrations:** ADR estimates second-index rebuild/sync costs, schema version and revocation/deletion; add no store before experiment approval, no blanket ontology migration.
- **Verify:** Score ranking on labeled queries and measure latency/cost/isolation; exact SKU remains correct, private tenant fixture never returned. Adopt only if measured success improves enough to justify added operations.
- **Evidence:** pending ranking telemetry, experiment selection and benchmark.

### OPS-016 — Test one explicitly reviewed ontology or relationship-inference hypothesis
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-077
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured taxonomy/compatibility usability failure and approved single hypothesis.
- **UI / keyboard:** Prototype one of dynamic category/ontology, cross-brand equivalence or series/package inference as visibly unapproved advice with accessible review; no hallucinated compatibility or automatic canonical classification, replacement or new Compare mode.
- **API / backend:** Isolated versioned experiment contract under business/platform policies; candidates cannot publish global truth, alter quote snapshots or bypass relationship approval. Evaluate each optional hypothesis separately, not as ingestion prerequisite.
- **DB / migrations:** None for initial benchmark; later approved schema must be incremental, provenance/versioned and reversible, never all-at-once ontology.
- **Verify:** Ground-truth positive/negative compatibility fixtures expose false inference; assert candidate view has zero canonical/quote writes and no private tenant evidence leak. Reject if precision/benefit threshold fails.
- **Evidence:** pending hypothesis, measured trigger, precision threshold and architecture decision.

### OPS-017 — Evaluate consent-based voice input with typed fallback
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-077
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured usability need and approved privacy/accessibility pilot.
- **UI / keyboard:** Explicit microphone consent/start/stop, denied/unavailable/misrecognized states; editable typed fallback always available and confirmation before any consequential action. No voice-only workflow.
- **API / backend:** Scope transcription/search to current authorized business; define provider/regional handling and retention, never let recognized speech bypass ordinary quote/approval/billing permissions.
- **DB / migrations:** None by default; no audio retention unless separately approved with bounded privacy policy; immutable quotes unaffected by transcript edits.
- **Verify:** Denied microphone still completes typed task; incorrect SKU requires correction and cannot auto-add/bill. Automate permission/auth boundaries and measure task success against keyboard baseline; reject without benefit.
- **Evidence:** pending consent/privacy review and pilot usability results.

## Deferred I2 / I4 — Extraction and orchestration fallback

### OPS-018 — Benchmark a versioned extraction fallback on a failing corpus
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-078
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: demonstrated brand quality or CPU failure with approved bounded corpus experiment.
- **UI / keyboard:** Existing job/review shows parser/version/fallback/retry and partial-quality warning; source/raw/correction distinction and keyboard review unchanged.
- **API / backend:** Try brand-specific extractor first; evaluate OCI Docling/MinerU stage only for documents needing heavy processing. Reuse typed extractor/job/artifact interface, authenticated scoped service, bounded retry and no arbitrary URL fetch; document region/data handling/cost. OCI is not mandatory ingestion infrastructure; no Docker inside Cloudflare production.
- **DB / migrations:** Approved extractor version such as docling-v1 and reproducible artifacts; durable reservation/fencing prevents primary/fallback double publication. Preserve raw evidence/claims and rollback compatibility.
- **Verify:** Run failing and control corpus: target quality/CPU improves without unrelated regression; automate fallback race/retry/provenance and unauthorized artifact access. Reject purely architectural replacement or failed cost gate.
- **Evidence:** pending corpus/CPU trigger, hosting decision and benchmark.

### OPS-019 — Evaluate orchestration replacement only beyond proven Workflow limits
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-078
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: genuinely complex long-lived orchestration exceeding measured Workflows capability, approved independently of extractor fallback.
- **UI / keyboard:** Existing durable job/retry states remain truthful; human review is not an expiring orchestration spinner. No new required seller surface.
- **API / backend:** Bound a Temporal evaluation to one failing orchestration scenario under existing typed job/artifact contracts; authenticated scoped workers, retry limits, cost/regional review. Human review/business truth stays durable outside engine retention.
- **DB / migrations:** Versioned workflow/execution correlation and rollback plan preserve claims/raw evidence and reservation ownership; no wholesale state migration for a spike.
- **Verify:** Replay crash/timeout/engine-expiry scenario against baseline and candidate; no lost human review or duplicate artifacts, measurable reliability benefit and justified cost. Reject sophistication-only switch.
- **Evidence:** pending limitation proof, architecture approval and pilot comparison.

## Deferred non-screen fan-out / M1 moderation assistance

### OPS-020 — Pilot durable fan-out after explicit global publication
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-079
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: actual notification/analytics/secondary-artifact fan-out workload and approved threshold.
- **UI / keyboard:** None beyond truthful authorized notification/job status; publication still does not silently adopt seller prices.
- **API / backend:** Transactional durable outbox/work IDs after global price publication; Queue accelerates execution, never source of truth. Consumer idempotency, bounded retries/dead-letter handling and tenant-safe telemetry; verify actual provider limits before use.
- **DB / migrations:** Outbox unique work identity, durable progress/attempts and retention independent of Queue; append-only price history and explicit seller adoption unchanged.
- **Verify:** Lose/expire/duplicate a message beyond quoted 24-hour Queue retention; rebuild from D1 and perform each logical side effect once. Automate publish rollback/no-outbox, consumer race and seller-price immutability.
- **Evidence:** pending workload/threshold, replay tests and pilot cost.

### OPS-021 — Dry-run safeguarded moderation assistance without consensus truth
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-079
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured moderation backlog and approved precision/safeguard policy.
- **UI / keyboard:** Admin rule/evidence preview, dry-run outcomes, confidence limits, override and audit; accessible explicit confirmation. No opaque auto-publication or bulk approve-by-confidence shortcut.
- **API / backend:** Platform-only versioned rule evaluation against independent evidence; dry-run has no canonical writes. Any later trusted-approval policy requires explicit safeguards/approval and existing audited publication command, never “three dealers = truth.”
- **DB / migrations:** Approved pilot adds rule versions/evaluation provenance only; immutable claims/prices/seller adoption unchanged.
- **Verify:** False-consensus/repeated-binary/conflicting-date fixtures do not publish; measure precision and workload reduction. Automate unauthorized rule/override, deterministic replay and zero dry-run writes; reject unsafe precision.
- **Evidence:** pending backlog trigger, threshold approval and dry-run results.

### OPS-022 — Promote independently used aliases only through admin review
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-079
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured multi-business phrase demand and approved promotion policy.
- **UI / keyboard:** Admin phrase/evidence/independence preview, confirm/reject/override with audit; local aliases continue working without approval. Keyboard-accessible confirmation and conflict states.
- **API / backend:** Platform-only versioned promotion command verifies independent usage/provenance and permitted public phrase; never leak private commercial information or treat usage count as truth without review.
- **DB / migrations:** Unique canonical alias/promotion provenance with actor/time/source/version; preserve tenant-local originals and append-only decision history.
- **Verify:** Repeated submissions from one business do not count as independence; private-sensitive phrase withheld. Automate two-admin/retry conflict, audit and local alias continuity; measure search benefit before rollout.
- **Evidence:** pending demand/precision policy and pilot tests.

## Deferred S3 / T6 — Bridge fleet and voucher extensions

### OPS-023 — Pilot signed bridge update recovery and redacted support bundles
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-080
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: widespread deployed agents/support load and approved bounded Windows rollout.
- **UI / keyboard:** Owner update/status/rollback consent and accessible progress/recovery; support export explicitly selected, redacted and described. Unknown billing state remains visible through upgrade.
- **API / backend:** Verify signed update artifacts, authorized channel/version and replay/downgrade protection; rollback only to explicitly permitted signed compatible version. Scoped diagnostics bundle excludes credentials/PII/raw commerce; no arbitrary remote commands.
- **DB / migrations:** Agent version/update audit and local-ledger migration compatibility; preserve intent/correlation/uncertain result across interrupted update and approved rollback.
- **Verify:** One real Windows interrupted-update drill recovers service without replaying bills; reject tampered/replayed/unauthorized downgrade artifacts. Automate bundle redaction and ledger migration fixtures; record rollout/rollback owner.
- **Evidence:** pending fleet metrics, threat model and Windows pilot evidence.

### OPS-024 — Verify Optional Voucher semantics before exposing a mode switch
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-080
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: explicit business Tally-review need and accountant-approved real-company pilot.
- **UI / keyboard:** Owner Normal Sales/Optional choice defaults Normal; explicit confirmation names mode. Optional success says Sent as optional voucher — awaiting Tally posting / Not posted, never ordinary Billed until verified regularization; hide switch if backend cannot distinguish states.
- **API / backend:** Existing typed approved/preflight/idempotent voucher path carries permitted subtype; verify actual Tally creation/regularization outcome, company/identity/totals and authorization. No automatic final-posted assumption.
- **DB / migrations:** Versioned voucher policy/result subtype and posting-verification evidence; retain immutable payload/local ledger and uncertain execution across policy changes.
- **Verify:** Real Tally optional creation remains not posted in UI; later verified posting transitions only with evidence. Automate mode-change stale preflight, ACK loss and Employee policy denial; normal Sales behavior unchanged.
- **Evidence:** pending accounting policy, real optional/regularization XML and pilot report.

## Deferred non-screen support tools — never the Create Bill path

### OPS-025 — Evaluate scoped MCP adapters over existing typed capabilities
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-080
- **Depends on:** Parent gate RAL-075
- **Release:** deferred — not a v1 blocker; trigger: measured support-tool demand and approved threat model/bounded capability pilot.
- **UI / keyboard:** None for protocol adapter; any support client write requires accessible explicit approval naming business/company/revision/action. Create Bill button remains deterministic and never routes through an AI/MCP reasoning agent.
- **API / backend:** Document/test allowlist get_tally_status, list_stock_items, search_stock_item, get_stock, sync_catalogue, create_stock_item, create_sales_voucher, get_voucher; expose only approved pilot subset over existing typed authorization/preflight/idempotency contracts. Read scope cannot authorize writes; write tools require explicit approval, not prompt-derived company access.
- **DB / migrations:** None beyond existing audited jobs/results and approved support-action audit; preserve cloud/local ledger correlation and uncertainty policy.
- **Verify:** Contract tests deny wrong business/company, stale revision, missing approval and key/hash mismatch; one approved adapter call returns same underlying result without a second voucher. Verify production Create Bill has no MCP dependency; reject pilot if permission boundary cannot be maintained.
- **Evidence:** pending support metrics, scoped-tool threat review and pilot tests.

## Screen and feature completion checklists

## V1 completion — all require evidence

- [ ] M6 resource/quality/reliability: OPS-001–OPS-003 — every named metric has source, denominator, freshness, privacy and regression tests.
- [ ] Recovery/retention: OPS-004–OPS-005 — exercised safe replay/rotation/orphan policy and actual D1 restore, not runbook text alone.
- [ ] Budgets/scaling: OPS-006 — dated official limits, warnings/caps/degrade and measured scale decisions, no free-tier guarantee.
- [ ] All-screen performance: OPS-007–OPS-008 — production build budgets and labeled lab/field/device evidence.
- [ ] Security/migrations/deployment: OPS-009 — authorization/concurrency suite, replay/upgrade/restore and protected real staging/deploy gates.
- [ ] Full release: OPS-010 — all v1 parent requirements traced to evidence, real AI/Windows/Tally gates, keyboard/mobile/slow-network journey and approvals.

## Deferred review — optional, never a v1 completion prerequisite

- [ ] P3/P2/S3: OPS-011–OPS-013 — each separately justified; public privacy, exact approval and existing billing safeguards retained.
- [ ] C1/Q2: OPS-014–OPS-017 — offline/search/ontology/voice hypotheses individually approved or explicitly rejected; no bundled speculative infrastructure.
- [ ] I2/I4: OPS-018–OPS-019 — extraction/orchestration limits proven, experiments separately measured and reversible.
- [ ] Fan-out/M1: OPS-020–OPS-022 — outbox durability, assisted-review safeguards and independent alias promotion each reviewed.
- [ ] S3/T6/support: OPS-023–OPS-025 — signed fleet recovery, truthful Optional Voucher and scoped MCP independently reviewed.

For any later production feature, preserve its full RAL parent acceptance and obtain implementation/security/migration/real-environment evidence beyond the bounded pilot. Recording a rejected or approved experiment is not permission to mark an unimplemented feature DONE.