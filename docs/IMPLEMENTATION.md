# Rallie implementation backlog — screen and feature index

Source of truth: [rallie-init.md](../rallie-init.md). Prepared 2026-10-28. This is an actionable implementation plan, not evidence that any feature exists. Source citation placeholders refer to research not supplied in this workspace; verify provider documentation and quotas before deployment.

## Desktop workspace update — 28 October 2026

The preview follows the supplied AI Studio blueprint in [WORKSPACE-UX.md](WORKSPACE-UX.md): neutral dark surfaces, 248/64 px rail, sidebar page finder with no top header row, 36/32 px regular headings, 20 px sections, 14 px reading text, an 880 px centered dashboard with functional URL-backed catalogue search and rounded shortcuts. Catalogue/quotation work remains full-width with inspector and adjacent totals. No external font dependency; intent-based preloading remains. [DESIGN.md](DESIGN.md) records the responsive contract.

These are preview UI changes, not completion of the corresponding production requirements: no authenticated business, persisted products/quotes, public sharing, ingestion, or Tally connection. Performance targets require measurement; accessibility release gates still apply.

**29 October refinement:** route location moved from the header to the bottom-left bar, replacing fixture/save-status copy; Keyboard shortcuts remains only bottom-right, not above the sidebar session. Footer hover/focus matches navigation. Radix Dialog/Tooltip/Tabs now supply accessible interaction primitives, while shared wrappers and tokens preserve the current appearance. This is a foundation for subsequent UI, not an accessibility conformance claim.

## Start here: choose one small ticket

The original **80 RAL requirements below are parent requirements, not individual coding assignments**. Their low-level details remain intact. Day-to-day implementation now uses **271 smaller tickets**, grouped by screen and then by feature in the following files. Shared infrastructure and background processing are explicitly separated from user-facing screens.

| Screen / work area | Feature tickets | Count | Open the detailed checklist |
|---|---|---:|---|
| Shared foundation: local runtime, migrations, tests, deployment | FND-001–014 | 14 | [Foundation](tickets/01-foundation.md) |
| Access and Settings: authentication, onboarding, business, employees | ACC-001–025 | 25 | [Access and Settings](tickets/02-access-and-settings.md) |
| Application shell and Dashboard: navigation, loading, keyboard, cards | SHL-001–014 | 14 | [Shell and Dashboard](tickets/03-shell-and-dashboard.md) |
| Catalogue: My / Global, search, add, product drawer, seller pricing | CAT-001–030 | 30 | [Catalogue](tickets/04-catalogue.md) |
| Quotations: list, IDE tabs, Build, customer, pricing, save, share, PDF | QTE-001–035 | 35 | [Quotation workspace](tickets/05-quotation-workspace.md) |
| Public quotation: customer-safe view, exact-revision approval, proposals | PUB-001–022 | 22 | [Public quotation](tickets/06-public-quotation.md) |
| PDF ingestion: upload, progress, review, commit, history; extraction support | ING-001–040 | 40 | [PDF upload and review](tickets/07-pdf-upload-and-review.md) |
| Admin and relationships: claims, prices, duplicates, suggestions, Add both | ADM-001–028 | 28 | [Admin and relationships](tickets/08-admin-and-relationships.md) |
| Tally: connection, pairing, stock, mapping, billing; bridge support | TAL-001–038 | 38 | [Tally](tickets/09-tally.md) |
| Operations: metrics, release gates, explicitly deferred enhancements | OPS-001–025 | 25 | [Operations and deferred work](tickets/10-operations-and-deferred.md) |

### How to implement and verify one feature

1. Pick **one child ID**, for example `CAT-001`, not an entire file or RAL parent. Read its screen context, linked parent requirements, and [design rules](DESIGN.md).
2. Resolve its **Depends on** list. Set **Status: IN_PROGRESS**, assign an owner, and record the start date. If a necessary environment, decision, or prerequisite is unavailable, use **BLOCKED** and identify the next action.
3. Implement only its **UI**, **API/backend**, and **DB** checklists. “None” means that layer does not change; it is not permission to fabricate an endpoint or migrate future entities. Reuse artifacts already owned by a prerequisite rather than implementing them twice.
4. Execute the ticket's **Verify** steps and relevant regression checks. Capture the route, fixture/setup, action and expected versus actual result for manual checks; record commands and outcomes for automated checks. Label mock/emulator evidence explicitly.
5. Check completed task boxes and record **Evidence**: changed files, migration IDs, test names/results, keyboard checks and screenshots where useful, plus limitations. Mark **DONE** only when this ticket's behavior is verified. Documentation or a fixture preview alone is not a finished production feature.
6. Update the parent's roll-up only when appropriate. A parent is **DONE** only after all mapped children **and the original parent acceptance criteria** pass. Finishing one child never completes an entire screen or parent automatically.
7. Run the file's screen-level integration checklist after its relevant children are done. Each screen should have a demonstrable happy path and error/empty/loading/keyboard behavior, not just independently passing helper tests.

**Example request:** “Implement CAT-001 only, verify its checklist, and update its status and evidence.” Follow with another child ID once that result has been checked.

### Dependency and progress conventions

- Child-ticket metadata in the linked files is the authoritative feature progress record. The original RAL table below is a **parent roll-up**, not a second copy of every child status. Initially all 271 children remain TODO; no existing scaffold has been assumed complete.
- Each file includes parent-to-child mappings. A child may support multiple parents; implement it once and reuse its evidence. Read all children mapped to a parent before changing that parent's status.
- `Parent gate RAL-xxx` means the prerequisite behavior and its acceptance evidence must exist. Use the parent mappings to locate its children. It does **not** mean implementing every ticket in that screen file, or relying on a TODO parent as if it were done.
- Grouping is by screen for discoverability, **not permission to implement all future functionality of a screen upfront**. Follow the source's vertical slices and ticket dependency order: catalogue before ingestion, immutable revisions before customer approval, and stock before mapping before masters before vouchers.
- Local checks do not require production credentials. Deployments, real Workers AI, Windows/Tally checks, and later operational integrations have their own gates; do not let an unrelated external gate block an independently verifiable local feature.
- The operations file identifies **15 deferred child tickets**. They are not v1 blockers and remain TODO until their evidence-based trigger is approved.
- If a child is still too large, split it before implementation into stable suffix IDs such as `CAT-010a` and `CAT-010b`; retain the original as a roll-up, update dependencies/mappings and this index's counts, and preserve every acceptance criterion.

## Original parent requirements and acceptance reference

The following requirements preserve the complete original specification. Use them to constrain the smaller tickets, resolve ambiguity and verify slice completion; do not treat them as new parallel work.

## Tracking and delivery rules

- **80 parent requirements; all initially TODO; owner agent/unassigned on every parent.** Child progress is tracked in the screen files above. The coordinating agent may update foundation parents only after recording actual evidence. Planning, scaffolding, mock success, and a passing local emulator are not production completion.
- Preserve the source's exact vertical-slice order: Foundation → Identity and business → Minimal catalogue → Quotation → Sharing and revision → Explicit PDF generation → PDF ingestion → Review and global evidence → Admin moderation → Relationships → Tally bridge. Operational checkpoints and explicitly deferred complexity follow. Within Tally: fake protocol → real transport/bridge → stock sync → mappings → stock-item creation → sales vouchers.
- A slice delivers its UI, API, scoped migrations, security, and tests together. **Never generate all domain schemas first.** Later entities listed here are inventory, not permission to migrate them early. A slice's integration gate must pass before starting the next slice; dependencies below add more specific prerequisites.
- Deferred tickets remain TODO, with a deferred release designation, not hidden omissions or implied commitments. They require measured demand and an approved decision before implementation. They do not block v1.
- Proposed API paths supplement, rather than silently replace, paths specified in the brief. Finalize proposed contracts in the relevant ticket with request/response fixtures.

### Status definitions

| Status | Meaning | Required update |
|---|---|---|
| TODO | Not started; includes explicitly deferred work | Owner and dependencies present |
| IN_PROGRESS | Named agent is actively implementing | Start date, branch/PR, scope and current evidence |
| BLOCKED | Cannot safely continue | Blocker, decision/credential/environment needed, responsible party, next action |
| DONE | Ticket and inherited criteria verified | Commit/PR, migrations, tests and outcomes, screenshots when applicable, remaining limitations |

Do not mark blocked credential-dependent deployment or unavailable Windows tests DONE. Local foundation can be completed independently of production deployment; track those as separate tickets.

### Parent requirement roll-up

Every row's owner is **agent/unassigned** until explicitly assigned. Parent detail metadata is authoritative for the roll-up; update the row and parent detail together after checking mapped child evidence. Child statuses remain authoritative for individual features.

| ID | Slice / deliverable | Status | Owner |
|---|---|---|---|
| RAL-001 | Foundation: workspace and typed boundaries | DONE | GitHub Copilot |
| RAL-002 | Foundation: Docker local Cloudflare runtime | DONE | GitHub Copilot |
| RAL-003 | Foundation: shell and health | DONE | GitHub Copilot |
| RAL-004 | Foundation: environment and migration isolation | TODO | agent/unassigned |
| RAL-005 | Foundation: automated checks and local gate | TODO | agent/unassigned |
| RAL-006 | Foundation: credential-gated deployment | TODO | agent/unassigned |
| RAL-007 | Identity: library-backed authentication | TODO | agent/unassigned |
| RAL-008 | Identity: business membership authorization | TODO | agent/unassigned |
| RAL-009 | Identity: business settings | TODO | agent/unassigned |
| RAL-010 | Identity: employees and invitations | TODO | agent/unassigned |
| RAL-011 | Identity: security and slice gate | TODO | agent/unassigned |
| RAL-012 | Catalogue: approved identities and history | TODO | agent/unassigned |
| RAL-013 | Catalogue: seller overlay and local display | TODO | agent/unassigned |
| RAL-014 | Catalogue: indexed scoped search | TODO | agent/unassigned |
| RAL-015 | Catalogue: My / Global screen | TODO | agent/unassigned |
| RAL-016 | Catalogue: add pricing sheet | TODO | agent/unassigned |
| RAL-017 | Catalogue: drawer and price adoption | TODO | agent/unassigned |
| RAL-018 | Catalogue: dashboard attention cards | TODO | agent/unassigned |
| RAL-019 | Catalogue: fixtures and slice gate | TODO | agent/unassigned |
| RAL-020 | Quotation: customers and quote identity | TODO | agent/unassigned |
| RAL-021 | Quotation: working draft and immutable snapshots | TODO | agent/unassigned |
| RAL-022 | Quotation: deterministic pricing | TODO | agent/unassigned |
| RAL-023 | Quotation: Build workspace and tabs | TODO | agent/unassigned |
| RAL-024 | Quotation: seller search and add flow | TODO | agent/unassigned |
| RAL-025 | Quotation: line editing and autosave | TODO | agent/unassigned |
| RAL-026 | Quotation: list, history and lifecycle | TODO | agent/unassigned |
| RAL-027 | Quotation: immutable pricing slice gate | TODO | agent/unassigned |
| RAL-028 | Sharing: token capabilities | TODO | agent/unassigned |
| RAL-029 | Sharing: revision-pinned WhatsApp action | TODO | agent/unassigned |
| RAL-030 | Sharing: customer-safe public quote | TODO | agent/unassigned |
| RAL-031 | Sharing: exact-revision approval | TODO | agent/unassigned |
| RAL-032 | Sharing: re-edit, expiry and void | TODO | agent/unassigned |
| RAL-033 | Sharing: customer quantity/removal proposals | TODO | agent/unassigned |
| RAL-034 | Sharing: seller proposal decisions | TODO | agent/unassigned |
| RAL-035 | Sharing: adversarial slice gate | TODO | agent/unassigned |
| RAL-036 | PDF: explicit browser document rendering | TODO | agent/unassigned |
| RAL-037 | PDF: optional private document persistence | TODO | agent/unassigned |
| RAL-038 | PDF: explicit-only slice gate | TODO | agent/unassigned |
| RAL-039 | Ingestion: source and run migrations | TODO | agent/unassigned |
| RAL-040 | Ingestion: private direct upload | TODO | agent/unassigned |
| RAL-041 | Ingestion: durable workflow and progress | TODO | agent/unassigned |
| RAL-042 | Ingestion: hash reuse and durable extraction claims | TODO | agent/unassigned |
| RAL-043 | Ingestion: extractor contracts and opt-in mock | TODO | agent/unassigned |
| RAL-044 | Ingestion: real Cloudflare extraction | TODO | agent/unassigned |
| RAL-045 | Ingestion: conservative row matching | TODO | agent/unassigned |
| RAL-046 | Ingestion: history, retries and source viewer | TODO | agent/unassigned |
| RAL-047 | Ingestion: fixture and restart gate | TODO | agent/unassigned |
| RAL-048 | Review: decision-focused staged table | TODO | agent/unassigned |
| RAL-049 | Review: edits and durable save-for-later | TODO | agent/unassigned |
| RAL-050 | Review: idempotent seller-and-claims commit | TODO | agent/unassigned |
| RAL-051 | Review: evidence aggregation and provenance | TODO | agent/unassigned |
| RAL-052 | Review: immediate seller-value slice gate | TODO | agent/unassigned |
| RAL-053 | Admin: exception queues and product claims | TODO | agent/unassigned |
| RAL-054 | Admin: append-only price publication | TODO | agent/unassigned |
| RAL-055 | Admin: non-destructive duplicate merge | TODO | agent/unassigned |
| RAL-056 | Admin: audited decisions and relationship seam | TODO | agent/unassigned |
| RAL-057 | Admin: moderation slice gate | TODO | agent/unassigned |
| RAL-058 | Relationships: seller proposals and local use | TODO | agent/unassigned |
| RAL-059 | Relationships: global publication | TODO | agent/unassigned |
| RAL-060 | Relationships: explicit Add both and slice gate | TODO | agent/unassigned |
| RAL-061 | Tally: versioned fake protocol and jobs | TODO | agent/unassigned |
| RAL-062 | Tally: owner pairing and revocation | TODO | agent/unassigned |
| RAL-063 | Tally: Durable Object WSS transport | TODO | agent/unassigned |
| RAL-064 | Tally: real Windows service and local ledger | TODO | agent/unassigned |
| RAL-065 | Tally: initial and periodic stock sync | TODO | agent/unassigned |
| RAL-066 | Tally: persistent confirmed mappings | TODO | agent/unassigned |
| RAL-067 | Tally: explicit stock-item creation | TODO | agent/unassigned |
| RAL-068 | Tally: billing preflight and tax context | TODO | agent/unassigned |
| RAL-069 | Tally: voucher creation and result parsing | TODO | agent/unassigned |
| RAL-070 | Tally: uncertain outcome reconciliation | TODO | agent/unassigned |
| RAL-071 | Tally: connection and job operations UI | TODO | agent/unassigned |
| RAL-072 | Tally: real accounting boundary gate | TODO | agent/unassigned |
| RAL-073 | Operations: metrics and internal page | TODO | agent/unassigned |
| RAL-074 | Operations: budgets, recovery and runbooks | TODO | agent/unassigned |
| RAL-075 | Operations: release and end-to-end gate | TODO | agent/unassigned |
| RAL-076 | Deferred: public catalogue additions / OTP / auto-bill | TODO | agent/unassigned |
| RAL-077 | Deferred: offline / search / ontology / voice | TODO | agent/unassigned |
| RAL-078 | Deferred: extraction fallback / OCI / Temporal | TODO | agent/unassigned |
| RAL-079 | Deferred: fan-out / assisted moderation / alias promotion | TODO | agent/unassigned |
| RAL-080 | Deferred: bridge fleet / MCP / optional vouchers | TODO | agent/unassigned |

## Binding implementation contracts

The following requirements apply to **every ticket**, in addition to its specific acceptance checks. A ticket must explicitly record not-applicable items rather than omit review.

### Architecture and scope

React + TypeScript + Vite, one Worker serving API and Workers Static Assets, D1 with Drizzle or thin typed SQL, Zod-style validation, Vitest and Playwright. D1 FTS5 plus B-tree SKU lookup; private R2 for original PDFs, extraction artifacts and optionally generated documents; Workflows for ingestion; Durable Objects for later Tally WSS. No initial Queue, always-on processing server, SQLite-Wasm replica, vector engine, ontology or Compare quotation mode. No Redis, Kubernetes, production Docker, microservices, Kafka, GraphQL, CQRS or hypothetical database-repository abstraction. Do not select Vercel Hobby for a commercial deployment; Vercel Pro and OCI are later evidence-driven alternatives, not prerequisites.

Local Docker is a development convenience required by this backlog, not a production topology change. Local web/API must actually use emulated D1/R2/Workflow/DO bindings; emulator smoke tests do not constitute implemented ingestion or bridge features. Real AI calls and Windows/Tally are separate integration gates. Mock extraction and fake Tally must require explicit opt-in, be visibly labeled, and never silently replace unavailable real services or be enabled in production.

### Security, requests and persistence

- Owner and Employee are the only business roles; Customer has a token, not an account; Platform Admin is a separate platform flag. Owner manages business/employees/integration settings; both operational roles manage catalogue/quotes/mappings. No Manager/Salesperson/Reviewer role.
- Resolve business scope from authenticated membership, never from a body/query `business_id`. Validate resource ownership through every join, nested ID, object download and job result. Platform moderation privilege does not implicitly grant arbitrary seller cost access. Global reads expose only published facts.
- Use HTTPS, library-managed password/session cryptography, secure HttpOnly cookies, appropriate SameSite, session expiry/revocation, CSRF/origin protection for cookie mutations, narrow CORS, parameterized SQL, escaped FTS input, schema validation and bounded request/page/file sizes. Rate-limit authentication, public actions, upload/extraction, pairing and billing. Never log passwords, tokens, signed URLs, full documents, customer PII or device credentials.
- Contract errors use stable `code`, safe `message`, optional field errors and request ID; consistently distinguish unauthenticated, forbidden/not-found, validation, conflict/stale revision, retryable service failure. Public missing/revoked/expired capability responses must not enumerate quotes or businesses. Cursor pagination is bounded and deterministic.
- Mutations with external side effects or retryable commits accept a scoped idempotency key and canonical payload hash. Persist operation state/result; same key/same payload returns the prior result, changed payload conflicts. A process-local lock, workflow step name, socket delivery or HTTP 200 is not a durable execution claim.
- Add migrations in the owning slice only. Use foreign keys, scoped unique indexes, enum/check constraints, nonnegative money/quantity validation and UTC timestamps; record integer paise and explicit percentage/quantity precision. Application authorization and composite tenant checks supplement SQL constraints. D1 batches are atomic within a bounded batch, not a license to invent unsupported long transactions. Test concurrency and partial external effects.
- Mutations with commercial/security consequences append actor, timestamp, entity, action, revision/version, request ID and provenance audit records. Preserve source evidence, old prices, old revisions and original identifiers; retention/redaction is an explicit operational policy, not destructive cascade deletion.

### UI and accessibility contract

Every interactive ticket must implement loading/skeleton, empty, ready, validation, saving/pending, success, recoverable failure and permission/expired states as relevant. No silent loss of changes. Native semantics, visible focus, labels, accessible errors, status announcements, keyboard Tab/Shift-Tab and Enter/Space activation are mandatory. Drawers/dialogs trap focus, Escape closes only with unsaved-change protection, and closing restores trigger focus. Tabs support arrow navigation and correct tab semantics; grids preserve predictable editing order and do not hijack typing shortcuts. Destructive and accounting actions have explicit confirmation. Desktop is the primary seller workspace; customer quotes work on mobile, and seller narrow layouts remain usable. Cost/profit are seller-only in actual data contracts, not merely hidden via CSS. Screens without a current service show unavailable/not-connected, never fabricated success or zero measurements. Backend-only tickets state UI/keyboard N/A and expose safe diagnostics through their consuming screen.

### Test and evidence contract

Each ticket needs relevant unit/contract tests, local D1/R2/Workflow/DO integration tests, role/tenant negative tests, and Playwright coverage for its user path. Validate real FTS against D1, not a mock search engine. Migration replay into an empty database plus upgrade from the previous slice is required. Test retry, concurrent edits and failure states where applicable. Record executed commands, environment, commit, test totals/outcomes and screenshots/traces. Do not substitute JSON validity for extraction accuracy or fake Tally acknowledgements for real accounting evidence. Never claim tests were run in this documentation-only task.

## Specification gaps and explicit decisions

These are proposed implementation decisions, not unstated requirements from the source. Confirm them in the owning ticket before irreversible production use.

| Gap / tension | Proposed contract and decision gate | Owning tickets |
|---|---|---|
| Approved-only global identities versus immediate new seller products | Permit `PROVISIONAL` identities hidden from global/public search, anchored to originating business claims. An exact identity is not proof of public approval. Seller-private corrected brand/SKU/name/description live in overlay snapshot fields; do not overwrite approved global text. Merge/publish later redirects identity without rewriting quote history. Resolve cross-business provisional collisions without revealing submissions. | RAL-012, RAL-013, RAL-045, RAL-050, RAL-055 |
| Immutable revisions versus half-second autosave | Mutable versioned working draft and draft lines are separate from append-only `quote_revisions`/`quote_lines`. Share, explicit snapshot/PDF or approved-change acceptance freezes a revision transactionally; autosave edits only the draft with optimistic concurrency. Approval never refers to a mutable draft. | RAL-021, RAL-025, RAL-029, RAL-031 |
| Deterministic revision hash | Versioned canonical serialization of customer-facing identity/customer/seller snapshots, ordered lines, quantities, paise prices, discounts, totals, currency and disclosed tax/terms context; exclude cost/profit and volatile audit timestamps. Freeze hash input and store it. | RAL-021, RAL-022, RAL-031 |
| Hash-only token storage versus reusing a share URL | Generate high-entropy opaque tokens, store only hash and metadata. A server cannot reconstruct a random token from its hash. Return plaintext once; a browser may resubmit a held token for hash verification/reuse. If unavailable, explicitly generate a new capability, explaining revoke/keep policy; no secret-recovery endpoint. Default capability pins one revision; old links remain historical/read-only after replacement and cannot approve a different revision. Retry recovery may require token rotation, not plaintext persistence. | RAL-028, RAL-029, RAL-032 |
| Exact SKU example uses `079n`, a suffix | Exact means normalized **full** brand/SKU equality. `079n` is a ranked suffix/segment search hit for `ALD-CHR-079N`, not an exact identity match. Build explicit searchable SKU segments; normalized exact lookup outranks suffix/name results. Suffix matches never auto-link ingestion or accounting items. | RAL-014, RAL-045, RAL-066 |
| Seller default discount and manually overridden quote price | Distinguish derived-price mode from explicit-price mode, define which value wins, and snapshot both displayed discount and agreed rate consistently. Specify paise/rupee presentation, precision and rounding once; do not infer missing cost as zero. | RAL-013, RAL-022 |
| Price effective dates and global latest pointer | Optional document date remains unknown, not invented. Define latest effective approved version, future-dated behavior, same-date conflicts and explicit seller override clearing. Approval chronology alone must not silently activate a future price. | RAL-012, RAL-017, RAL-054 |
| Tax context unspecified; Tally owns tax engine | Before real billing, agree INR, inclusive/exclusive interpretation, customer ledger/address/GST details where needed, place of supply, units, discounts, rounding and configured voucher/tax ledgers. Display tax assumptions on quote; reconcile Tally-computed totals. Do not invent GST calculations or import an under-specified voucher. | RAL-022, RAL-068, RAL-069 |
| Durable extraction/commit claims and idempotency | Unique content/version extraction reservation with durable lease/attempt/fencing; retryable staging keys; separate submission per business. Commit key binds review version/selection/hash; unique claim fingerprints and bounded atomic seller+claim writes prevent duplicates. D1 is authority, not Workflow retention or a Queue. | RAL-042, RAL-050, RAL-061, RAL-070 |
| Crash after Tally accepts, before ledger/ACK persists | Persist before-send intent and an external correlation key if supported. Reconcile Tally voucher identity before resend. If uniqueness/query capability cannot establish outcome, mark `UNCERTAIN`, block automatic replay and require audited reconciliation. Never promise exactly-once delivery. | RAL-064, RAL-069, RAL-070 |
| Limits and policy not specified | Select tested file/page/row limits, invitation/token TTLs, draft conflict rules, expiry/retention, polling/backoff, stock interval, shortage override policy and budget warning thresholds. Record rationale and environment configuration; these are not hardcoded facts from the brief. | RAL-010, RAL-028, RAL-040, RAL-065, RAL-068, RAL-074 |
| Relationship naming/direction and merge conflicts | Standardize `product_relationship_candidates` / `product_relationships` despite abbreviated names later in source. Required/common relations are directed unless confirmed otherwise; canonicalize symmetric alternatives. Disallow self-edges, detect cycles and reconcile seller overlay/mapping collisions explicitly. | RAL-055, RAL-058, RAL-059 |

## 1. Foundation slice — deploy one empty Rallie

### RAL-001 — Establish the typed monorepo and architectural boundaries
- **Status:** DONE; **Owner:** GitHub Copilot; **Dependencies:** none. Started and verified 2026-10-29; uncommitted working tree based on 8cc8a1b, no new commit/PR. Scope: FND-001–003 only.
- **Scope:** React/TypeScript/Vite web with app/components/features/lib; Worker API, packages for domain, DB and API contracts; migrations and Wrangler configuration. Reserve bridge and tally-protocol packages for their later slice. Pick Drizzle or thin typed SQL and Zod-style validation; no speculative infrastructure.
- **UI / keyboard:** Minimal accessible landing/loading/error surface; keyboard navigation works before adding domain screens.
- **API / security:** Define typed `/health` contract and safe error envelope; keep secrets and server bindings out of browser bundles.
- **DB / migrations:** Establish migration runner/version tracking only; no catalogue, quote or Tally tables yet.
- **Acceptance:** [x] Typecheck/build contracts and web/Worker boundaries. [x] Production build contains no credentials. [x] Directory layout and architectural exclusions are documented in implementation evidence.
- **Evidence / notes:** [RAL-001 evidence and applicability review](FOUNDATION.md); all mapped children FND-001–003 verified. `npm ci`, separate package/tool typechecks, 65 unit/contract tests, web build + Worker dry-run and browser credential/server-marker audit passed; 1 real D1 emulator replay/repeat/upgrade integration passed; all 15 Playwright tests passed against built assets + Worker/D1; audit reported 0 vulnerabilities. Thin typed SQL + Zod selected. No secrets supplied or source maps emitted; bundle signature scanning is not a general credential-proof mechanism. Migration unchanged: `0001_foundation.sql` only. No Docker/R2/Workflow/DO/deployment completion or authenticated domain functionality is claimed; later parents remain TODO. Commit/PR absent explicitly, changes remain in the working tree.

### RAL-002 — Make local web/API runnable in Docker with Cloudflare emulation
- **Status:** DONE; **Owner:** GitHub Copilot; **Dependencies:** RAL-001. Started/verified 2026-10-30; uncommitted working tree based on 37d4d29, no new commit/PR. Scope FND-004–007 only.
- **Scope:** Reproducible development container(s) for web/API, persistent local Wrangler/Miniflare-compatible D1/R2/Workflow/DO state, health probes and reset procedure. Docker is local only; production stays Cloudflare. Do not replace bindings with unrelated SQLite/file/in-memory fakes.
- **UI / keyboard:** Environment indicator and explicit unavailable-service message; mock badges are readable by assistive technology.
- **API / security:** Local bindings smoke path uses isolated development configuration. Mock extraction and mock Tally are **off by default**, require explicit independent opt-ins, and cannot use live credentials. Stub interfaces only here; no claim of real AI or Windows service support.
- **DB / migrations:** Persistent dev volume and repeatable foundation migration replay; production resources inaccessible from default local setup.
- **Acceptance:** [x] Clean machine starts web/API with health passing. [x] D1/R2 persist across restart; Workflow and DO smoke tests execute locally. [x] Default mode never silently mocks service failures.
- **Evidence / notes:** [RAL-002 setup, executed checks and limits](LOCAL-RUNTIME.md); all mapped children FND-004–007 verified. Clean Linux image-layer install and healthy Docker web/Worker startup; real D1/R2 fixture retention across restart, completed local Workflow and persisted DO request, removed Workflow/DO binding failures, independent default-off flags and test-volume reset/replay passed via `npm run test:runtime`. 96 unit/contract tests, 17 Docker-backed Playwright tests, real D1 migration replay/upgrade, package typechecks and web/production Worker dry-run/audits passed. Actual manual Docker outage showed unavailable (no fallback); independent stub labels observed. Docker CLI 29.4.1/Engine 29.2.1, Compose 5.1.3, container Node 22.23.4, Wrangler 4.154.0 on macOS/Colima arm64. No new domain migration or real extraction/Tally; smoke handlers excluded from production entrypoint. Source snapshots require rebuild. Full staging/production isolation, deployment and real integrations remain separate gates.

### RAL-003 — Deliver application shell and health endpoint
- **Status:** DONE; **Owner:** GitHub Copilot; **Dependencies:** RAL-001, RAL-002. Started 2026-10-30 and verified this session; uncommitted working tree based on fb34baf, no new commit/PR. Scope: FND-009 and foundation acceptance of SHL-001–007, SHL-009–010; no identity or domain functionality. Real session/staging extensions remain their later parent gates.
- **Scope:** Left navigation Dashboard, Catalogue, Quotations, Tally, Settings; Admin later gated by platform claim. No charts, Compare mode or extra role-specific app. Feature placeholders are honest and non-actionable.
- **UI / keyboard:** Skip link, landmark navigation, active-route state, route loading/error boundary, narrow-layout navigation, visible keyboard focus. Owner-only controls are not yet represented as working features.
- **API / security:** `GET /health` returns minimal service/build/readiness status without secrets, resource IDs or diagnostic stack traces. Define shallow liveness versus dependency readiness for local checks.
- **DB / migrations:** No domain migration; health uses only safe minimal binding checks.
- **Acceptance:** [x] SPA deep links work with Worker routing and API errors are not served HTML. [x] Health is machine-readable. [x] Keyboard-only route navigation and responsive shell pass.
- **Evidence / notes:** [Shell/health evidence and manual validation](SHELL-HEALTH.md): 100 unit/contract tests, 27 built-asset Docker Worker browser tests, 12 repeated focus/recovery checks, real D1 replay/repeat/upgrade, isolated four-binding runtime verification, typechecks/build/audits and diff checks passed. Route-local chunk/render errors preserve the shell and retry without full reload; mobile drawer/focus, Save-Data, cold-start timeout/retry, editable/IME-safe shortcuts and shared runtime/readiness status verified. Actual API stop/restart showed unavailable then recovered without mock fallback. No migration changes; existing safe health implementation reused. 320px drawer screenshot and desktop/narrow browser inspection recorded. Build warnings/initial chunk size, physical zoom/screen-reader certification, real session/staging/deployment and persisted domain work remain explicit limitations; RAL-004–006 are not completed by this evidence.

### RAL-004 — Separate dev, staging and production resources and migrations
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-002, RAL-003.
- **Scope:** Distinct bindings, origins and secrets for dev/staging/prod; migration conventions, deterministic seeds only in test/dev and explicit resource provisioning checklist.
- **UI / keyboard:** Nonproduction banner; no UI-specific keyboard behavior beyond shell. Diagnostics must distinguish unprovisioned from unhealthy.
- **API / security:** Environment-specific CORS/origin allowlists; production fails closed for missing bindings or mock flags. Avoid exposing account IDs/credentials in public health data.
- **DB / migrations:** Empty replay and forward upgrade strategy; prohibit accidental production seeds, destructive reset and cross-environment bucket/database reuse. Document backup/restore prerequisite before destructive changes.
- **Acceptance:** [ ] Binding tests prove isolation. [ ] Empty local D1 replay succeeds twice safely. [ ] Missing credentials produce actionable non-secret setup status, not an attempted deployment.
- **Evidence / notes:** _Pending: environment matrix, migration output, resource IDs stored securely outside evidence._

### RAL-005 — Establish CI checks and the runnable local foundation gate
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-003, RAL-004.
- **Scope:** Lockfile-backed install, lint/typecheck, Vitest, production build, D1 migration replay and Playwright shell/health smoke in CI. Container reproducibility is tested separately from Cloudflare deployment.
- **UI / keyboard:** Playwright asserts shell focus/navigation, error boundary and loading state, not just screenshot existence.
- **API / security:** Contract tests exercise health/error routes; secret scanning and safe fixture credentials. Untrusted PRs receive no deployment secrets.
- **DB / migrations:** CI starts isolated empty local D1 and applies only migrations currently owned by delivered slices.
- **Acceptance:** [ ] Clean-checkout automated checks pass. [ ] Docker local web/API and all four emulated bindings are exercised. [ ] CI clearly reports tests versus skipped live integrations. [ ] No foundation ticket is marked DONE merely because files exist.
- **Evidence / notes:** _Pending: CI run, commands/results, browser trace._

### RAL-006 — Gate main-branch deployment on provisioning and credentials
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-004, RAL-005.
- **Scope:** After checks, main deploys the React assets + Worker as one unit to configured environments. Provision D1/R2/Workflow/DO bindings and required credentials first; use protected environment approval for production and migration ordering/rollback runbook.
- **UI / keyboard:** Deployed shell and health smoke; keyboard behavior identical to local. Deployment status distinguishes skipped-unprovisioned, failed and successful.
- **API / security:** Least-privilege deploy token, trusted branch only, secret store, no forks/secrets leakage. **Absent credentials/resources must gate/skip deploy explicitly, never fake success or repeatedly attempt unauthenticated deploy.**
- **DB / migrations:** Apply the intended environment's migrations with recorded version before traffic uses new schema; preserve recovery point.
- **Acceptance:** [ ] Provisioned main commit deploys and health passes. [ ] Unprovisioned CI still validates build/tests and reports deploy blocked/skipped. [ ] Production mock configuration is rejected.
- **Evidence / notes:** _Pending: live URL, deployment/migration IDs, gating test; BLOCKED when live access is unavailable._

## 2. Identity and business slice

### RAL-007 — Add library-backed authentication and sessions
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-005; deployment tracked separately in RAL-006.
- **Scope:** Choose a maintained SQLite-compatible auth library, such as Better Auth with Drizzle, and implement sign-in/out/session lifecycle; no custom password cryptography. Verify Worker runtime compatibility.
- **UI / keyboard:** Labeled email/password form, submit by Enter, pending/error/retry, accessible validation and return-to-safe-route behavior. Session expiry preserves only safe unsaved-work warnings.
- **API / security:** Library auth routes plus proposed `GET /api/session`; rate limits, secure cookie flags, origin/CSRF checks, generic login errors and session revocation. No arbitrary return URL redirects.
- **DB / migrations:** `users(id,name,email)` and library-required session/account tables with normalized unique identity constraints and expiry indexes; platform-admin flag not user-editable.
- **Acceptance:** [ ] Login/logout/expiry work. [ ] Invalid credentials and replayed revoked sessions fail. [ ] Cookie/CSRF tests pass in Worker-compatible runtime.
- **Evidence / notes:** _Pending: library/version decision, migrations, auth test results._

### RAL-008 — Enforce business membership on every operational access
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-007.
- **Scope:** Business creation/bootstrap and active authenticated membership context. Only OWNER/EMPLOYEE; Platform Admin remains orthogonal. Define safe owner bootstrap and prohibit self-granted admin status.
- **UI / keyboard:** Business context shown in shell; no-business and removed-membership states route to accessible recovery, not an empty operational UI.
- **API / security:** Proposed `POST /api/businesses` and membership resolver; nested resource guards always derive authorized business from session. Ignore/reject unauthorized client `business_id` and verify cross-entity tenant consistency.
- **DB / migrations:** `businesses(id,name,phone,address)`; `business_memberships` unique `(business_id,user_id)`, role checks, FKs; audit membership changes. Preserve at least one Owner under concurrent changes.
- **Acceptance:** [ ] Owner/Employee policy matrix passes. [ ] Forged business IDs cannot change scope. [ ] Admin flag cannot be created through business/member payloads.
- **Evidence / notes:** _Pending: policy fixtures, SQL constraints, tenant tests._

### RAL-009 — Build Settings → Business
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-008.
- **Scope:** Owner edits business name, phone and address; Employee sees safe business details but no owner mutation controls. Preserve seller details for later quotation snapshots.
- **UI / keyboard:** Load/edit/dirty/saving/saved/error states; validation next to fields, save by keyboard, dirty-navigation confirmation and restored focus.
- **API / security:** Proposed `GET/PATCH /api/settings/business` with version and validated name/phone/address; owner authorization server-side even if controls hidden. Audit old/new business values without unsafe logs.
- **DB / migrations:** Add business update version/timestamp only as needed; conditional update prevents lost edits. No quote tables until quotation slice.
- **Acceptance:** [ ] Owner changes persist after reload. [ ] Employee direct PATCH fails. [ ] Stale concurrent update reports conflict and retains entered values. [ ] Invalid phone/address limits fail predictably.
- **Evidence / notes:** _Pending: UI trace, contracts, authorization tests._

### RAL-010 — Build Settings → Employees and secure invitations
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-008, RAL-009.
- **Scope:** Owner invites/removes Employees and views membership/invite status. Employee cannot invite, remove or promote Owner; additional role granularity is out of scope.
- **UI / keyboard:** Employee list empty/loading/error, invitation form, pending/expired/revoked invitation states and removal confirmation with focus restoration. Accessible copy-link flow if email delivery is not provisioned; do not claim email was sent.
- **API / security:** Proposed invitation create/accept/revoke and member removal routes. Single-use hashed invitation token, bounded TTL, email binding, rate limit, owner checks and audited revocation; no privilege fields accepted from invitee.
- **DB / migrations:** Invitation hash unique, business/email/role/expiry/consumed timestamps; membership uniqueness. Repeated acceptance is harmless and revoked membership invalidates effective access.
- **Acceptance:** [ ] Expired/replayed/cross-business invites fail safely. [ ] Employee cannot remove Owner. [ ] Duplicate acceptance creates one membership.
- **Evidence / notes:** _Pending: invitation TTL/delivery decision, tests, audit samples._

### RAL-011 — Close the identity slice with authorization regressions
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-007–RAL-010.
- **Scope:** Reusable two-business fixture and route-policy harness, owner/admin separation, session revocation and secure onboarding review. Extend this harness in each later slice.
- **UI / keyboard:** Test role-gated navigation, signed-out transition, expired sessions and forbidden pages by keyboard; hidden controls alone never satisfy authorization.
- **API / security:** Negative tests for forged membership, URL IDs, body IDs, pagination cursors, CSRF and over-posted roles. Add catalogue/quote IDOR tests as those routes arrive; placeholders are not passing domain tests.
- **DB / migrations:** Replay identity migrations and test unique memberships, role checks and last-owner protection. No advance domain schema.
- **Acceptance:** [ ] Owner/Employee/Platform Admin matrix recorded. [ ] Two-business scope resolver tests pass now. [ ] Later catalogue/quote negative-test obligations linked to RAL-019/RAL-027. [ ] No credential or token in test artifacts.
- **Evidence / notes:** _Pending: security matrix, test suite and residual risks._

## 3. Minimal catalogue slice

### RAL-012 — Introduce minimal approved identities and append-only prices
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-011.
- **Scope:** Brand, SKU/model, name, description, optional approved aliases and per-product MRP history only. Seed a few realistic test products; no ontology or manufacturer-PDF-as-version model.
- **UI / keyboard:** Identity/status labels consumed by catalogue; provisional items never appear as approved global results. No standalone maintenance screen required.
- **API / security:** Read DTOs expose only approved records globally; no general seller write to canonical fields or price history. Finalize provisional identity and effective-date decisions before ingestion builds upon them.
- **DB / migrations:** `brands` normalized uniqueness; `global_products` display/normalized SKU, brand FK, status and merge target; unique active identity policy; `product_price_versions` immutable paise price/effective date/approved provenance and latest pointer. Add claim FK later, not dangling references now.
- **Acceptance:** [ ] Normalization variants identify the same approved product. [ ] Two similar SKUs remain distinct. [ ] Old price rows cannot be overwritten by ordinary commands. [ ] Migration/seed replay works.
- **Evidence / notes:** _Pending: normalization and future-price ADR, schema tests._

### RAL-013 — Implement tenant-private seller pricing and display overrides
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-012.
- **Scope:** Seller overlay: active global price version, optional MRP override, optional cost, default discount, default quote price, carried flag, aliases and local display corrections. Seller data never changes global truth.
- **UI / keyboard:** Pricing controls show derived versus explicit price, unknown cost/profit, validation and dirty/save states; local text overrides visibly identified when appropriate.
- **API / security:** `PATCH /api/catalogue/seller-products/:id` validates scoped ownership, update version, money/discount and allowed fields; owner/employee permitted. Public/global DTOs never include another seller's costs or aliases.
- **DB / migrations:** `seller_products` unique business/product with timestamps/version; scoped `seller_product_aliases`; price-version FK must belong to same product. Add private display override fields to support edited names immediately after later review.
- **Acceptance:** [ ] Cost/discount edits leave global rows unchanged. [ ] Missing cost stays null, not zero. [ ] Concurrent updates conflict safely. [ ] Alias/display overrides are isolated between businesses.
- **Evidence / notes:** _Pending: pricing precedence decision, migrations, negative tests._

### RAL-014 — Build real D1 FTS5 with exact-code and scoped ranking
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-012, RAL-013.
- **Scope:** Index brand, SKU, product name/description, approved aliases and tenant-local aliases. Rank full exact normalized SKU first, seller alias exact/prefix, name, brand+name, description, broad alias. Explicit SKU segments support `079n` without calling it a full exact match.
- **UI / keyboard:** Search loading/no-match/error, highlighted match reason and stable result selection; Enter selects focused result, not a hidden default action.
- **API / security:** Catalogue `q,cursor` contracts and seller-only quote-search seam; bound query length/page size, escape FTS syntax and enforce tenant filters before returning private matches.
- **DB / migrations:** B-tree normalized SKU index plus FTS5 and transactional maintenance/rebuild path. Private alias index/query strategy must not leak cross-business terms.
- **Acceptance:** [ ] D1 tests rank full SKU first. [ ] `079n`, `079 body`, `jaquar kubix diverter` work. [ ] Punctuation/injection/empty queries are safe. [ ] Suffix matches never imply identity equality.
- **Evidence / notes:** _Pending: D1 query plans, rank fixtures, latency baseline._

### RAL-015 — Deliver My Catalogue and Global Catalogue tabs
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-014.
- **Scope:** Header tabs, search and future New PDF update entry; seller cards show active/latest MRP, cost, default quote, carried state and newer-price cue; global cards show global MRP and Already in your catalogue/Add action.
- **UI / keyboard:** Accessible tabs, search and cursor pagination, empty catalogue guidance, loading/retry, permission and price-update states. New PDF entry remains clearly unavailable until ingestion; no dead working-looking button.
- **API / security:** `GET /api/catalogue/mine?q=&cursor=` and `/global`; server computes seller membership and latest-price context. Global responses contain no seller cost.
- **DB / migrations:** Use scoped joins/indexes from RAL-012–014; add measured pagination index only, not future schema.
- **Acceptance:** [ ] Tabs clearly distinguish shared knowledge and store pricing. [ ] Pagination/search preserve scope. [ ] Business B cannot obtain Business A pricing by ID/query/cursor. [ ] Keyboard works through cards and tabs.
- **Evidence / notes:** _Pending: UI screenshots, contract and browser tests._

### RAL-016 — Add global products through a small pricing sheet
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-015.
- **Scope:** Add to my catalogue opens a sheet, not a separate page; global MRP, optional cost, default customer discount and computed default quote price, Cancel/Add. Unknown cost does not block adoption.
- **UI / keyboard:** Focus first editable field, Enter submits validated form, Escape cancels safely, pending prevents duplicate submission and completion restores card focus. Duplicate/already-added state remains actionable.
- **API / security:** `POST /api/catalogue/products/:productId/add` with validated commercial fields and idempotency key; derive business, require approved accessible identity, return existing overlay on equivalent retry.
- **DB / migrations:** Unique business/product makes races harmless; atomically initialize selected approved price reference and audit. No global updates.
- **Acceptance:** [ ] Costless add succeeds and profit remains unknown. [ ] Concurrent/retried Add creates one seller product. [ ] Invalid discount and inaccessible product fail. [ ] Defaults calculate in integer money.
- **Evidence / notes:** _Pending: sheet trace, race test, persisted overlay._

### RAL-017 — Build product drawer and explicit price-version adoption
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-015, RAL-016.
- **Scope:** Large context-preserving drawer with brand/SKU/description, seller pricing, append-only timeline, YOUR ACTIVE PRICE/LATEST GLOBAL labels and Use price action. Relationship section is a labeled placeholder until its slice.
- **UI / keyboard:** Focus-trapped drawer, close restores prior catalogue/search position; price switching has pending/error/conflict feedback and displays override implications before confirming.
- **API / security:** `GET /api/catalogue/products/:id`, seller PATCH, and `POST /api/catalogue/seller-products/:id/use-price-version` with version ID and expected overlay version. Validate approved target belongs to same product; audit actor.
- **DB / migrations:** Atomic D1 batch updates overlay and audit; explicitly clear/retain seller override per confirmed request. Never update old quote snapshots or historical prices.
- **Acceptance:** [ ] ₹5,000 active stays until seller chooses ₹6,000. [ ] Wrong-product price ID is rejected. [ ] Failure rolls back overlay and audit together. [ ] Drawer keyboard flow preserves work.
- **Evidence / notes:** _Pending: price policy, batch rollback test, screenshots._

### RAL-018 — Surface attention through the four-card dashboard
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-017.
- **Scope:** Compact Catalogue newer-price count, Quotations open/approved counts, PDF processing review count and Tally company/connection/last-sync card. No charts; extend backing queries only as later tables arrive.
- **UI / keyboard:** Review updates/Open quotations/Continue review navigation, initial/loading/empty/retry states and honest unavailable or not-connected modules. Owner/Employee share operational cards; owner-only settings remain gated.
- **API / security:** `GET /api/dashboard` returns preaggregated scoped counts; never fetch thousands of rows to count in browser. Unsupported modules return explicit availability metadata rather than invented counts.
- **DB / migrations:** Catalogue drift compares latest approved and active version; later scoped queries use quotes, extraction runs and connections in their own slices. Add covering indexes based on explain plans.
- **Acceptance:** [ ] Seller drift count matches underlying overlays. [ ] No cross-business counts. [ ] Modules become live as their slices land. [ ] Every card is keyboard reachable and conveys freshness.
- **Evidence / notes:** _Pending: aggregate tests, API payload, future module integration links._

### RAL-019 — Prove the minimal catalogue before ingestion work
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-012–RAL-018.
- **Scope:** Seed Jaquar ALD-CHR-079N and KUP-CHR-35079NKPM, Cera F1013101 and similar distinct SKUs, varied price history and two businesses. Complete the source's minimal catalogue gate before any PDF schema.
- **UI / keyboard:** End-to-end search → drawer → pricing sheet → seller edit → adopt price using keyboard; test loading/empty/error and preserved search state.
- **API / security:** IDOR suite covers GET/PATCH/add/adopt, aliases, cursors and over-posted global fields. Test exact SKU and word searches against emulated D1 FTS5.
- **DB / migrations:** Full foundation-to-catalogue replay; uniqueness, FK, atomic audit and seller/global isolation assertions.
- **Acceptance:** [ ] Exact SKU first and product words correct. [ ] Global item can be added. [ ] Seller cost/discount changes do not mutate global data. [ ] Business B cannot read A's cost. [ ] No ingestion started before this gate.
- **Evidence / notes:** _Pending: suite totals, seed provenance, gate decision._

## 4. Quotation slice

### RAL-020 — Create seller-owned customers and quote identities
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-019.
- **Scope:** Lightweight business customer name/phone address book and long-lived quote identity; no Customer account. New quote supports unknown customer initially, with validated phone required at share.
- **UI / keyboard:** New quote/customer header with create/select/edit, missing-customer prompt, loading/save/error and accessible form controls. Avoid accidental merging of distinct people sharing a phone.
- **API / security:** `POST /api/quotes`, `GET /api/quotes/:id`, `PATCH /api/quotes/:id/customer`; proposed scoped customer search. Validate membership and same-business customer FK; do not trust posted status or totals.
- **DB / migrations:** `customers(business_id,name,phone)` and `quotes` with business/customer/status/version/timestamps; later revision/token references introduced safely. Customer uniqueness policy documented, not guessed from phone alone.
- **Acceptance:** [ ] Two businesses can hold independent similar customers. [ ] Cross-business customer assignment fails. [ ] Retried quote creation is idempotent. [ ] Draft survives reload.
- **Evidence / notes:** _Pending: customer identity decision, migrations, tests._

### RAL-021 — Separate working drafts from immutable commercial revisions
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-020.
- **Scope:** Mutable draft+draft lines with version; append-only numbered revisions, frozen line snapshots and quote events. Revisions capture seller/customer display, product brand/SKU/name/description, quantities, MRP/cost/discount/unit price/line totals.
- **UI / keyboard:** Display Draft / Saved revision and saving/conflict state; history is read-only and navigable. No user sees a mutable row mislabeled approved.
- **API / security:** Snapshot command verifies expected draft version, computes authoritative totals/hash and writes revision atomically; never accepts client content hash as proof. Internal DTO includes private costs; future public DTO separate.
- **DB / migrations:** `quote_drafts`, draft lines, `quote_revisions` unique quote/revision number, `quote_lines` revision FK, append-only `quote_events`; same-business seller-product references. Immutable content hash/version; no snapshot cascading changes.
- **Acceptance:** [ ] Two concurrent snapshots cannot reuse a revision number. [ ] Draft edits leave prior revisions unchanged. [ ] Canonical hash is deterministic for agreed customer-visible content.
- **Evidence / notes:** _Pending: canonicalization ADR, concurrency and snapshot tests._

### RAL-022 — Centralize integer-money pricing and tax assumptions
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-021.
- **Scope:** Shared deterministic pricing for quantity, discount, manual unit price, totals and seller profit. Store ₹6,000.50 as 600050 paise. Missing cost produces unknown line/quote profit, not inflated zero-cost profit.
- **UI / keyboard:** Instant totals and lock/private cues; profit missing-cost explanation, numeric validation and accessible quantity controls. Clearly display agreed tax assumptions; a quote is not a GST engine.
- **API / security:** Server recomputes totals using same versioned domain rules and rejects inconsistent/overflow/invalid values. Define percentage precision, fractional quantities/units, precedence of manual price versus discount and rounding/display policy before implementation.
- **DB / migrations:** Integer money checks, quantity/discount bounds, calculation policy version and customer-facing tax/currency context in snapshot. Cost remains internal and excluded from public hash inputs.
- **Acceptance:** [ ] Unit tests cover quantities, percentage/manual prices, paise rounding, missing cost and profit sum. [ ] Browser/server results agree. [ ] Catalogue MRP changes never recalculate snapshots.
- **Evidence / notes:** _Pending: approved pricing/tax presentation rules, golden calculations._

### RAL-023 — Build the one quotation workspace with server-backed tabs
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-020–RAL-022.
- **Scope:** Build only: IDE-style customer/amount tabs, New quote, left seller search/customer header and right quote lines/totals/actions. Last few quote IDs in local storage only; D1 remains authoritative.
- **UI / keyboard:** Arrow-key tabs, close/new actions with labels, dirty-close guard and focus recovery; tab reload/restoration handles deleted/forbidden IDs. Narrow screen adapts to one-column/panel layout without losing edits.
- **API / security:** Load each restored quote through authenticated GET; browser-stored ID never grants access. Scope local tab keys by account/business and clear inaccessible state after membership changes.
- **DB / migrations:** No browser replication or additional database; reuse draft/revision tables. No local-only quote documents.
- **Acceptance:** [ ] Multiple customer drafts persist independently. [ ] Reload restores authorized tabs and server content. [ ] Forged local-storage ID cannot leak another business. [ ] No Compare mode.
- **Evidence / notes:** _Pending: desktop/narrow screenshots, tab restoration tests._

### RAL-024 — Search My Catalogue and add snapshot lines
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-023, RAL-014.
- **Scope:** Quote search defaults to My Catalogue, showing brand/SKU/MRP/default quote. No results can disclose approved-global match count and offer View and add to my catalogue, never silently insert unpriced global items. Relationship placeholder only now.
- **UI / keyboard:** Debounced search, no-results/global bridge, retry, keyboard result focus and explicit Add action; preserve search after addition.
- **API / security:** `GET /api/quote-search?q=` and `POST /api/quotes/:id/lines` with seller-product ID, quantity, expected draft version and operation key. Server snapshots current seller values and verifies carried/accessibility policy.
- **DB / migrations:** Draft line snapshot values, stable line IDs/order, same-business FKs and addition event. Define repeated-add quantity behavior explicitly.
- **Acceptance:** [ ] Global product requires seller pricing adoption first. [ ] Cross-business seller product fails. [ ] Add snapshots values once. [ ] Replayed add does not duplicate quantity.
- **Evidence / notes:** _Pending: search/Add contract, regression tests._

### RAL-025 — Implement responsive line editing and safe autosave
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-022–RAL-024.
- **Scope:** Quantity +/- and direct edit, discount/manual price, removal, immediate right-hand MRP/quote/profit totals. Save debounced around 500 ms or on blur/action, not each keystroke.
- **UI / keyboard:** Numeric fields support ordinary editing; Enter/blur commits, Tab moves predictably, remove is labeled and undo/confirmation policy explicit. Saving/saved/offline/error/conflict badges; do not discard pending text.
- **API / security:** `PATCH/DELETE /api/quotes/:id/lines/:lineId` with expected draft version; verify nested quote/line ownership. Serialize/cancel stale requests so old responses cannot overwrite later edits; flush before share/PDF actions.
- **DB / migrations:** Conditional version updates and atomic line/totals/event writes. Immutable revisions unaffected; no PDF generation triggered.
- **Acceptance:** [ ] Rapid edits send bounded requests. [ ] Out-of-order response and two-tab edit produce safe state/conflict. [ ] Network failure preserves retryable draft input. [ ] Pricing golden tests remain green.
- **Evidence / notes:** _Pending: autosave timings, concurrency trace, keyboard tests._

### RAL-026 — Add quotation list, audit history and explicit lifecycle
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-025.
- **Scope:** Scoped list of draft/open/shared/customer-approved quotes and read-only event/revision history. Establish DRAFT → SHARED → CHANGE_PROPOSED → SHARED → APPROVED → TALLY_PENDING → BILLED with VOID/EXPIRED and integration error states introduced later.
- **UI / keyboard:** Status filters, list empty/loading/error, resume quote and timeline; reserved actions labeled unavailable until implemented. Status text conveys meaning beyond color.
- **API / security:** Proposed `GET /api/quotes?status=&cursor=` and history endpoint. Central transition commands, not arbitrary status PATCH; viewing remains read-only. Add dashboard counts from server-side scoped aggregates.
- **DB / migrations:** Status checks, indexed business/status/update time and events with actor/revision/timestamp. Approval/billing fields added only in owning slices.
- **Acceptance:** [ ] Invalid state transitions reject. [ ] List/dashboard counts agree. [ ] History is tenant-safe and chronological. [ ] GET cannot create PDFs, approve or bill.
- **Evidence / notes:** _Pending: state transition table, aggregate tests._

### RAL-027 — Prove quotation snapshots, isolation and pricing
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-020–RAL-026.
- **Scope:** Complete quotation slice before sharing. Add reusable golden quotes and source-prescribed immutable-price regression.
- **UI / keyboard:** Create customer → search → add → change quantity/discount/manual rate → save/reload using keyboard; test missing cost, empty quote and failed autosave recovery.
- **API / security:** Cross-business quote IDs, nested line IDs/customer IDs, forged totals and stale versions denied. Reuse membership harness with real quotation endpoints.
- **DB / migrations:** Replay all migrations; freeze quote at ₹5,000, change global and seller price to ₹6,000, reload and assert original quote snapshot remains ₹5,000.
- **Acceptance:** [ ] All source pricing scenarios pass including rounding and profit. [ ] No catalogue mutation retroactively changes quote. [ ] Employee A cannot read B's catalogue or quotation by modified ID. [ ] Quote tabs are server-backed.
- **Evidence / notes:** _Pending: test matrix, migration run, immutable-price assertion._

## 5. Sharing and revision slice

### RAL-028 — Implement revocable hash-only public capabilities
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-027.
- **Scope:** Cryptographically random high-entropy token grants narrow access to a shared revision; no customer account. Store hash only, issue plaintext once, and define expiry/revocation/replacement and browser-held-token reuse explicitly.
- **UI / keyboard:** Share link copy/reuse/regenerate controls with warning when replacing access; accessible success/error announcements. Lost plaintext is not recoverable from the database.
- **API / security:** Token lookup by hash, bounded timing-safe comparison where applicable, rate limits, no-referrer/private no-store responses and token log redaction. Proposed owner/employee revoke route; no token listing or arbitrary business access.
- **DB / migrations:** Capability table with unique hash, quote/revision binding, issuer, created/expiry/revoked timestamps; no plaintext `quotes.share_token`. Link approval records to capability ID later.
- **Acceptance:** [ ] DB/log inspection finds no raw token. [ ] Revoked/expired/unknown links fail generically. [ ] Reuse requires verified held token; missing token safely rotates instead of fake reconstruction.
- **Evidence / notes:** _Pending: token policy/security review, capability tests._

### RAL-029 — Share an exact saved revision through WhatsApp Click to Chat
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-028.
- **Scope:** Share flushes draft, validates international customer phone, freezes revision, ensures a usable capability, marks revision shared, returns Rallie-origin URL/message and opens WhatsApp in new tab. No WhatsApp Business API required.
- **UI / keyboard:** Share pending/success/failure, invalid-phone focus, popup-blocked Copy link fallback and explicit resharing target. Message includes customer, seller, total and link; do not claim delivered/read.
- **API / security:** `POST /api/quotes/:id/share` takes expected draft version, operation key and optionally held token; server constructs own-origin URL and encoded Click to Chat parameters, never redirects to arbitrary customer URL.
- **DB / migrations:** Atomic revision/share event/status/capability metadata; idempotency recovery must respect hash-only storage. Mark previous shared revision historical per policy.
- **Acceptance:** [ ] Unsaved edits are included exactly once. [ ] Retry cannot share different content under same key. [ ] No PDF or bill is generated. [ ] Keyboard and popup fallback work.
- **Evidence / notes:** _Pending: share contract, token retry decision, browser trace._

### RAL-030 — Render the minimal customer-safe public quotation
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-029.
- **Scope:** Mobile-friendly seller identity, customer/date, product snapshots/SKU/quantity/MRP/discount/agreed price/total, Approve and Suggest changes. No app navigation, login, seller internals or catalogue blending.
- **UI / keyboard:** Loading, invalid/expired/revoked, historical revision, approved, empty/unavailable and network retry states; large labeled controls and logical reading/focus order.
- **API / security:** `GET /api/public/quotes/:shareToken` constructs an allowlisted customer-safe DTO directly. Never serialize internal entity and delete cost fields. No seller cost/profit, private aliases, internal IDs beyond required revision metadata or extraction provenance leakage.
- **DB / migrations:** Read immutable revision bound to token and safe quote state only. GET has no commercial side effects; any operational access telemetry is isolated from quote transitions.
- **Acceptance:** [ ] Network payload and DOM contain no cost/profit. [ ] URL token cannot access other revisions/businesses. [ ] Mobile/keyboard use succeeds. [ ] View creates neither PDF nor voucher.
- **Evidence / notes:** _Pending: public DTO allowlist, response snapshots, mobile test._

### RAL-031 — Approve only the exact current eligible revision
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-030.
- **Scope:** Customer confirms displayed commercial terms; approval stores quote/revision/hash/time/capability/customer name. Approval freezes existing revision; no mutable quote-pointer inference.
- **UI / keyboard:** Explicit confirmation with total/revision, pending/approved/retry/stale prompt; focus moves to reload instruction on conflict. Double-click cannot create duplicate approval.
- **API / security:** `POST /api/public/quotes/:shareToken/approve` requires revision ID and content hash plus operation key; atomically verify token binding, eligibility/current shared revision, not void/expired, and matching immutable hash. Reject stale approval with conflict, never approve newer revision implicitly.
- **DB / migrations:** Approval record with unique applicable revision/capability policy and audited quote transition to APPROVED. Conditional update protects edit/approval races.
- **Acceptance:** [ ] Customer loaded rev1, seller shares rev2, stale approval approves neither rev2 nor obsolete offer. [ ] Repeated approval is harmless. [ ] Any tampered revision/hash fails. [ ] View alone does not approve.
- **Evidence / notes:** _Pending: race tests, approval audit fixture._

### RAL-032 — Handle edits after approval, void and expiry safely
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-031.
- **Scope:** Editing approved/shared content creates a new draft and later new revision; prior approval remains historical but is not current approval. State returns to DRAFT/SHARED as appropriate and customer must approve again. Define explicit void/expiry behavior.
- **UI / keyboard:** Warn that changes require reapproval, show old/new revision labels, expired/void public notice and owner/employee confirmation. No destructive edit to historical commercial data.
- **API / security:** Proposed void/expiry commands with expected quote version; public actions reject ineligible states. Token pinning remains explicit and old URLs cannot approve replacement content. Existing billed voucher history is not silently cancelled by quote edits.
- **DB / migrations:** Append events and lifecycle timestamps; conditional current-revision/status changes; expiry evaluation survives scheduler downtime. No historical deletion.
- **Acceptance:** [ ] Approved rev2 survives edit to rev3 intact. [ ] Rev3 is not approved by old token. [ ] Void/expired links cannot mutate. [ ] Approval/edit races deterministic.
- **Evidence / notes:** _Pending: lifecycle policy, race tests, historical-link UX._

### RAL-033 — Let customers propose quantity/removal changes
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-031, RAL-032.
- **Scope:** First increment permits quantity changes/removal only, based on displayed revision. Catalogue additions are retained in deferred RAL-076, not silently dropped. Original seller revision remains unchanged.
- **UI / keyboard:** Suggest changes editor with original/proposed quantities, remove/restore, diff summary and Send changes; keyboard operable numeric controls, cancel, validation/pending/submitted/conflict states.
- **API / security:** `POST /api/public/quotes/:shareToken/proposals` takes based-on revision and allowed line operations with idempotency key. Reject attempts to set MRP, cost, discount, unit price, unknown line or business; throttle spam and stale proposals.
- **DB / migrations:** `customer_proposals` with quote/base revision/proposed lines/created/status=PENDING/capability and canonical payload hash. Preserve proposal even after later seller revision; mark obsolete explicitly.
- **Acceptance:** [ ] Customer cannot change commercial rates. [ ] Proposal does not mutate quote lines. [ ] Duplicate submit is one proposal. [ ] Stale/nonmember line reference fails.
- **Evidence / notes:** _Pending: proposal schema/contract, browser and tampering tests._

### RAL-034 — Review and accept customer proposals into a new seller revision
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-033.
- **Scope:** Seller notification and diff, e.g. removed Basin Mixer, Diverter 1→2, with Reject/Accept into quote. Seller can reprice then reshare; acceptance never transfers prior customer approval.
- **UI / keyboard:** Pending/obsolete/accepted/rejected proposal views, accessible diff and confirmation, conflict instructions; retain original proposal for audit. Focus returns to updated quote after acceptance.
- **API / security:** Proposed proposal decision endpoints require authenticated business, expected current version/base revision and operation key. Recheck all lines against base snapshot and authorize any repricing as seller action.
- **DB / migrations:** Atomic decision/event and new draft/revision snapshot policy; unique decision guard prevents double acceptance. Quote becomes unapproved revised content with full lineage.
- **Acceptance:** [ ] Accept yields a new revision, original untouched. [ ] Reject changes no quote. [ ] Concurrent stale accept conflicts. [ ] Customer must approve the newly shared revision explicitly.
- **Evidence / notes:** _Pending: decision contracts, lineage tests, diff screenshot._

### RAL-035 — Close the sharing slice with privacy and concurrency tests
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-028–RAL-034.
- **Scope:** Exercise share/read/approve/edit/propose/reject/accept/reshare and expired/revoked links end to end; complete locking model before PDF and ingestion work.
- **UI / keyboard:** Seller and mobile customer keyboard paths, popup failure fallback, stale-tab approval, double submit and slow network; no cost/profit anywhere public.
- **API / security:** Token guessing/rate limits, forged hash, cross-quote token, CSRF on seller routes, proposal price injection, no-referrer/cache headers and hash-only persistence audit.
- **DB / migrations:** Verify immutable revisions, single approval/decision, deterministic hashes and append-only lineage under parallel requests.
- **Acceptance:** [ ] Source stale-rev1 versus rev2 scenario passes. [ ] Postapproval edits require fresh approval. [ ] Public GET cannot bill or render PDF. [ ] Quantity/removal proposals pass only after approval-locking tests pass. [ ] No real WhatsApp delivery claim.
- **Evidence / notes:** _Pending: adversarial matrix, test results, gate decision._

## 6. Explicit PDF generation slice

### RAL-036 — Render QuotationDocument in the browser only on explicit action
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-035.
- **Scope:** Reusable `QuotationDocument` with browser on-demand renderer such as `@react-pdf/renderer`. Generate PDF flushes/snapshots current draft into immutable revision, renders Blob and downloads; no server browser renderer.
- **UI / keyboard:** Explicit Generate PDF button, rendering/progress/download/error/retry, disabled duplicate activation and accessible announcement. Multi-page layout with seller/customer/product/totals and ₹ font support; no private cost/profit.
- **API / security:** `POST /api/quotes/:id/pdf` authorizes/prepares target revision and document operation; it must not pretend to render server-side. Browser uses customer-safe document data. Clarify render preparation versus upload completion contract.
- **DB / migrations:** Snapshot reuses revision model; document metadata introduced next. Nothing runs on save/share/view/approval/price edit.
- **Acceptance:** [ ] Only click invokes renderer. [ ] PDF values match frozen hash/revision. [ ] Long descriptions and pagination readable. [ ] Private fields absent from PDF and rendering DTO.
- **Evidence / notes:** _Pending: PDF samples, font/layout tests, explicit-event assertion._

### RAL-037 — Persist optional generated PDFs privately with immutable metadata
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-036.
- **Scope:** Browser may upload generated Blob to private R2 using authorized short-lived upload grant; download-only is supported. Preserve previous revision PDFs, never overwrite historical object keys.
- **UI / keyboard:** Distinguish Generated/downloaded from Stored copy, upload pending/failure/retry and authorized document history download. Keyboard actions identify revision/date.
- **API / security:** Proposed document upload/finalize/download routes verify quote business, revision, content type/size and server-computed object hash; signed URLs short-lived and scoped. A browser hash alone is not trusted validation.
- **DB / migrations:** `quote_documents(id,quote_revision_id,sha256,r2_key,generated_by,generated_at)` with operation uniqueness; nullable key for recorded download-only completion, persisted flag/status if needed. No finalized row for failed render; record only explicit generation.
- **Acceptance:** [ ] New revision produces separate artifact. [ ] Replayed finalize does not duplicate. [ ] Unauthorized object access fails. [ ] Upload failure preserves local download and safe retry.
- **Evidence / notes:** _Pending: metadata lifecycle decision, private R2 tests._

### RAL-038 — Prove PDF generation is explicit and revision-bound
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-036, RAL-037.
- **Scope:** Automated event matrix verifies PDF laziness, frozen content and client-generation resource boundaries.
- **UI / keyboard:** Generate via keyboard, fail renderer/upload separately, retry and retrieve old document; test mobile public view does not trigger generation. Loading state cannot accidentally invoke render twice.
- **API / security:** Assert no public quote response exposes signed source URLs or private PDF fields; nested document IDOR denied. Instrument render and R2 calls to distinguish generation from view/download.
- **DB / migrations:** Only explicit successful Generate flow creates finalized document metadata; prior artifacts remain unchanged after catalogue, customer or quote edits.
- **Acceptance:** [ ] Save/share/price edit/customer view/approval create no PDF rows or artifacts. [ ] Explicit Generate does. [ ] A changed quote gets a new immutable revision artifact. [ ] Optional storage and download-only cases tested.
- **Evidence / notes:** _Pending: event-matrix results, PDF hash comparisons, slice gate._

## 7. PDF ingestion slice

### RAL-039 — Introduce immutable sources, submissions and durable run records
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-038.
- **Scope:** Now add evidence-layer entities, not earlier: binary documents, independent submissions, ingestion jobs, versioned extraction runs and staging; claims schema can be introduced with commit to keep it actionable.
- **UI / keyboard:** Source/run status vocabulary used by upload/history; no independent editing of original PDF or extracted raw evidence.
- **API / security:** Business authorization binds job/submission/source access; shared binary dedupe never authorizes reading another business's submission. R2 keys are not capabilities.
- **DB / migrations:** `source_documents` unique sha256/r2_key/mime/effective_date/parse_status; submissions document/business/uploader/time; runs extractor_version/status/workflow_id/artifact/error; jobs stage/progress/start/finish/retry/last_error; staged rows source locator/raw/extracted/corrections/match. Separate retry identity from independent submissions.
- **Acceptance:** [ ] Source immutability enforced. [ ] Same binary supports multiple submissions without duplicated evidence objects. [ ] Jobs retain history independently of Workflow state. [ ] Tenant/source-access tests pass.
- **Evidence / notes:** _Pending: evidence schema, ownership policy, migration replay._

### RAL-040 — Build New PDF update and secure direct-to-R2 uploads
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-039.
- **Scope:** Focused drop/browse screen, optional detected/supplied brand, optional effective date, Upload and process. Brand must be confirmed before final commit, not necessarily before upload.
- **UI / keyboard:** File chooser keyboard alternative, drag feedback, upload progress/cancel/retry, MIME/size errors and expiry recovery; never require drag-only interaction.
- **API / security:** `POST /api/ingestions` returns `{jobId,uploadUrl,r2Key}`; browser PUTs PDF; `POST /api/ingestions/:jobId/complete` verifies owned uploaded object before workflow start. Short-lived presigned PUT, narrow bucket CORS, private bucket, no storage credentials. Validate content/signature, configured max bytes/pages and hostile malformed/encrypted PDF policy.
- **DB / migrations:** CREATED/UPLOADING/UPLOADED transitions with object key bound to job; completion idempotent. Cleanup orphan uploads without deleting referenced evidence.
- **Acceptance:** [ ] Expired grant can be safely renewed. [ ] Forged key/job/MIME/oversized object rejected. [ ] Complete before upload fails; retry starts one logical ingestion.
- **Evidence / notes:** _Pending: limits, signed-upload tests, UI trace._

### RAL-041 — Execute durable ingestion and poll persisted progress
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-040.
- **Scope:** Workflow steps validate → fingerprint → reuse or convert/extract/persist → normalize → exact/candidate match → stage → READY_FOR_REVIEW and end. Human review lives in D1, never a waiting Workflow.
- **UI / keyboard:** Checkmarks/current/future stages, rows found, leave-screen reassurance and failure/retry; poll `GET /api/ingestions/:jobId` every 2–3 seconds while active, back off/stop on terminal state or hidden tab.
- **API / security:** Job GET exposes safe stage/error/progress only to submitting business; start/retry durable operation IDs. No WebSockets for PDF progress. Error handling distinguishes retryable, unsupported and validation failure.
- **DB / migrations:** Persist stage transitions PARSING/EXTRACTING/MATCHING/READY_FOR_REVIEW; later REVIEWING/COMMITTING/COMPLETED. Record workflow ID, stage progress, attempts and timestamps in D1 through conditional updates.
- **Acceptance:** [ ] Restart resumes safely. [ ] Browser may leave and return. [ ] READY ends workflow; review still exists a week later beyond provider retention. [ ] Retry does not regress completed job.
- **Evidence / notes:** _Pending: workflow trace, stage tests, retention simulation._

### RAL-042 — Deduplicate binaries with durable extraction ownership
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-041.
- **Scope:** SHA-256 verified object bytes; same binary reuses usable extraction, while each independent business keeps its own submission/review. Different metadata/scans may parse again; row fingerprints later group agreement.
- **UI / keyboard:** Progress can say existing extraction reused without naming other businesses; failed/stale extraction retry understandable. No special keyboard surface beyond progress/history.
- **API / security:** Durable reservation for document+extractor version with lease/attempt/fencing prevents parallel workers both publishing outputs. Reuse only compatible successful runs; expired claim recovery cannot overwrite newer result. Bound hashing to tested runtime limits; measure rather than assume large PDFs fit Worker CPU.
- **DB / migrations:** Unique binary hash, extraction ownership/run key, unique stage materialization keys and submission request identity. Compensate duplicate temporary R2 objects after durable reference succeeds.
- **Acceptance:** [ ] Concurrent A/B upload parses once and records both submissions. [ ] Crash/retry cannot duplicate stages or publish stale run. [ ] Incompatible extractor version reprocesses explicitly.
- **Evidence / notes:** _Pending: reservation algorithm, concurrency/fault tests, CPU measurements._

### RAL-043 — Define versioned extraction contract and explicit mock adapter
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-041, RAL-042.
- **Scope:** `CatalogueExtractor.extract(ParsedDocument): Promise<ExtractedCatalogue>` with document brand/effective date and rows containing sourceLocator(page,rowHint), SKU/name/description/MRP and field confidence. Preserve raw/source text, raw extracted values and source page separately from seller edits.
- **UI / keyboard:** Development mock indicator prominent; users see decision states, not confidence numbers everywhere. Mock fixture failures use real progress/error presentation.
- **API / security:** Strict structured validation, untrusted PDF text treated as data, no model authority to call tools or modify canonical catalogue. Explicit mock opt-in with deterministic fixtures; fail if real mode lacks credentials, never silently substitute mock.
- **DB / migrations:** Extractor version and immutable artifact/schema version; staged row unique run/locator/row key. Store confidence internally without promoting it to truth.
- **Acceptance:** [ ] Mock repeatability and failure scenarios pass. [ ] Raw evidence survives corrections. [ ] No inferred ontology/paired SKU/cross-brand equivalent becomes an approved fact.
- **Evidence / notes:** _Pending: contract fixtures, mock guard tests; not real-AI evidence._

### RAL-044 — Integrate real Workers AI conversion and structured extraction
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-043.
- **Scope:** Cloudflare `toMarkdown` from private R2, then structured extractor adapter e.g. `CloudflareAiCatalogueExtractor`, versioned cf-ai-v1/v2. Handle image-heavy scans and parser failures explicitly; no mandatory OCI/Docling server.
- **UI / keyboard:** Accurate conversion/extraction stages and actionable unsupported/failed message; no claim that valid JSON means a correct catalogue. Retry uses deliberate version/run selection.
- **API / security:** Server-side AI binding only; bounded calls/timeouts/retries/output, document privacy review, prompt-injection-resistant extraction instructions and schema validation. Do not infer functional slot, canonical category, series hierarchy, paired SKU, equivalent or sales package unless explicit/useful and still treated as evidence.
- **DB / migrations:** Persist original conversion/output artifacts, model/extractor version, errors/timing and source locators, not just final JSON.
- **Acceptance:** [ ] Real digital and image fixtures assessed against ground truth. [ ] Missing credentials block real test explicitly. [ ] Failure metrics distinguish conversion/model/validation. [ ] Quality failure points to deferred adapter path.
- **Evidence / notes:** _Pending: real binding run, accuracy report, costs; mocked runs do not close this ticket._

### RAL-045 — Normalize rows and match conservatively
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-042–RAL-044, RAL-014.
- **Scope:** Normalize brand and SKU punctuation/case; full normalized brand+SKU exact → link existing identity; unmatched same-brand FTS top five → POSSIBLE_DUPLICATE needing human decision; otherwise NEW_PRODUCT/provisional candidate. Keep `POSSIBLE_MATCH` UI terminology mapped consistently.
- **UI / keyboard:** Explain existing/possible/new/missing-field decisions, Same product/Different product controls and source access. Never silently fuzzy merge or call suffix `079n` an exact match.
- **API / security:** Matching reads approved/global plus explicitly authorized private evidence; no leakage of other sellers' provisional data. Seller confirms brand and identity before commit; similarity/confidence is advisory only.
- **DB / migrations:** Persist normalization version, candidate IDs/reasons and selected match separately from extracted values. Provisional identity policy from gaps must be implemented before seller commit.
- **Acceptance:** [ ] KUP-CHR/KUP CHR/KUP/CHR normalize consistently. [ ] Similar but distinct SKUs remain separate. [ ] Same-brand candidate cap and review requirement enforced. [ ] Re-run preserves originals.
- **Evidence / notes:** _Pending: normalization/matching fixtures, candidate UI tests._

### RAL-046 — Add ingestion history, bounded retries and source inspection
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-041–RAL-045.
- **Scope:** Show completed job (rows/duration), failed stage/error and Retry; continue pending review through dashboard. Source viewer opens page/row context with original PDF/raw extraction alongside later corrections.
- **UI / keyboard:** History loading/empty/filter/retry, source loading/unavailable/error and accessible download fallback; viewer has labeled page navigation and focus return. Do not expose confidence as substitute for decisions.
- **API / security:** Proposed job list/retry/source-view routes enforce submission authorization and short-lived private access; admin source access requires separate moderation grant. Redact internal provider errors. Retry cannot erase completed evidence.
- **DB / migrations:** Indexed business/job state/history; append run attempts and durable last-error/retry counts. Retain D1 human review beyond Workflow's default three-day state retention.
- **Acceptance:** [ ] Week-old ready review loads. [ ] Retry produces traceable new attempt, not duplicate submission. [ ] Cross-business source download fails. [ ] Dashboard review count updates from actual persisted state.
- **Evidence / notes:** _Pending: retry policy, source ACL tests, screenshots._

### RAL-047 — Verify extraction quality, dedupe and failure recovery fixtures
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-039–RAL-046.
- **Scope:** Corpus includes digital table, multi-page table, repeated headers, missing SKU, missing price, comma price, ₹ symbol, duplicate row, same file twice, changed product price and two similar SKUs; add malformed/image-heavy cases.
- **UI / keyboard:** Fixture expectations include decision state and reviewability, source locator navigation and failed/retry progress; not just schema-valid JSON.
- **API / security:** Concurrent completes/retries, expired uploads, unauthorized jobs/artifacts, oversized input and model output tampering; no production mock fallback.
- **DB / migrations:** Verify one binary/run reuse, separate submissions, durable staging and immutable originals through crash at each workflow step. Run replay and local-binding integration.
- **Acceptance:** [ ] Every source fixture has ground truth and accuracy result. [ ] Two-business same binary dedupes. [ ] Source locator/raw/extracted/corrections are distinct. [ ] Real AI and mock evidence reported separately; absent real service remains limitation.
- **Evidence / notes:** _Pending: corpus results, fault matrix, real-extraction gate._

## 8. Review-and-global-evidence slice

### RAL-048 — Build the decision-focused PDF review table
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-047.
- **Scope:** Summary counts Already in your catalogue/Known globally not in yours/New/Need attention; filters All/Needs attention/Existing/New. Rows selected for carry, source identity/name/new MRP and existing seller MRP/cost/discount alongside, price-change percent and missing/match warnings.
- **UI / keyboard:** Accessible row selection and edit controls, predictable Tab order, filter tabs, large-list pagination/virtualization without inaccessible rows, loading/empty/error. Same/Different product decisions are explicit; no confidence clutter.
- **API / security:** Proposed paginated staged-row GET tied to job/business; server-computed classification/counts. Read existing seller commercial values only for current business.
- **DB / migrations:** Index staging by job/classification; do not duplicate immutable extraction into editable fields destructively. No catalogue changes merely from opening review.
- **Acceptance:** [ ] Existing seller pricing visible next to extraction. [ ] Counts/filter selection semantics consistent. [ ] Missing name/price and possible duplicate require action. [ ] Keyboard reaches row source and decision buttons.
- **Evidence / notes:** _Pending: review screenshots, accessibility and pagination tests._

### RAL-049 — Persist review edits without rewriting source evidence
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-048.
- **Scope:** Editable Brand, SKU/product ID, name, description, MRP plus carry, cost and default discount only. Save review for later persists correction layer and selections; brand confirmation required before commit, effective date may remain explicitly unknown.
- **UI / keyboard:** Dirty/saving/saved/retry/conflict, validation per row, Save for later and Add/update actions; navigation confirmation protects local input. Source values remain inspectable alongside corrected values.
- **API / security:** Proposed `PATCH /api/ingestions/:jobId/review` with expected review version and row-level allowed corrections/match decisions. Validate price precision, required selected-row fields and same-business access; no posted approved status accepted.
- **DB / migrations:** Versioned review/corrections separate from immutable run artifacts; durable REVIEWING state and actor/time. Concurrent reviewers conflict rather than silently overwrite.
- **Acceptance:** [ ] Week-later resume restores edits. [ ] Corrected name leaves raw extraction unchanged. [ ] Invalid/unconfirmed selected rows block commit. [ ] Save does not publish global facts.
- **Evidence / notes:** _Pending: edit schema, conflict and retention tests._

### RAL-050 — Atomically commit seller changes and pending claims idempotently
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-049, RAL-013.
- **Scope:** `POST /api/ingestions/:jobId/commit` adds/updates selected seller products immediately and creates product/price claims; global facts stay pending. Edited display goes into seller overlay, including new provisional identity use before admin approval.
- **UI / keyboard:** Commit summary lists selection/pricing changes; COMMITTING/progress/completed/failure resume. Disable accidental duplicate activation without making retries impossible.
- **API / security:** Expected review version, selection hash and idempotency key; durable claim of commit ownership. Revalidate tenant, selected rows, brand/matches and pricing. Same key/different content conflicts. Never trust raw client table data as source.
- **DB / migrations:** Add `product_claims` and `product_price_claims` with source/business/raw-vs-corrected provenance/status; unique fingerprints. Bounded D1 batch atomically writes each declared commit unit's overlay+claims+audit. If file exceeds limits, persist chunk manifest/checkpoints and expose partial progress; do not claim whole-file atomicity.
- **Acceptance:** [ ] Retry/crash never creates duplicate claims or partial per-row seller/claim pair. [ ] Corrected seller name appears now, global unchanged. [ ] Concurrent commits have one durable outcome.
- **Evidence / notes:** _Pending: batch/limit decision, claim uniqueness, failure-injection tests._

### RAL-051 — Aggregate evidence strength without automatic truth
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-050.
- **Scope:** Group matching price proposals by product/MRP/effective context; show independent businesses, distinct documents, identical row evidence and conflicts plus source filename/page/row. Same binary can support many independent businesses, not many parses.
- **UI / keyboard:** Read-only evidence summaries and source links accessible by keyboard; differentiate unknown dates, same-file submissions and conflicting prices. No “three dealers = automatically approved” state.
- **API / security:** Proposed claim summary routes for platform admin; seller sees only its submission. Price fingerprint includes product, normalized MRP, effective date, source document and business; repeated same-business uploads must not inflate independent count.
- **DB / migrations:** Stable row/claim fingerprints, aggregate indexes and provenance FKs; original extraction, seller corrections and decision chain preserved. No approval trigger based on counts.
- **Acceptance:** [ ] Seven businesses/three documents counts correctly. [ ] Same dealer retry does not increase independence. [ ] Metadata-different PDFs can corroborate matching rows. [ ] Conflicts remain visible, never auto-resolved.
- **Evidence / notes:** _Pending: aggregation golden datasets, provenance checks._

### RAL-052 — Prove immediate seller value with unchanged global truth
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-048–RAL-051.
- **Scope:** End-to-end upload → extract → review/correct → commit → seller catalogue → quote, before admin publication. Close review slice with duplicate-file and rollback scenarios.
- **UI / keyboard:** Correct missing name, resolve possible match, set carry/cost/discount, save/resume/commit and find product in Build using keyboard; appropriate error/partial-progress handling.
- **API / security:** Replay same commit, mutate selection under reused key, concurrently commit and attempt cross-tenant source/row references. Immediate local product does not leak into public global search.
- **DB / migrations:** Assert original source/extraction unchanged, seller gets correction, claim stores proposal and global unchanged. A then B identical upload yields one extraction, two submissions and two independent businesses, not duplicate B claims.
- **Acceptance:** [ ] All source review tests pass. [ ] Crash recovery preserves seller/claim atomic unit. [ ] Provisional products quote successfully through private overlay. [ ] No pending claim silently approved.
- **Evidence / notes:** _Pending: full review trace, dedupe assertions, slice gate._

## 9. Admin moderation slice

### RAL-053 — Deliver admin exception queues and product-claim decisions
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-052.
- **Scope:** Admin-only navigation and four tabs Product claims, Price changes, Relationships, Possible duplicates. Primary workflow is reviewing evidence, not manually maintaining products one by one. Relationship tab remains explicitly not-yet-active until relationship slice.
- **UI / keyboard:** Queue counts/filter/pagination, old-versus-proposed field diff, source provenance and Approve/Reject; keyboard tab/diff/action flow, pending/empty/error and already-decided conflicts.
- **API / security:** Proposed `/api/admin/claims` list/detail/decision routes require platform flag on server. Reject business-role/admin spoofing; source viewers honor moderation access. Decision takes expected claim version/reason/idempotency key.
- **DB / migrations:** Claim decision fields `approved_by/approved_at/source_claim_id` equivalents and audit; publication updates canonical identity only through command, preserving rejected proposals. Approve provisional identity without losing source lineage.
- **Acceptance:** [ ] Owner without platform flag denied. [ ] Approval publishes only intended fields. [ ] Concurrent decision conflicts. [ ] Reject leaves seller commercial data intact.
- **Evidence / notes:** _Pending: moderation policy, queue and authorization tests._

### RAL-054 — Publish approved prices without moving seller prices
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-053.
- **Scope:** Price proposal displays current ₹5,000/proposed ₹6,000, effective date, independent business/document/row/conflict counts and source page/row; Approve amount/Reject/Open source. Resolve future/same-date ordering policy explicitly.
- **UI / keyboard:** Clear approval confirmation, reason on reject, pending/conflict states and immutable history view; keyboard actions announce price and effective date.
- **API / security:** Proposed price-claim decision route validates admin, claim version, amount/date and source; operation key prevents duplicate publication. Seller updates are not part of publication command.
- **DB / migrations:** Insert new `product_price_versions`, update approved latest pointer according to effective policy and append audit in one batch; approved_by/at/source_claim provenance. Never overwrite ₹5,000 or update any seller active version.
- **Acceptance:** [ ] Approval creates one ₹6,000 history row. [ ] Seller stays ₹5,000 and dashboard shows drift. [ ] Repeated approval is harmless. [ ] Future/same-date conflicts obey documented policy.
- **Evidence / notes:** _Pending: publication transaction tests, history screenshot._

### RAL-055 — Merge duplicates without deleting evidence or commercial history
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-053, RAL-054.
- **Scope:** A/B identity and evidence comparison, Not duplicate or Merge B into A. Never merge from fuzzy score alone; migrate active references deliberately, retain historical IDs and source evidence.
- **UI / keyboard:** Confirm direction and affected references, explain seller overlay collisions and irreversible history implications; keyboard accessible preview/cancel/confirm and conflict/retry states.
- **API / security:** Proposed merge command with winner/loser IDs, expected versions, reason and operation key; platform-admin only, reject self/merge cycles/cross-identity invalid target. Require explicit conflict resolution for businesses carrying both.
- **DB / migrations:** Set loser MERGED and `merged_into_product_id`; redirect active catalogue/search references, preserve historical quote lines/prices/claims. Reconcile unique seller overlays, price links and later relationship/Tally mappings via versioned migration hooks, never destructive cascades.
- **Acceptance:** [ ] Historical source IDs still resolve. [ ] Quote snapshots unchanged. [ ] Duplicate active overlays handled without losing cost/mappings. [ ] Retry cannot double-migrate or create merge cycles.
- **Evidence / notes:** _Pending: merge conflict ADR, rollback/fault tests._

### RAL-056 — Make moderation auditable and prepare relationship review seam
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-053–RAL-055.
- **Scope:** Common approve/reject/merge decision timeline with actor/time/reason/source, no extra Catalogue Reviewer role. Relationship tab contract and future decision component prepared without prematurely creating relationship schema.
- **UI / keyboard:** Audit details readable and keyboard navigable; unavailable Relationships tab explains its planned scope. Source failure does not hide prior decisions or imply no evidence.
- **API / security:** Admin audit/detail routes are read-only and paginated; safe source grants; decision records append-only. Ensure platform flag cannot bypass unrelated seller-cost access policies.
- **DB / migrations:** Shared moderation audit fields/indices; preserve approved_by/approved_at/source_claim_id wherever publication occurs. Decisions must be atomic with canonical change and durable under retry.
- **Acceptance:** [ ] Every published field/price/merge traces back to actor and evidence. [ ] Rejected claims remain inspectable. [ ] No user can rewrite audit through normal API. [ ] Relationship approval is not falsely marked implemented.
- **Evidence / notes:** _Pending: audit lineage fixture, admin permission review._

### RAL-057 — Close moderation with publication and merge regressions
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-053–RAL-056.
- **Scope:** Product approve/reject, price history, independent evidence, drift and merge journey; preserve admin authority regardless of number of matching submissions.
- **UI / keyboard:** Navigate all tabs, review old/new provenance, approve price, reject claim, mark not-duplicate and merge confirmed duplicate; empty/conflicting queues remain understandable.
- **API / security:** Nonadmin denial, stale decisions, repeated requests, source ACL and global-versus-seller privacy tests. Three or seven matching businesses never trigger implicit publication.
- **DB / migrations:** Snapshot history before/after moderation; canonical changes and audit atomic, seller active price unchanged, sources/old product IDs/quote revisions retained.
- **Acceptance:** [ ] Source admin publication invariants all pass. [ ] New global MRP appears only after admin action. [ ] Seller must explicitly adopt it. [ ] Merge retains evidence and immutable quote content. [ ] Relationship implementation remains next slice.
- **Evidence / notes:** _Pending: moderation suite, transaction logs, slice gate._

## 10. Relationships slice

### RAL-058 — Let sellers propose useful local relationships
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-057.
- **Scope:** REQUIRED_WITH, COMMONLY_SOLD_WITH, ALTERNATIVE only. Owner/Employee suggests relation from product drawer; own business benefits immediately while candidate awaits admin. No inferred sanitaryware ontology or hallucinated PDF pairing.
- **UI / keyboard:** Suggest relationship form with product search/type/direction, preview, submit/cancel and pending/local/rejected labels; all search/selection controls keyboard accessible.
- **API / security:** `POST /api/catalogue/relationship-proposals` validates accessible endpoints, business/proposer and relation type; idempotent submission. Only originating business sees its unapproved relation. Reject self-edge and invalid direction/cycle per decided policy.
- **DB / migrations:** `product_relationship_candidates` with A/B/type/business/proposer/status/version/timestamps; unique active logical proposal and retained evidence/reason. Use standard names consistently with source's abbreviated later list.
- **Acceptance:** [ ] Local proposal appears for proposer only immediately. [ ] Another business sees none before approval. [ ] Duplicate/self/cycle cases handled. [ ] Proposing relation never auto-adds quote lines.
- **Evidence / notes:** _Pending: direction/cycle decision, proposal tests._

### RAL-059 — Promote approved relationship candidates globally
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-058, RAL-056.
- **Scope:** Activate admin Relationships tab with candidate pair/type/proposer/evidence, approve/reject and audit. Approved relation appears to all businesses; rejection policy for seller-local advice must be visible and explicit.
- **UI / keyboard:** Accessible queue/diff/confirmation and conflict/empty/loading states; distinguish Local suggestion from Globally approved. Product drawer lists Required with/Commonly sold with/Alternatives.
- **API / security:** Proposed admin relationship decision route requires platform flag, expected candidate version and operation key. Seller cannot directly publish or overwrite approved relationship.
- **DB / migrations:** `product_relationships` unique canonical endpoint/type with admin approval metadata/source candidate; atomic candidate status + relationship + audit. Handle merged products, directed required edges and symmetric alternatives without duplicates.
- **Acceptance:** [ ] Approval makes relation global exactly once. [ ] Rejection does not erase proposal history. [ ] Self/cycle/merge conflicts are caught. [ ] Other tenants cannot view private pending evidence.
- **Evidence / notes:** _Pending: publication and merge-edge tests, UI trace._

### RAL-060 — Add explicit relationship prompts to Build and close slice
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-059, RAL-024.
- **Scope:** Quote search shows Required product/Commonly sold with and alternatives from approved plus own local proposals. Kubix trim prompts ALD-CHR-079N body with Add both/Add trim only. No silent product insertion.
- **UI / keyboard:** Labeled relationship disclosure, focusable two-choice confirmation, already-in-quote state and missing seller pricing bridge. Adding only trim is explicit, not blocked as an accounting rule.
- **API / security:** Extend seller quote-search DTO and add-lines command for explicit selected IDs; required counterpart not carried must pass seller adoption/pricing first. Versioned/idempotent multi-add verifies every line's business access.
- **DB / migrations:** Atomic draft line additions/events where bounded; no recursive automatic traversal, duplicate relation loops or hidden quantity changes.
- **Acceptance:** [ ] Add both inserts chosen two lines once. [ ] Add trim only inserts one. [ ] Global unpriced counterpart is not silently added. [ ] Local/global relationship provenance and tenant tests pass.
- **Evidence / notes:** _Pending: keyboard prompt test, multi-add retry tests, slice gate._

## 11. Tally bridge slice

### RAL-061 — Specify typed bridge protocol and explicit fake implementation
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-060, RAL-035.
- **Scope:** Add tally-protocol package and test fake for connect, heartbeat, list-company, sync-items, create-item, create-voucher, job-result. Protocol deterministic/versioned, not MCP or AI reasoning. Fake Tally opt-in explicitly, not real Windows/Tally.
- **UI / keyboard:** Mock connection/job badges and unsupported-service states; no simulated BILLED shown as real accounting. Diagnostics readable without keyboard traps.
- **API / security:** Each cloud message requires protocol_version/message_id/job_id/idempotency_key/type/payload/sent_at; result requires message_id/job_id/success/result/error_code/error_message/completed_at. Validate schemas, device/business binding, size and message replay.
- **DB / migrations:** Introduce `tally_sync_jobs` operation/payload hash/status/attempts/result/idempotency key with scoped uniqueness and durable claim/lease/attempt ownership. D1 is source of jobs, not socket memory.
- **Acceptance:** [ ] Fake protocol contract/failure tests pass. [ ] Mismatched payload under reused key fails. [ ] Production refuses mock. [ ] No real integration claim from fake success.
- **Evidence / notes:** _Pending: protocol version/schema, fake test results._

### RAL-062 — Pair an owner-authorized bridge and confirm company
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-061.
- **Scope:** Settings → Tally → Connect: pair code like RALLIE-8F3D-92KQ, install bridge, enter code, outbound TLS, local probe, discover loaded companies, owner confirms Arihant Sanitation FY26-27, then initial sync. Tally must run with company loaded and HTTP enabled.
- **UI / keyboard:** Stepper/code copy, waiting/expired/retry/wrong-company/connected/revoked states, keyboard company radio selection and explicit confirmation. Employee cannot pair/reconfigure credentials.
- **API / security:** Proposed pair-code create/redeem/company-confirm/revoke routes. Short-lived single-use hashed codes with brute-force limits; exchange for scoped device credentials, secure rotation/revocation. Device cannot choose arbitrary business/company authorization.
- **DB / migrations:** `tally_connections` business/device/company/last_seen/status/credential metadata; pairing challenges consumed atomically. Do not store plaintext device secrets.
- **Acceptance:** [ ] Replayed/expired code fails. [ ] Wrong owner/business cannot bind device. [ ] Company is explicitly confirmed. [ ] Revocation ends effective access.
- **Evidence / notes:** _Pending: pairing TTL/storage decision, security tests._

### RAL-063 — Implement hibernating Durable Object outbound-WSS transport
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-062.
- **Scope:** Worker routes authenticated device connection to company/business-scoped Durable Object, hibernatable WebSocket, heartbeat, reconnect/backoff and durable job dispatch. Bridge initiates outbound WSS; no port forwarding/inbound shop port.
- **UI / keyboard:** Connection online/offline/reconnecting/stale-last-seen state in Tally/Dashboard; status updates announced accessibly, no bespoke keyboard behavior.
- **API / security:** Authenticate handshake and every dispatch/result binding, enforce protocol version/message bounds, credential revocation and duplicate session policy. Reject result for another job/device/company; no arbitrary command tunneling.
- **DB / migrations:** Job state/result persisted in D1 before/after transport; lease/attempt fencing stops stale socket from claiming completion for newer work. DO storage contains connection metadata, not sole accounting truth.
- **Acceptance:** [ ] Hibernation/restart retains/reconstructs connection routing. [ ] Reconnect delivers pending jobs safely. [ ] Cross-business messages denied. [ ] Offline transport never loses durable job or marks success.
- **Evidence / notes:** _Pending: emulator and deployed DO traces; deployment test limitations recorded._

### RAL-064 — Build the real Windows service with reliable local execution
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-063.
- **Scope:** Choose Go or .NET Windows service: only cloud connection, Tally XML adapter and reliable job execution. Probe `http://127.0.0.1:9000`; no screen scraping/UI automation, catalogue or quotation business logic. Installation/start/stop/restart and secure device credential storage.
- **UI / keyboard:** Minimal accessible installer/pairing/diagnostics path, clear Tally-not-running/HTTP-disabled/no-company errors. macOS fake testing cannot certify Windows service behavior.
- **API / security:** Validate typed allowlisted commands; safe XML encoding/parsing, disable external entities, bound local HTTP timeouts/response sizes. No cloud-selected arbitrary LAN URL/SSRF. Persist intent before local execution.
- **DB / migrations:** Local SQLite ledger job_id/idempotency key/payload_hash/status/result; durable same-key conflict detection and restart recovery. Completed result survives reconnect; uncertain attempts must not blindly rerun.
- **Acceptance:** [ ] Real Windows service restarts and reconnects. [ ] Credentials not in logs/plain config. [ ] Ledger duplicate returns prior result. [ ] Real Tally probe verified separately from mock.
- **Evidence / notes:** _Pending: language/version, Windows/Tally versions, installer/service logs; unavailable hardware is BLOCKED._

### RAL-065 — Synchronize Tally stock masters and show freshness
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-064.
- **Scope:** First real integration: fetch stock-item identity/name, aliases/Part No when available, UOM, closing/current stock, configured rate and sync timestamp. Sync at startup, reconnect, manual Sync now, pre-billing and configured periodic interval while connected; not continuous mirroring.
- **UI / keyboard:** Stock e.g. 14 pcs and Last synced 7 minutes ago, stale/offline/error states, keyboard Sync now; never imply five-hour-old data is realtime. Show selected company.
- **API / security:** Typed list-company/sync-items jobs and proposed scoped stock/status routes; verify confirmed company each run. XML/ODBC capability differences documented; choose tested XML path initially.
- **DB / migrations:** `tally_items` unique connection/company/item key, aliases/UOM/stock/rate/sync time; sync generation checkpoints and tombstone policy. Import selected rates as observations, never overwrite seller quote prices.
- **Acceptance:** [ ] Real stock sync succeeds before mapping work. [ ] Reconnect/manual/periodic triggers dedupe. [ ] Company mismatch blocks. [ ] Partial sync does not pretend full freshness.
- **Evidence / notes:** _Pending: real XML fixtures, interval decision, sync tests._

### RAL-066 — Confirm and persist Rallie-to-Tally item mappings
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-065.
- **Scope:** Existing confirmed mapping wins; exact SKU versus Tally Part No/alias gives proposal, exact normalized name proposal, brand+fuzzy name review candidate, else unmapped. No silent fuzzy accounting match.
- **UI / keyboard:** Side-by-side Rallie item and Tally candidate radio list with names/stocks/confidence, None of these/Confirm mapping; keyboard selection and explicit unmapped/proposed/confirmed/rejected state.
- **API / security:** Proposed mapping list/propose/confirm/reject endpoints validate owner/employee and same business/connection/company/item; expected version prevents races. Confidence never bypasses confirmation, including high-confidence exact proposals.
- **DB / migrations:** `seller_product_tally_map` business/seller product/connection/item key/match_method/confidence/status/confirmed_by/at with scoped uniqueness and FKs. Define item-key stability and invalidation on company change/item removal.
- **Acceptance:** [ ] Confirmed mapping reused deterministically. [ ] Similar names cannot bill without confirmation. [ ] Another company/item ID rejected. [ ] Manual none/reject remains unmapped.
- **Evidence / notes:** _Pending: key stability decision, mapping fixtures, keyboard test._

### RAL-067 — Create missing Tally stock items only by explicit request
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-066.
- **Scope:** Unmapped item actions Create stock item in Tally / Map manually / Cancel; validate required UOM/master inputs and send typed create-item job. Do not auto-create every missing master during billing.
- **UI / keyboard:** Form/confirmation, pending, XML error, duplicate/existing item and success mapped state; keyboard cancellation and focus return to mapping list.
- **API / security:** Proposed stock-item create endpoint checks seller item, company, allowed fields and operation key; XML safely encoded. Existing matching names are not assumed to be newly created identities.
- **DB / migrations:** Durable cloud/local job intent/results; save returned stable Tally identity into items and confirmed mapping only after valid success/verification. Unknown result routes to reconciliation rather than blind create retry.
- **Acceptance:** [ ] Real Tally item creation acknowledged and mapping persisted. [ ] Duplicate request creates one item or reconciles existing. [ ] HTTP 200 with LINEERROR fails visibly. [ ] Cancel causes no accounting-side write.
- **Evidence / notes:** _Pending: real create-item response, restart/duplicate tests._

### RAL-068 — Preflight approved billing and resolve accounting context
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-067, RAL-031.
- **Scope:** Explicit Create bill in Tally only for current approved immutable revision. Check bridge online, confirmed correct company, every line mapped, required ledger/stock/UOM masters present, fresh stock and shortage warning. Tally remains tax/accounting authority.
- **UI / keyboard:** APPROVED — READY TO BILL, step-by-step preflight, actionable missing mapping/master/company errors and stock shortage warning with policy-controlled confirmation; no billing on view or approval by default.
- **API / security:** Proposed billing preflight takes revision/hash and expected quote version. Agree customer/ledger/GST/address/place-of-supply as needed, currency, quantities/UOM, tax-inclusive/exclusive rates, discount and configured voucher/tax ledgers. Block unresolved tax context instead of inventing GST engine.
- **DB / migrations:** Snapshot preflight findings/config version/company/mappings and approved context; billing request pins revision, not mutable draft. Record authorized shortage override if allowed.
- **Acceptance:** [ ] Each failed prerequisite blocks dispatch. [ ] Stock refresh precedes billing. [ ] Stale approval cannot bill edited quote. [ ] Accounting context sign-off recorded before real voucher work.
- **Evidence / notes:** _Pending: business/accountant decisions, preflight matrix._

### RAL-069 — Create normal Sales Vouchers and parse real Tally outcomes
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-068.
- **Scope:** Explicit seller action enqueues `CREATE_SALES_VOUCHER`, sends agreed customer/item/quantity/rate context through configured template and parses Tally import response. Normal Sales Voucher default; Optional Voucher remains deferred configurable option.
- **UI / keyboard:** Confirm company/approved total → queued/TALLY_PENDING → success BILLED with voucher number/master ID or TALLY_ERROR with actionable details. Accessible pending/result announcements; no optimistic billed badge.
- **API / security:** Proposed bill command uses idempotency key scoped by business/company/quote/revision and immutable payload hash. Parse CREATED/ALTERED/ERRORS/LINEERROR; HTTP 200 is not success. Verify returned identity and reconcile computed taxes/totals with disclosed agreement policy.
- **DB / migrations:** Atomic durable job + quote pending event, persisted result and voucher identity; BILLED only after verified successful ACK. Tally owns accounting/inventory, Rallie quotation pricing; no bidirectional price overwrite loop.
- **Acceptance:** [ ] Real approved quote creates intended single Sales Voucher. [ ] Missing masters/import errors remain unbilled. [ ] Returned amounts/company match. [ ] View/approval cannot enqueue billing.
- **Evidence / notes:** _Pending: real voucher/XML evidence with PII redacted, accounting sign-off._

### RAL-070 — Make retries safe across ACK loss and uncertain Tally outcomes
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-069.
- **Scope:** Cloud and local ledger idempotency, durable claims/fencing and uncertain-result reconciliation. Handle connection drop after successful Tally write before cloud ACK, plus harder crash before local result persistence. Exactly-once delivery is not assumed.
- **UI / keyboard:** Retrying versus UNCERTAIN clearly distinguished; uncertain state blocks automatic resend and offers authorized reconcile/search/link-result workflow with confirmation/audit. Never label uncertain as safe failure.
- **API / security:** Same key/hash returns original ledger result. Before retrying unknown outcome, query by tested stable external correlation/reference and company. If Tally cannot prove existence/absence/uniqueness, manual reconciliation required; no invented idempotency guarantee from Tally.
- **DB / migrations:** Persist before-send intent, correlation, lease/attempt, payload hash, result/voucher identity and reconciliation actor. Unique cloud job and completion transition; immutable payload across retries.
- **Acceptance:** [ ] Lost ACK returns original result and one voucher. [ ] Crash after write/before ledger becomes uncertain, not duplicate write. [ ] Changed payload/key reuse conflicts. [ ] Stale worker result cannot overwrite reconciled state.
- **Evidence / notes:** _Pending: fault-injection timings, reconciliation capability proof._

### RAL-071 — Deliver Tally operations UI and asymmetric sync visibility
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-065–RAL-070.
- **Scope:** Tally page connection/company/last seen, stock freshness/Sync now, mapping work, job history/errors/retry/reconcile and voucher links/results. Dashboard uses real connections/jobs. Owner settings handle pairing/company/revocation; Employee operational actions stay scoped.
- **UI / keyboard:** Loading/empty/disconnected/stale/wrong-company/unmapped/pending/error/uncertain/billed states; keyboard filters, mapping navigation and explicit retry confirmations. No misleading realtime inventory or mock-to-real blending.
- **API / security:** Proposed scoped status/jobs/detail/retry routes; safe error messages, redacted diagnostics and per-action policy. Retry only when protocol state permits, not generic resubmit of accounting writes.
- **DB / migrations:** Indexed job history and connection state queries; observations separate from seller prices. Tally→Rallie masters/stock/identities/selected rates/results; Rallie→Tally requested masters/approved customer/lines/quantities/rates/voucher requests only.
- **Acceptance:** [ ] All error states lead to a safe next action. [ ] Employee cannot re-pair company. [ ] Diagnostics reveal no secrets. [ ] No circular automatic price synchronization.
- **Evidence / notes:** _Pending: UI traces, operational role tests._

### RAL-072 — Close the accounting boundary with real Windows/Tally evidence
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-061–RAL-071.
- **Scope:** Real environment test matrix after fake protocol passes: pairing, service restart, stock sync, mapping, create-item, preflight and voucher creation in that order. Record supported Windows/Tally/company configuration.
- **UI / keyboard:** Owner setup and Employee billing end to end, offline recovery, wrong company, shortages, errors and uncertain reconciliation; keyboard and freshness checks.
- **API / security:** Revocation, forged device/result, malformed XML, duplicate delivery, mismatch hash and timeout tests. No inbound port opened, no MCP/AI in billing path.
- **DB / migrations:** Cloud and local ledger inspected with secrets/PII redacted; assert one quote revision, one effective billing job/result and one voucher after ACK-drop retry. Crash-before-local-persist case follows UNCERTAIN policy.
- **Acceptance:** [ ] Source's eight-step lost-ACK scenario passes with one bill. [ ] Real voucher verified in Tally. [ ] HTTP 200/error does not bill. [ ] Missing Windows/Tally access explicitly blocks this gate, regardless of fake success.
- **Evidence / notes:** _Pending: real test report, voucher IDs safely redacted, limitations/sign-off._

## 12. Free-tier and operational checkpoints

### RAL-073 — Instrument consumption, quality and integration reliability
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-072; instrumentation hooks are added within each earlier slice, not postponed until release.
- **Scope:** Internal last-24-hours page: Worker requests; D1 rows reads/writes; R2 storage; Workflows started/failed; AI extraction documents; median extraction time; rows extracted; rows requiring human correction; exact SKU match %; possible duplicate %; admin claims pending; Tally agents online; Tally job success %. Also capture AI neurons, Workflow steps/state, R2 operation classes and search latency/connectivity for scaling decisions.
- **UI / keyboard:** Admin-only metric tiles/table with period, units, denominator and freshness; missing measurement shown unavailable, not zero. Keyboard filters and accessible text, no charts required for seller Dashboard.
- **API / security:** Proposed `/api/admin/operations` uses aggregated/redacted application/provider metrics, least-privilege metrics access; no tokens/documents/customer PII. Define attempts versus logical-job success and exact full-SKU versus suffix metrics.
- **DB / migrations:** Bounded aggregates/telemetry retention; provider consumption not falsely derived solely from application estimates.
- **Acceptance:** [ ] Every named metric has source, denominator and test. [ ] Failure/retry data reconciles with jobs. [ ] Only admin can read operational totals.
- **Evidence / notes:** _Pending: metric dictionary, dashboards, telemetry overhead._

### RAL-074 — Document budgets, recovery, retention and operational runbooks
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-073, RAL-006.
- **Scope:** Budget warnings, secrets rotation, migration recovery, D1 restore drill, private R2 retention/orphan cleanup, failed workflow/run replay, claim recovery, stuck billing and bridge disconnect incident guides. Free-tier capable is not guaranteed ₹0 at scale.
- **UI / keyboard:** Internal budget/degraded-state messages with safe operator action; alerts never encourage blind uncertain-voucher retry. Accessible text and links.
- **API / security:** Least-privilege operator actions, audit recovery/replay, redacted logs/request IDs, backup access control, token/device revocation procedures. Define retention/deletion policy preserving legally needed evidence without assuming jurisdiction rules.
- **DB / migrations:** Restore/replay verification includes FKs, FTS rebuild, immutable sources/revisions, job leases and old artifacts; avoid restoring state that replays billed work blindly.
- **Acceptance:** [ ] Verify current provider quotas before release against baseline below. [ ] Budget thresholds and cap/degrade behavior configured. [ ] Restore and uncertain-billing runbooks exercised. [ ] Workflow/Queue retention cannot erase business truth.
- **Evidence / notes:** _Pending: dated provider verification, drill logs, thresholds/retention approvals._

### RAL-075 — Release gate for full vertical product and deployment
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-001–RAL-074.
- **Scope:** Fresh environment → Owner/Employee → seeded catalogue → quote/share/approve/PDF → ingest/review → admin price/merge → explicit seller adoption/relationships → paired Tally sync/map/create/bill. Ensure dependencies and deferred decisions are explicit, not hidden TODOs in shipped features.
- **UI / keyboard:** Desktop seller and mobile customer, slow network, keyboard-only journey, all loading/empty/error/permission states; no cost/profit public leakage and no accidental billing/PDF side effects.
- **API / security:** Run full role/tenant/IDOR/token/CSRF/idempotency/concurrency suite, live staging smoke and production config validation. Main CI deploy stays gated on provisioned credentials/resources and protected production approval.
- **DB / migrations:** Empty replay, previous-release upgrade, restore and rollback strategy validated with representative volume. External effects retain durable correlation after recovery.
- **Acceptance:** [ ] Every v1 ticket has evidence or explicit release-blocking status. [ ] Real AI/Windows/Tally gates satisfied before claiming them supported. [ ] Ops metrics/runbooks ready. [ ] Known limitations and deferred tickets approved. [ ] Deployed health and end-to-end smoke pass.
- **Evidence / notes:** _Pending: release checklist, build/deploy IDs, sign-offs and rollback owner._

### Operational baseline to verify, not a pricing guarantee

The brief quotes: Workers Free 100,000 requests/day and 10 ms CPU; D1 5 million rows read/day, 100,000 written/day and 5 GB storage; R2 10 GB-month, 1 million Class A and 10 million Class B operations/month, no Internet egress charge; Workflows 3,000 steps/day, 1 GB-month state and default three-day Free state retention; Workers AI 10,000 neurons/day. Document conversion can be free for ordinary documents, while image-heavy conversion may consume AI allowance. Waiting/sleeping Workflow steps do not consume CPU in the same way as active execution. Deferred Queues baseline: 10,000 operations/day, 24-hour Free retention. Verify all numbers, limits, regional availability and plan eligibility against current official documentation before provisioning; this backlog has not independently revalidated those claims.

Keep Worker API thin; measure hashing/conversion/large JSON CPU and upload sizes. Do not promise arbitrary PDF parsing on the Free CPU budget. D1 business state survives Workflow expiry; durable work records survive Queue loss. Monitor R2 request classes as well as storage, retries as well as successful runs, and original plus artifact retention.

## 13. Explicitly deferred increments — not v1 prerequisites

### RAL-076 — Expand customer proposals and opt-in approval/billing policies
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-075; **Release:** deferred; trigger: demonstrated customer self-edit usage or business security/automation need.
- **Scope:** Public seller-catalogue search/additions to proposals, optional OTP for sensitive approvals, and explicit business opt-in auto-send after approval. Keep no customer account by default and no auto-bill on page view under any setting.
- **UI / keyboard:** Customer adds Shower Arm, removes Basin Mixer, changes Diverter quantity; safe catalogue search/loading/no results, proposal diff and accessible OTP/consent controls. Owner toggle defaults off and explains accounting consequences.
- **API / security:** Capability-scoped public seller search returns safe carried-item DTOs only; customer cannot set discount/MRP/cost/unit price. OTP expiry/rate limits; automation invokes same revision/preflight/idempotent billing command, never bypasses it.
- **DB / migrations:** Add proposed seller-product references, OTP hash/attempt metadata and audited opt-in setting only when approved. New proposals remain immutable/reviewable.
- **Acceptance:** [ ] Measured need recorded. [ ] No cost/private catalogue leakage. [ ] Proposal acceptance creates reapproval-required revision. [ ] Auto-bill off by default and view read-only.
- **Evidence / notes:** _Pending: trigger metrics, policy approval, security tests._

### RAL-077 — Evaluate offline snapshots, richer search, ontology and voice only with evidence
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-075; **Release:** deferred; trigger: measured connectivity/search/usability failures.
- **Scope:** Keep D1 if search/counter connectivity adequate. Offline seller snapshot/SQLite-Wasm only if outages harm sales; dedicated search only if FTS ranking insufficient. Vector search, dynamic category/ontology, SKU-token learning, cross-brand equivalence, series/package inference and voice are separate optional experiments, never ingestion prerequisites.
- **UI / keyboard:** Explicit offline/stale/conflict labels and accessible typed fallback for voice; no hidden automatic canonical classification or new Compare mode.
- **API / security:** Versioned bounded sync/search contract with tenant isolation and revocation; no private cost/alias embeddings in shared indexes. Voice consent/privacy and authorization review required.
- **DB / migrations:** ADR covers snapshot versions, delta replication, conflicts/schema upgrades and second search-index rebuild costs before adding stores; no all-at-once ontology schema.
- **Acceptance:** [ ] Baseline telemetry proves need. [ ] Pilot improves measured success without weakening quote snapshots. [ ] Offline conflict/security and search-ranking tests pass. [ ] Reject experiment if complexity outweighs benefit.
- **Evidence / notes:** _Pending: experiment proposal, metrics and architecture approval._

### RAL-078 — Add extraction or orchestration fallback only at proven limits
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-075; **Release:** deferred; trigger: brand quality failure, measured CPU needs or Workflow limitation.
- **Scope:** Brand-specific extractor first; OCI container stage using Docling/MinerU only for documents needing heavy processing. Evaluate Temporal only if genuinely complex long-lived orchestration exceeds Workflows; do not introduce OCI as mandatory ingestion infrastructure or Docker in Cloudflare production.
- **UI / keyboard:** Explain parser fallback/version/retry and partial quality issues in existing job UI; keyboard source review unchanged. Human review remains durable outside expiring orchestration state.
- **API / security:** Existing extractor interface and typed job/artifact contract, authenticated scoped service access, bounded retries, no arbitrary untrusted URL fetch. Document regional data handling and costs.
- **DB / migrations:** New extractor version e.g. docling-v1 and reproducible artifacts; migration/rollback preserves claims and raw evidence. Durable reservations prevent fallback races double-publishing output.
- **Acceptance:** [ ] Trigger proven with corpus/CPU measurements. [ ] Quality improves on target brand without regression. [ ] Idempotency/provenance/cost gates pass. [ ] No replacement solely for architectural sophistication.
- **Evidence / notes:** _Pending: benchmark, hosting decision, pilot results._

### RAL-079 — Add fan-out, assisted moderation and alias promotion selectively
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-075; **Release:** deferred; trigger: actual fan-out or measured moderation backlog.
- **Scope:** Queue for notifications/analytics/secondary artifacts after global price publication only when needed. Rules-assisted trusted approval with explicit safeguards, never “three dealers = truth.” Admin may promote phrases used independently by many businesses; local aliases already work without approval.
- **UI / keyboard:** Admin rule/evidence preview, dry-run outcomes, alias promotion and override controls; accessible confirmation/audit and confidence limits, no opaque auto-publication.
- **API / security:** Durable outbox/work IDs; messages accelerate execution, never source of truth. Consumer idempotency, retries/dead-letter handling, tenant-safe telemetry and admin authorization for rules/promotions.
- **DB / migrations:** Outbox/decision rule versions and promotion provenance; Queue 24-hour retention cannot lose durable work. Preserve append-only prices and explicit seller adoption despite notification fan-out.
- **Acceptance:** [ ] Recorded workload justifies Queue/rules. [ ] Expired/lost/duplicate message recovered from D1. [ ] False consensus cases do not publish. [ ] Promoted aliases audited; no private commercial data exposed.
- **Evidence / notes:** _Pending: threshold/precision decision, replay tests, pilot results._

### RAL-080 — Improve bridge fleet, optional vouchers and MCP support tooling
- **Status:** TODO; **Owner:** agent/unassigned; **Dependencies:** RAL-075; **Release:** deferred; trigger: widespread agents or explicit business review needs.
- **Scope:** Signed auto-update/rollback, diagnostics/support bundles and optional voucher setting (normal Sales Voucher default; Optional Voucher awaits Tally regularization). Optional MCP tools: get_tally_status, list_stock_items, search_stock_item, get_stock, sync_catalogue, create_stock_item, create_sales_voucher, get_voucher.
- **UI / keyboard:** Owner update/status and normal/optional voucher choice, accessible confirmation and clear Not posted/awaiting Tally review state. Never show an Optional Voucher as final posted accounting without verification.
- **API / security:** MCP layers over existing typed capabilities with scoped authorization, explicit approval for writes and same idempotency/preflight; Create Bill button never routes through an AI/MCP reasoning agent. Sign update artifacts, redact diagnostics, prevent downgrade/replay.
- **DB / migrations:** Agent version/update audit and configured voucher policy/result subtype; preserve ledger compatibility across upgrades and uncertain execution state.
- **Acceptance:** [ ] Need/rollout approved. [ ] Interrupted update recovers without replaying bills. [ ] Optional voucher semantics verified in real Tally. [ ] MCP cannot bypass business/company/approval boundaries.
- **Evidence / notes:** _Pending: support/fleet metrics, threat model, Windows rollout evidence._

## Source section-to-ticket traceability

Ranges below are inclusive ticket IDs; referenced source line ranges use the supplied 2,405-line brief. They cover detailed screens, backend rules, tables, sequence gates and deferred architectural exclusions, not only headings.

| Source section / requirement | Tickets / binding decisions |
|---|---|
| [Architectural direction, footprint and rationale](../rallie-init.md#L3-L94): one cloud, Static Assets, D1/R2/AI/Workflow/DO, free-tier constraints, no early OCI/Vercel/offline/Queue | RAL-001–006, RAL-014, RAL-039–047, RAL-061–075, RAL-077–079; architecture contract |
| [Roles and authentication](../rallie-init.md#L95-L112): Owner/Employee/Customer/Admin and global-versus-seller principle | RAL-007–019, RAL-028–035, RAL-053–057; security contract |
| [Catalogue data inventory](../rallie-init.md#L114-L168): all entity families and immutable evidence/separate submissions | RAL-012–014, RAL-020–022, RAL-028, RAL-033, RAL-037, RAL-039, RAL-050–051, RAL-058–059, RAL-061–070 |
| [Identity matching and progressive trust](../rallie-init.md#L170-L237): exact SKU, possible duplicate, provisional products, admin authority, evidence strength | RAL-012–014, RAL-042, RAL-045, RAL-050–057; provisional/SKU gap decisions |
| [Seller overlay and per-product price history](../rallie-init.md#L238-L277) | RAL-013, RAL-016–018, RAL-022, RAL-054; effective-date and pricing decisions |
| [Relationships and search examples](../rallie-init.md#L278-L343) | RAL-014, RAL-045, RAL-058–060; exact versus suffix decision |
| [Navigation, shell and Dashboard](../rallie-init.md#L345-L408) | RAL-003, RAL-009–010, RAL-018, RAL-026, RAL-046, RAL-071 |
| [Catalogue tabs, search and pricing sheet](../rallie-init.md#L410-L482) | RAL-013–016, RAL-019 |
| [Product drawer and atomic adoption](../rallie-init.md#L484-L532) | RAL-017, RAL-058–060 |
| [New PDF update, presigned PUT and progress](../rallie-init.md#L534-L606) | RAL-039–044, RAL-046–047 |
| [PDF review, allowed edits, old/new pricing and commit](../rallie-init.md#L608-L696) | RAL-048–052 |
| [Single Build workspace, tabs, APIs, debounce and private profit](../rallie-init.md#L698-L771) | RAL-020–027, RAL-036, RAL-060 |
| [Public quotation screen and APIs](../rallie-init.md#L773-L812) | RAL-028–035, RAL-076 |
| [Admin queues, merge and publication](../rallie-init.md#L814-L857) | RAL-053–057, RAL-059 |
| [Durable ingestion, complete state machine and hash reuse](../rallie-init.md#L859-L961) | RAL-039–043, RAL-046–047, RAL-049–050 |
| [Extraction schema, confidence and semantic non-goals](../rallie-init.md#L962-L1000) | RAL-043–047, RAL-078 |
| [Normalization, conservative matching and claim fingerprints](../rallie-init.md#L1002-L1064) | RAL-014, RAL-042, RAL-045, RAL-050–055 |
| [Search scopes/ranking/local aliases](../rallie-init.md#L1066-L1123) | RAL-013–015, RAL-024, RAL-079 |
| [No initial Queue and persistent application job history](../rallie-init.md#L1125-L1167) | RAL-041–042, RAL-046, RAL-074, RAL-079 |
| [Quote revisions, state machine, exact approval and explicit billing](../rallie-init.md#L1169-L1278) | RAL-021–027, RAL-028–035, RAL-068–072, RAL-076 |
| [Quote line snapshots, integer-safe profit and public DTO](../rallie-init.md#L1280-L1333) | RAL-021–022, RAL-027, RAL-030 |
| [WhatsApp sharing, safe origin and hashed token](../rallie-init.md#L1335-L1372) | RAL-028–029, RAL-032, RAL-035 |
| [Customer proposals and catalogue-add second increment](../rallie-init.md#L1374-L1422) | RAL-033–035, RAL-076 |
| [Explicit-only PDF and immutable artifacts](../rallie-init.md#L1424-L1469) | RAL-036–038 |
| [Tally topology, Windows bridge, pairing and initial sync](../rallie-init.md#L1471-L1583) | RAL-061–065 |
| [Stock schedules/freshness and permanent mapping UI](../rallie-init.md#L1584-L1687) | RAL-065–067, RAL-071 |
| [Preflight, sales vouchers, XML response semantics, tax and optional voucher](../rallie-init.md#L1688-L1744) | RAL-068–070, RAL-072, RAL-080; tax-context gap decision |
| [Typed protocol, optional MCP and asymmetric two-way ownership](../rallie-init.md#L1745-L1811) | RAL-061, RAL-063–064, RAL-069–072, RAL-080 |
| [Exact vertical slice sequence and foundation gate](../rallie-init.md#L1813-L1872) | RAL-001–006; tracking rules; Docker local-only and provisioned-credentials gates are explicit user-request additions |
| [Identity slice gate](../rallie-init.md#L1874-L1895) | RAL-007–011, RAL-019, RAL-027 |
| [Minimal catalogue slice gate](../rallie-init.md#L1897-L1934) | RAL-012–019 |
| [Quotation slice and pricing tests](../rallie-init.md#L1936-L1988) | RAL-020–027 |
| [Sharing/revision slice and locking-before-proposals](../rallie-init.md#L1990-L2029) | RAL-028–035 |
| [Explicit PDF slice gate](../rallie-init.md#L2031-L2054) | RAL-036–038 |
| [PDF ingestion slice, extractor interface and all fixtures](../rallie-init.md#L2056-L2136) | RAL-039–047 |
| [Review/global evidence atomicity and two-business tests](../rallie-init.md#L2138-L2164) | RAL-048–052 |
| [Admin moderation slice audit/history](../rallie-init.md#L2166-L2201) | RAL-053–057 |
| [Relationships slice and explicit omission](../rallie-init.md#L2203-L2237) | RAL-058–060 |
| [Bridge slice, envelopes, ledger and lost-ACK scenario](../rallie-init.md#L2239-L2322) | RAL-061–072; uncertain-outcome decision |
| [Free-tier checkpoints, all metrics, escalation rules and final boundaries](../rallie-init.md#L2324-L2405) | RAL-073–080; operational baseline and architectural contract |

## Completion gate and handoff

A ticket is DONE only when its scope, UI/API/DB requirements, inherited security/accessibility/testing contracts and specific checkboxes have evidence. Record: named owner; commit/PR; migration names/versions and replay/upgrade output; executed tests with outcomes; browser/screenshots where applicable; provider/Windows integration evidence when required; remaining limitations; and review sign-off. Failed, unrun or mocked integration tests must be labeled as such.

**Foundation handoff:** RAL-001–005 may be verified locally with Docker and Cloudflare emulation; RAL-006 requires actual provisioned deployment evidence and otherwise remains TODO/BLOCKED. No foundation result closes later ingestion/AI/Tally tickets. Main-branch checks run without secrets; deployment is gated until credentials/resources exist.

**V1 release:** RAL-001–075 satisfied, with actual supported-environment evidence. If shipping a smaller quotation-only pilot, explicitly name that release boundary and keep later slices TODO/BLOCKED; do not call the entire plan complete. RAL-076–080 remain deferred unless separately authorized by trigger metrics and acceptance criteria.

**Limitations of this document:** Documentation only. No implementation, schema, installation, deployment, AI run, browser test or Windows/Tally verification was performed here. The brief's linked earlier research and opaque external citation placeholders were unavailable; provider quota/pricing claims are preserved as dated assumptions, not independently verified facts. Proposed endpoints, policy values and gap resolutions require review in their owning tickets.

**Recommendations:** Start with the local foundation gate, assign a named agent per active ticket, preserve slice boundaries, resolve pricing/revision/token policies before sharing, validate extraction on the supplied fixture matrix before scaling, obtain real Windows/Tally and accounting-context access before billing work, and use operational measurements—not anticipation—to activate deferred complexity.