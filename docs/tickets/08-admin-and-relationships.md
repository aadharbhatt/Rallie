# 08 — Administration and relationships

Sources: [parent requirements](../IMPLEMENTATION.md), [screen and interaction specification](../DESIGN.md).

These are implementation-sized child tickets, not completed implementation. Each is a roughly half-day behavior or bounded verification exercise after its dependencies pass. All inherited parent acceptance/security requirements still apply; the 80 RAL requirements remain authoritative. Proposed API paths below must be frozen with request/response fixtures during implementation. Cross-file dependencies are parent gates, not guessed child IDs. No schema is introduced before its feature needs it.

## Parent mapping inventory

| Parent | Required coverage | Children |
| --- | --- | --- |
| RAL-053 | Admin queues, identity evidence and decisions | ADM-001–ADM-006 |
| RAL-054 | Append-only price publication, ordering and drift | ADM-007–ADM-010 |
| RAL-055 | Explicit duplicate decisions, collision-safe merge and history | ADM-011–ADM-015 |
| RAL-056 | Audit, source grants, inactive relationship seam | ADM-002, ADM-016 |
| RAL-057 | Moderation authorization/publication/merge gate | ADM-017 |
| RAL-058 | Seller-local proposal, direction/cycle policy and privacy | ADM-018–ADM-021 |
| RAL-059 | Global relationship review, publication and merge handling | ADM-022–ADM-024 |
| RAL-060 | Builder disclosure, pricing bridge and explicit multi-add | ADM-025–ADM-028 |

Shared UI contract: native tables, manual-activation tabs, named buttons, visible focus, safe initial confirmation focus, Escape/close and focus restoration; no character shortcut for consequential decisions. Loading, empty, permission, error, stale/conflict and resolved states must be truthful. Read-only inspection never publishes or adds quote lines. Platform Admin is a platform flag, not a new business role and not permission to read seller cost/profit.

## M1 — Administration queues

### ADM-001 — Restrict the administration entry and queue reads
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-053
- **Depends on:** Parent gate RAL-052
- **UI / keyboard:** Separate Platform administration navigation; direct-link denied and session-expired states; heading focus and normal Back navigation.
- **API / backend:** Add platform-flag middleware to proposed `GET /api/admin/claims` and detail routes; derive actor server-side, deny forged business-admin roles, and return no private seller commercial fields.
- **DB / migrations:** None; use existing authenticated identity/platform flag without introducing a Catalogue Reviewer role.
- **Verify:** Automate anonymous/Employee/Owner-without-flag denial and flagged-admin success; inspect response DTO for cost/profit absence; keyboard-open direct route and recover from denial.
- **Evidence:** pending.

### ADM-002 — Browse four filtered moderation queues
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-053, RAL-056
- **Depends on:** ADM-001
- **UI / keyboard:** Product claims, Prices, Relationships, Duplicates manual tabs; counts, Pending/Reviewed, supported brand/date filters, pagination, received/source/conflict columns and Review. Relationships explains not yet active. Empty says All caught up; Back restores row/filter; Next is explicit.
- **API / backend:** Platform-only cursor-paginated queue/count DTO with supported filters and stable ordering; inactive relationship capability returns no fabricated candidates.
- **DB / migrations:** Add measured queue status/date indexes only; no relationship schema yet.
- **Verify:** Seed multiple pages and resolved items; automate counts/filter pagination and stable Back restoration; arrow keys change tab focus without activating until Enter/Space; inactive tab cannot approve.
- **Evidence:** pending.

## M2 — Product claim detail

### ADM-003 — Compare claim fields and independent evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-053
- **Depends on:** ADM-002
- **UI / keyboard:** Current/proposed brand, SKU, name, description; new versus existing identity; document/page/raw text separate from seller correction. Narrow layout stacks Before/Proposed. Source unavailable retains text and Retry; possible duplicate links to review, not merge.
- **API / backend:** Platform-authorized detail and short-lived source grant; immutable locator DTO includes independent businesses, documents, rows and conflicts, excluding seller costs.
- **DB / migrations:** None; read existing claims/submissions/source lineage without rewriting evidence.
- **Verify:** Use one binary submitted by two businesses: show one document/two submissions. Automate source ACL, expired grant and DTO privacy; open/close source by keyboard and restore evidence-link focus.
- **Evidence:** pending.

### ADM-004 — Approve only the intended identity fields
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-053
- **Depends on:** ADM-003
- **UI / keyboard:** Consequence summary and explicit Approve confirmation; pending guard, approved result and stale/already-decided reload; no automatic next-item navigation.
- **API / backend:** Platform-only claim decision command takes expected claim version, selected permitted fields, reason and operation key; validate provisional identity lineage and reject posted actor/status overrides.
- **DB / migrations:** Add decision version and approved_by/approved_at/source_claim_id equivalents; canonical identity update, decision and audit in one bounded transaction; retain rejected/provisional evidence.
- **Verify:** Approve provisional and existing-identity fixtures; only selected fields change. Automate two-admin race, same-key retry, changed-payload conflict and rollback between canonical/audit writes.
- **Evidence:** pending.

### ADM-005 — Reject a product claim without changing seller value
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-053
- **Depends on:** ADM-004
- **UI / keyboard:** Reject reason field, explicit submit/cancel, pending/rejected/conflict result; error summary focuses invalid reason; rejected evidence remains reachable.
- **API / backend:** Reuse versioned platform-only decision contract with reject outcome/reason; same operation key returns original decision, not a second event.
- **DB / migrations:** None beyond ADM-004; atomically append rejection and audit, never delete proposal or touch seller overlay/quote.
- **Verify:** Snapshot seller prices and quotation before rejection; assert byte-equivalent commercial content afterward; automate reject-versus-approve race and unauthorized reject denial.
- **Evidence:** pending.

### ADM-006 — Recover from resolved claims and source failures
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-053
- **Depends on:** ADM-004, ADM-005
- **UI / keyboard:** On stale version show prior and current resolution, disable obsolete actions and offer Reload comparison; a failed source never says no evidence. Preserve reading position and explicit Return to queue.
- **API / backend:** Platform detail returns current version/decision with structured conflict response; source renewal rechecks moderation access.
- **DB / migrations:** None; do not mutate a decision during recovery GET.
- **Verify:** Two browser sessions decide one claim; second sees resolved state and cannot publish twice. Automate expired source refresh, failed reload with retained detail and stable keyboard focus.
- **Evidence:** pending.

## M3 — Price claims and history

### ADM-007 — Present price evidence and publication consequences
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-054
- **Depends on:** ADM-003
- **UI / keyboard:** Current ₹5,000/proposed ₹6,000, delta, effective date or Not supplied, history, independent business/document/identical-row/conflict counts and source locators. Named Publish ₹6,000 price version action explains shops/quotes do not auto-change.
- **API / backend:** Platform-only price detail DTO returns approved history and proposed provenance; no confidence threshold becomes a decision or seller-cost grant.
- **DB / migrations:** None; immutable history read.
- **Verify:** Unknown date is not today; seven agreeing submissions do not publish. Automate count distinctions, private-field exclusion and keyboard source/history traversal.
- **Evidence:** pending.

### ADM-008 — Define deterministic effective-date price ordering
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-054
- **Depends on:** ADM-007
- **UI / keyboard:** Preview explains future, same-date, unknown-date and conflicting current-pointer outcomes; no silent date coercion; readable warning before confirm.
- **API / backend:** Freeze approved ordering policy and pure pointer-selection contract, including explicit resolution of equal-date conflicts; validate amount precision/date/source/version before command execution.
- **DB / migrations:** Define append-only history constraints and stable pointer invariants; migrate only any missing ordering metadata required by the approved policy.
- **Verify:** Table-driven tests cover past/future/same/unknown dates and conflicting amounts; repeat/reorder inputs and assert deterministic policy or explicit conflict, never overwritten history.
- **Evidence:** pending policy sign-off and fixtures.

### ADM-009 — Publish one immutable price version and preserve drift
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-054
- **Depends on:** ADM-008, ADM-004
- **UI / keyboard:** Safe-focus publication confirmation, pending/result/conflict; resolved detail shows new version and explicit seller-adoption requirement.
- **API / backend:** Platform-only price decision validates expected version, amount/date/source and operation key; publication command has no seller-price mutation capability.
- **DB / migrations:** Unique publication operation; insert product_price_versions plus approval provenance, policy-selected latest pointer, claim decision and audit atomically. Never overwrite old ₹5,000 version.
- **Verify:** Publish ₹6,000 twice: one history row, seller active ₹5,000 and drift visible; existing quote unchanged. Automate transaction fault, concurrent admins and future-date pointer fixtures.
- **Evidence:** pending.

### ADM-010 — Reject price evidence and inspect immutable history
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-054
- **Depends on:** ADM-009
- **UI / keyboard:** Reasoned Reject with pending/error/conflict; history exposes actor/date/source; keyboard announces exact amount/effective date and returns to resolved row.
- **API / backend:** Platform-only reject and paginated history reads; expected version/operation key; no normal history update/delete API.
- **DB / migrations:** Retain rejected price claim and append audit; None otherwise.
- **Verify:** Reject preserves source, canonical pointer and seller price; automate repeat rejection and stale decision; attempt history rewrite is denied.
- **Evidence:** pending.

## M5 — Duplicate review and merge

### ADM-011 — Compare duplicates and record Not duplicate
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-055
- **Depends on:** ADM-010
- **UI / keyboard:** A/B identity, descriptions, SKUs, price history and sources; separate non-destructive Not duplicate with reason; no fuzzy-score-selected destination. Preserve comparison on error.
- **API / backend:** Platform-only duplicate detail and versioned not-duplicate command with operation key; never interpret candidate score as merge authorization.
- **DB / migrations:** Add durable reviewed-pair decision/audit with pair/version uniqueness; preserve source identities.
- **Verify:** Mark similar SKUs Not duplicate and reopen reviewed queue; automate repeat request and race; neither identity nor reference changes.
- **Evidence:** pending.

### ADM-012 — Preview a directed merge and reference impact
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-055
- **Depends on:** ADM-011
- **UI / keyboard:** Explicit destination selection; heading/button say Merge B into A. Show active references, historical preservation, irreversible implications and no fake Undo; safe Cancel focus.
- **API / backend:** Platform-only preview accepts winner/loser and expected versions, returns impact/version token; reject self, cycles, merged/unavailable or incompatible targets; never reveal seller costs in collision summaries.
- **DB / migrations:** None; read-only impact query with no redirects before confirm.
- **Verify:** Reverse destination and inspect changed preview; automate self/cycle/stale-target denial; viewing/cancelling preview writes nothing.
- **Evidence:** pending.

### ADM-013 — Require an explicit seller-overlay collision plan
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-055
- **Depends on:** ADM-012
- **UI / keyboard:** List affected businesses as permitted identifiers and unresolved collision counts without private commercial values; accessible blocked/ready plan state and resolution explanation.
- **API / backend:** Define versioned conflict-resolution policy/ADR for businesses carrying both identities, price links and existing mapping references; require authorized resolution evidence rather than silently dropping an overlay. Platform flag alone cannot authorize cost disclosure.
- **DB / migrations:** Validate seller-overlay uniqueness/FKs and preserve cost/mapping ownership; no destructive cascade or schema for future features.
- **Verify:** Both overlays have distinct costs/mappings: unresolved plan blocks; approved plan preserves commercial data. Automate stale overlay version and private-field leak tests.
- **Evidence:** pending collision-policy approval and fixtures.

### ADM-014 — Commit merge redirects exactly once
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-055
- **Depends on:** ADM-013
- **UI / keyboard:** Final direction/impact confirmation, pending duplicate-submit guard, merged result or reloadable conflict; no implicit next item.
- **API / backend:** Platform-only merge command binds winner/loser versions, resolution plan, reason and operation key; use bounded atomic commit or documented durable checkpoint plan, not unbounded false atomicity.
- **DB / migrations:** Add MERGED/merged_into_product_id constraints; redirect active catalogue/search references, reconcile overlay/price links, append audit; keep old IDs, sources, prices, claims and immutable quotes. Expose versioned hooks for later relationship/Tally references.
- **Verify:** Retry command yields one redirect; historical ID resolves and quote bytes stay unchanged. Automate concurrent opposing merges, FTS/reference consistency and mid-commit fault recovery.
- **Evidence:** pending.

### ADM-015 — Prove merge recovery and historical preservation
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-055
- **Depends on:** ADM-014
- **UI / keyboard:** Already merged, target removed, conflicting plan and rejected merge retain comparison/recovery; document administrative correction rather than fake Undo.
- **API / backend:** Exercise merge status/replay under platform ACL and fault injection; stale operation cannot double-migrate or create cycles.
- **DB / migrations:** Replay migration on representative history; verify immutable quote/documents, claims, source IDs, costs and mapping hooks before/after failures.
- **Verify:** Crash at each commit boundary, restart and retry; assert one merge/audit outcome and all retained IDs resolve. Keyboard cancellation and conflict recovery never trigger merge.
- **Evidence:** pending fault matrix and correction procedure.

## Shared moderation feature — audit and slice gate

### ADM-016 — Inspect append-only decisions with safe source access
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-056
- **Depends on:** ADM-010, ADM-014
- **UI / keyboard:** Common approve/reject/merge timeline with actor/time/reason/source, pagination and readable source-failure fallback; tab through details without focus loss.
- **API / backend:** Read-only platform audit/detail routes and narrowly scoped source grants; reject mutation and unrelated seller-cost reads. Decisions remain inspectable after source transport failure.
- **DB / migrations:** Audit actor/time/entity/source indexes; enforce atomic canonical change plus append-only record and publication provenance fields.
- **Verify:** Trace every identity/price/merge to actor/evidence; automate attempted rewrite, unauthorized source grant and rollback consistency; inactive Relationships still explicitly unavailable until ADM-022.
- **Evidence:** pending.

### ADM-017 — Verify the moderation journey before relationships
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-057
- **Depends on:** ADM-006, ADM-010, ADM-015, ADM-016
- **UI / keyboard:** Keyboard journey across queues: compare, publish price, reject claim, Not duplicate and confirmed merge; empty/conflict queues and responsive evidence remain understandable.
- **API / backend:** Run nonadmin, source ACL, tenant privacy, repeated/stale/concurrent command regressions; three/seven businesses never auto-publish.
- **DB / migrations:** Snapshot canonical/seller/source/history state; assert atomic audit, immutable quotation revisions and seller active price unchanged until separate adoption.
- **Verify:** Execute journey from seeded ingestion claims; new global MRP appears only after admin decision, drift appears, seller adoption remains explicit. Relationship implementation must still be labeled next slice.
- **Evidence:** pending moderation suite, traces and gate decision.

## C5 — Seller relationship proposal

### ADM-018 — Submit a validated local relationship proposal
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-058
- **Depends on:** ADM-017
- **UI / keyboard:** Labeled source/target combobox, Required with/Commonly sold with/Alternative, explicit direction preview, Submit/Cancel. Keyboard search/select and errors for self, duplicate, unavailable target and conflict.
- **API / backend:** `POST /api/catalogue/relationship-proposals` checks Owner/Employee business access, endpoints, type and operation key. Freeze direction, symmetry and cycle policy; no inferred ontology/PDF pairing.
- **DB / migrations:** Introduce product_relationship_candidates with A/B/type/business/proposer/status/version/timestamps, retained evidence/reason; unique active logical proposal and endpoint FKs.
- **Verify:** Submit valid and repeated proposals; one local candidate. Automate all three types, self/cycle/direction and foreign-business endpoint denials; cancel writes nothing.
- **Evidence:** pending policy and tests.

### ADM-019 — Expose local advice immediately without global leakage
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-058
- **Depends on:** ADM-018
- **UI / keyboard:** Success reads Available in your shop now · Pending global review; return focus to relationship heading; local/pending/rejected labels and recovery remain explicit.
- **API / backend:** Relationship reads union approved edges with current business candidates only; derive business from session and preserve provenance. Define and expose rejected-local-advice retention/visibility policy.
- **DB / migrations:** Candidate business/status lookup index; no global edge insert from seller submission.
- **Verify:** Business A sees proposal immediately, B cannot see candidate/evidence by list or ID; quote lines remain unchanged. Automate rejection-policy rendering and no implicit product insertion.
- **Evidence:** pending.

## C3 — Product drawer relationships

### ADM-020 — Display directional relationships with honest provenance
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-058
- **Depends on:** ADM-019
- **UI / keyboard:** Required with/Commonly sold with/Alternatives lists include identifiers, direction and Local suggestion/Globally approved labels; empty/error states and Suggest relationship action; Alternative is not a technical-compatibility guarantee.
- **API / backend:** Business-scoped relationship DTO includes edge type/direction/provenance and accessible target; do not infer reciprocity or fuzzy compatibility text.
- **DB / migrations:** None; use candidate read model, extending approved edges only after ADM-023.
- **Verify:** Directed trim→body appears correctly; reverse view is not invented. Automate other-tenant evidence exclusion; keyboard-open target and return to invoking relation.
- **Evidence:** pending.

### ADM-021 — Recover local proposals after duplicate or stale submission
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-058
- **Depends on:** ADM-020
- **UI / keyboard:** Duplicate points to existing local proposal; stale/unavailable target preserves input and offers reselect; rejected history explains policy rather than disappearing silently.
- **API / backend:** Versioned candidate detail/error DTO under business ACL; same key/different payload conflicts, rejected candidate history cannot be overwritten by resubmit.
- **DB / migrations:** Enforce active-edge uniqueness under concurrent requests and retain rejected evidence/version lineage.
- **Verify:** Race two equivalent proposals and retry after timeout: one active logical edge; automate changed-payload reuse, cycle policy and rejected-history retention; no quote mutation.
- **Evidence:** pending.

## M4 — Global relationship moderation

### ADM-022 — Activate relationship queue with pair and direction evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-059
- **Depends on:** ADM-021, ADM-016
- **UI / keyboard:** Replace unavailable seam with candidate pair/type/proposer/evidence/existing-edge/conflict detail; loading/empty/error; keyboard comparison/source/actions with Back restoring queue.
- **API / backend:** Platform-only paginated relationship list/detail, safe source grants; show self/duplicate/conflicting direction rather than silently repairing; seller cannot read another shop's pending evidence.
- **DB / migrations:** Candidate status/date indexes; no global publication from read.
- **Verify:** Authorized admin sees seeded candidates; seller and unflagged Owner denied; automate private evidence exclusions and stable filtered pagination.
- **Evidence:** pending.

### ADM-023 — Approve or reject a relationship atomically
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-059
- **Depends on:** ADM-022
- **UI / keyboard:** Explicit approve/reject confirmation names A/B/type/direction; pending/conflict/result; rejection explains local-advice policy and keeps audit.
- **API / backend:** Platform-only decision takes candidate version/reason/operation key; seller cannot publish/overwrite approved edges; resolve merged endpoints, directed required edges and symmetric alternatives under decided policy.
- **DB / migrations:** Introduce product_relationships with canonical endpoint/type uniqueness, approval actor/time/source candidate; candidate status+edge+audit atomic; reject self/cycles/duplicate logical edge.
- **Verify:** Approval becomes globally visible once; repeat/concurrent decisions produce one edge. Automate reject history, stale/merge/cycle conflicts, cross-tenant pending privacy and rollback.
- **Evidence:** pending.

### ADM-024 — Preserve relationships when identities merge
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-059
- **Depends on:** ADM-023, ADM-015
- **UI / keyboard:** Merge preview adds relationship impact, collapsing-edge/conflicting-direction blockers; drawer updates approved provenance without claiming compatibility.
- **API / backend:** Implement versioned relationship merge hook; platform authorization and operation fencing inherited; canonicalization must not silently approve pending proposals or expose their evidence.
- **DB / migrations:** Reconcile active directed/symmetric edges with unique constraints, retain historical endpoints/source candidates/audit; reject new self/cycle collisions until explicitly resolved.
- **Verify:** Merge endpoints of duplicate alternatives and required cycles; safe case has one canonical edge, unsafe case blocks. Automate candidate history and seller privacy preservation.
- **Evidence:** pending.

## Q2–Q3 — Build relationship integration (owned here)

### ADM-025 — Disclose required, companion and alternative suggestions
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-060
- **Depends on:** ADM-024, Parent gate RAL-024
- **UI / keyboard:** Seller search names required/common/alternative products with local/global provenance; Kubix trim prompts ALD-CHR-079N body, quantities/prices, Add both/Add this product only/Cancel. No Enter-to-add from typing/composition; safe confirmation focus.
- **API / backend:** Extend business-scoped quote-search DTO with approved plus own local relationships; suggestions never cause writes or recursive graph traversal.
- **DB / migrations:** None; read-only relationship projection.
- **Verify:** Open suggestions and cancel: zero lines added; other business local proposal absent; automate keyboard prompt and alternatives never replacing existing lines.
- **Evidence:** pending.

### ADM-026 — Resolve missing counterpart pricing before Add both
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-060
- **Depends on:** ADM-025, Parent gate RAL-016
- **UI / keyboard:** Uncarried global counterpart opens explicit seller adoption/pricing sheet; preserve search/prompt context, failure/cancel and focus return; Add trim only remains available and is not an accounting block.
- **API / backend:** Reuse authorized seller adoption contract, then revalidate carried IDs/prices before multi-add; global lookup never silently becomes a priced seller result.
- **DB / migrations:** None; existing adoption writes only after explicit confirmation, no quote line until separate selected action.
- **Verify:** Cancel pricing leaves no counterpart/line; complete adoption enables Add both. Automate missing price, foreign seller item, failed adoption and stale pricing responses.
- **Evidence:** pending.

### ADM-027 — Add exactly the explicitly selected lines once
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-060
- **Depends on:** ADM-026
- **UI / keyboard:** Already-in-quote state shows existing quantity and any proposed increase; no accidental duplicates/hidden quantity changes; pending/error/retry retains selection, success announces product/quantity and preserves Add focus.
- **API / backend:** Versioned/idempotent add-lines command carries only explicit IDs/quantities and expected draft version; validate every line's business, seller pricing and snapshot. Same key/hash returns original result; stale draft conflicts.
- **DB / migrations:** Atomic bounded draft additions/events; unique operation identity; no recursive insertion, automatic replacement or historical revision mutation.
- **Verify:** Add both inserts chosen two once, Add only one, Cancel none. Automate duplicate click/ACK loss, existing counterpart, quantity consent, looped relations and cross-business injection.
- **Evidence:** pending.

### ADM-028 — Close the local-to-global-to-builder relationship journey
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-060
- **Depends on:** ADM-027
- **UI / keyboard:** Keyboard seller proposal → drawer → admin review → Build choice at desktop/touch widths; local/rejected/global labels and restoration correct; no silent lines on publication.
- **API / backend:** Exercise proposer/other-business/platform-admin roles, promotion retry, merged targets and versioned multi-add with fixtures; preserve all RAL-058–RAL-060 gates.
- **DB / migrations:** Assert candidate/evidence/audit retention, canonical edge uniqueness and immutable existing quotation snapshots across full journey.
- **Verify:** Before approval only A benefits; after approval B sees global relation, never A's private pending evidence. Price counterpart explicitly; retry Add both yields two lines once and Add only remains valid.
- **Evidence:** pending relationship slice suite and gate sign-off.

## Screen completion checklist

- [ ] M1: ADM-001–ADM-002 — role-safe queues, filters, states and focus restoration evidenced.
- [ ] M2: ADM-003–ADM-006 — source distinction, audited decisions and concurrent recovery evidenced.
- [ ] M3: ADM-007–ADM-010 — ordering, immutable publication and unchanged seller price evidenced.
- [ ] M5: ADM-011–ADM-015 — explicit direction, collisions, recovery and preserved history evidenced.
- [ ] Shared moderation: ADM-016–ADM-017 — audit/security and moderation gate passed before relationship schema.
- [ ] C5/C3: ADM-018–ADM-021 — useful private local proposal and drawer provenance evidenced.
- [ ] M4: ADM-022–ADM-024 — deliberate global promotion, rejection and merge-edge policy evidenced.
- [ ] Q2/Q3 relationship integration: ADM-025–ADM-028 — pricing bridge, Add both/Add only/Cancel and idempotent quantities evidenced.

Completion requires real implementation commits, migration results, automated tests and relevant keyboard/responsive traces. This document and checked planning inventories alone satisfy none of these boxes.