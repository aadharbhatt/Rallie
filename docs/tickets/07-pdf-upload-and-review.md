# 07 — PDF upload, durable extraction and human review

Documentation-only decomposition; the 80 original parents in [IMPLEMENTATION](../IMPLEMENTATION.md) remain authoritative. Screen source: [DESIGN](../DESIGN.md), I1–I5 and shared §§5–6. This file owns no parent/index edits and makes no implementation claims.

**Parent coverage (14):** RAL-039, RAL-040, RAL-041, RAL-042, RAL-043, RAL-044, RAL-045, RAL-046, RAL-047, RAL-048, RAL-049, RAL-050, RAL-051, RAL-052.

**40 tickets:** ING-001–ING-040, each a roughly half-day feature or focused verification slice once dependencies exist. I1–I5 UI tickets come first, extraction/non-screen persistence and commit units follow separately. Forward references are intentional; execution follows the acyclic dependency graph, not numbering. `Parent gate RAL-xxx` names an original cross-file parent acceptance gate, never a speculative child. Do not equate a completed UI fixture with a completed backend gate.

## Working contract

- Owner/Employee requests resolve membership server-side, validate job/submission/source/row ownership through every join and use typed bounded schemas, safe error envelopes, CSRF/origin protection and request limits. R2 keys are not capabilities. Shared binaries never grant access to another business's submission, corrections, seller costs or source links; Platform Admin access needs a separate moderation grant.
- UI tickets include relevant loading, empty, ready, validation, pending, success, recoverable failure, permission/session expiry and stale/conflict states. Require native labels, visible focus, Tab/Shift+Tab and Enter/Space, no drag-only operations, safe Escape/unsaved protection, modal focus containment/restoration and no browser/IME shortcut interception. Prefer semantic table plus row editor over a partially implemented grid.
- D1 stores business truth and human review beyond Workflow retention. Workflows end at READY_FOR_REVIEW, never wait for humans. Private R2 retains immutable originals/conversion/extraction artifacts; correction layers never overwrite evidence. No initial Queue, always-on parser, WebSocket progress or silent mock fallback.
- Establish tested/configured byte/page/row limits, timeouts, retry budgets and D1 batch bounds rather than inventing provider limits. Atomicity is per declared bounded commit unit; large files use durable chunk manifests/checkpoints and truthful partial progress, not fictitious whole-file transactions.
- Every migration needs empty replay/upgrade tests with real local bindings. Automated assertions below use Vitest, local D1/R2/Workflow integration and Playwright as appropriate. Record commands, environment, commit, assertions and screenshots/traces under Evidence only when executed. Real AI quality evidence is separate from mock determinism; missing credentials remain a blocking limitation. All evidence is pending in this documentation task.

## I1 — New PDF update

### ING-001 — Select a PDF without automatically uploading it
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-040
- **Depends on:** Parent gate RAL-038
- **UI tasks:** Focused New PDF page with breadcrumb, Browse/drop zone, filename/size, real configured limit and Upload and process. Browse works by keyboard/touch; drag feedback is supplementary. Unsupported/oversized client feedback links errors to chooser; selection alone sends no bytes.
- **API/backend tasks:** Define/read safe supported-upload configuration contract; client validation is advisory, never authorization. No object grant until deliberate submission; hide secrets and bucket credentials.
- **DB tasks:** None.
- **Verify:** Select/drop/cancel files and navigate by keyboard; no upload request before action. Component tests cover empty/type/size states, actual limit display and a file with forged extension requiring later server validation.
- **Evidence:** pending.

### ING-002 — Collect optional brand and unknown effective date honestly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-040
- **Depends on:** ING-001
- **UI tasks:** Optional supplied/detected brand and effective-date controls; explain confirmation before commit and show Date not supplied rather than inventing today. Field errors retain input; Enter submits only outside IME composition and after explicit valid form action.
- **API/backend tasks:** Add nullable metadata to create-ingestion schema; validate date/brand identifiers and membership-scoped references. Metadata is submission context, not a way to rewrite an existing binary's immutable evidence.
- **DB tasks:** None; storage is established by ING-022.
- **Verify:** Upload setup with neither field, then explicit values: both valid paths preserve intent. Contract fixtures reject invalid dates/foreign private brand references; date omission remains null after round-trip.
- **Evidence:** pending.

### ING-003 — Transfer bytes using a scoped direct-upload grant
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-040
- **Depends on:** ING-002; ING-023
- **UI tasks:** Upload and process creates a job, PUTs file and completes upload; real transferred-byte progress only where available, otherwise indeterminate transfer. Pending/success/error announced politely; extraction progress is never included in byte percentage.
- **API/backend tasks:** Consume `POST /api/ingestions` → `{jobId,uploadUrl,r2Key}` and owned complete contract. Browser sends only granted object and configured type; credentials never reach client. Do not start extraction before verified completion.
- **DB tasks:** None; use ING-023 upload transitions.
- **Verify:** Observe browser request order create→PUT→complete and byte progress; selecting alone still sends nothing. Integration tests reject completion-before-upload/foreign key and double completion starts one logical ingestion.
- **Evidence:** pending.

### ING-004 — Cancel or renew an interrupted upload safely
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-040
- **Depends on:** ING-003
- **UI tasks:** Explicit cancel/retry and expired-grant recovery preserve chosen metadata; warn on leaving during transfer, but not after safe upload. Distinguish canceling transfer from stopping a durable job; retain keyboard focus on recovery control.
- **API/backend tasks:** Define owned uncompleted-job grant renewal and cancellation policy with bounded attempts; recheck completion before renewal. Abort client transfer only; signed URLs remain short-lived, and cleanup never deletes referenced evidence.
- **DB tasks:** Conditional canceled/renewed upload metadata and orphan eligibility timestamp; no new submission on a network retry.
- **Verify:** Expire grant mid-transfer, renew, complete and retry; one submission/job succeeds. Automated leave/cancel/completion-race and cleanup tests preserve referenced objects and never show processing success for an incomplete upload.
- **Evidence:** pending.

## I2 — Durable processing

### ING-005 — Show persisted stages and reuse truthfully
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-041; RAL-042
- **Depends on:** ING-024; ING-026
- **UI tasks:** Created/Uploading/Uploaded/Reading/Extracting/Matching/Ready stage list with text/icon, known row count and timestamps. Reuse says previously processed file found; no invented AI run or linear extraction percentage. Leave-screen reassurance only after safe upload; ready announces once with Continue review.
- **API/backend tasks:** Consume scoped safe job DTO with durable stage, nullable counts, reuse indicator and error class; no other submitter identity or provider internals. Ready does not auto-navigate.
- **DB tasks:** None; read persisted state, not Workflow UI memory.
- **Verify:** Run new/reused/failed fixtures and leave/reopen: actual server stage appears, unknown count is not zero. Automated state rendering and live-region tests show one ready announcement, no forced focus/navigation and no cross-business reuse detail.
- **Evidence:** pending.

### ING-006 — Poll active jobs with visibility-aware backoff
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-041
- **Depends on:** ING-005
- **UI tasks:** Stale/network-poll error differs from processing failure, with accessible Retry; background polls never steal focus or repeat announcements. Stop/back off on hidden tab and stop on ready/failed/completed terminal processing state.
- **API/backend tasks:** `GET /api/ingestions/:jobId` every approximately 2–3 seconds while active, bounded exponential backoff and cancellation on route change; no WebSocket. Enforce membership on every poll and handle removed access safely.
- **DB tasks:** None; reads do not regress stages or launch work.
- **Verify:** Fake-clock/visibility tests measure cadence/backoff/stop; reconnect resumes from persisted stage. Browser tests preserve focus and distinguish network outage from job failure; terminal refresh produces no workflow start.
- **Evidence:** pending.

## I3 — Import history, retry and source inspection

### ING-007 — List durable jobs and resume week-old review
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-046
- **Depends on:** ING-022; ING-024
- **UI tasks:** History table shows filename/submitted/effective date, stage, nullable rows/duration, safe error and Continue review/Retry/Open result. Empty→New PDF, filters/loading/retry and ordinary keyboard links; dashboard pending count comes from real state.
- **API/backend tasks:** Define bounded tenant-scoped job list/cursor/filter and pending-review aggregate; include failed jobs and stable chronological order. Reading week-old review never requires Workflow retention or restarts extraction.
- **DB tasks:** Index business/state/submitted time; aggregate persisted READY/REVIEWING jobs according to documented count semantics.
- **Verify:** Seed ready review older than a week, expire provider execution state, then open from history/dashboard: review remains. D1 list/pagination/tenant tests show correct counts, no duplicate page rows and no rerun on refresh.
- **Evidence:** pending.

### ING-008 — Retry an eligible failed run, not a new submission
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-046
- **Depends on:** ING-007; ING-024; ING-026
- **UI tasks:** Show failed stage/safe diagnostic ID and retry eligibility/budget; unsupported and validation failures offer corrective next steps, not blind Retry. Pending/retried/error states and keyboard action preserve history focus.
- **API/backend tasks:** Define owned retry command with expected job/run, operation key and deliberate extractor version choice. Bound retries, use durable operation identity and append an attempt; reject completed-job regression and unsupported retries, redact provider errors.
- **DB tasks:** Append attempt/run, retry count and safe last-error timestamps; keep submission ID and completed evidence immutable.
- **Verify:** Retry transient failure twice under one key: one new attempt, same submission. Automated stale/completed/foreign-job/over-budget tests fail safely; failed attempt remains inspectable and source/evidence bytes do not change.
- **Evidence:** pending.

### ING-009 — Inspect original source beside extracted and corrected values
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-046; RAL-048
- **Depends on:** ING-022; ING-027
- **UI tasks:** Lazy Open source shows page/row hint, raw/source text, original extraction and correction separately. Labeled page navigation, text fallback/accessibly named download on PDF failure, visible Close and opener focus restoration; no confidence substitute for decisions.
- **API/backend tasks:** Define submission-authorized source/locator/artifact reads and short-lived private download; validate source ownership through job/submission, not just shared document ID. Admin requires separate moderation grant and no implicit cost access.
- **DB tasks:** None; use immutable artifact/locator and separate correction references.
- **Verify:** Open page/row with keyboard, fail viewer and use text fallback. Automated cross-business source-key/locator and expired-grant tests deny access; correction changes never alter original displayed raw/extracted values.
- **Evidence:** pending.

## I4 — Decision-focused review

### ING-010 — Show review decision counts and filters
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-048
- **Depends on:** ING-031; ING-032
- **UI tasks:** Header/source/saved state plus Already in your catalogue/Known globally not carried/New/Need attention counts. All/Needs attention/Existing/New filters, search and loading/empty/error; manual keyboard tab activation. Explain overlapping attention counts rather than summing them as exclusive.
- **API/backend tasks:** Define bounded staged-row GET and server classification/count contract scoped to job/business; categories and warning overlaps are deterministic. No commercial write from opening/filtering review.
- **DB tasks:** Job/classification/attention indexes on staging; retain source/correction separation.
- **Verify:** Mixed-category fixture produces expected overlapping counts; filter by keyboard and clear no-results. Contract/tenant tests match row membership to counts and database diff proves no seller/global writes on open.
- **Evidence:** pending.

### ING-011 — Select rows and paginate without hidden bulk actions
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-048
- **Depends on:** ING-010
- **UI tasks:** Explicit page controls, row selection/carry intent and selected count; clearly label page-only bulk selection, never silently select other pages. Semantic table/row editor Previous/Next and stable focus; sticky bar must not cover cells.
- **API/backend tasks:** Contract uses stable row IDs and review version, bounded cursor order and explicit selection scope; validate job ownership of every selected ID. Selection persistence is delegated to the review-save contract, not catalogue writes.
- **DB tasks:** None; reuse staged-row identity and review selection layer.
- **Verify:** Select across two pages, filter, return and open row editor; selected count and focus remain predictable. Browser and contract tests reject foreign/duplicate IDs, reveal error-target rows before focus and keep unselected rows untouched.
- **Evidence:** pending.

### ING-012 — Compare extracted MRP with existing seller pricing
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-048
- **Depends on:** ING-010
- **UI tasks:** Show raw/corrected new MRP beside existing seller MRP/cost/default discount/default quote/carried state and amount/percent movement. Decision labels include missing fields, conflicting price, duplicate row and excluded; unknown cost remains unknown, no confidence clutter.
- **API/backend tasks:** Extend scoped row DTO with current-business commercial comparison and server-calculated movement under money rules; no other seller values or read-triggered adoption. Handle missing/zero denominator without invented percent.
- **DB tasks:** None; authorized joins to seller overlay and staged evidence.
- **Verify:** Open existing/new/conflicting/unknown-cost rows: correct side-by-side values and warnings, no writes. Automated tenant/payload tests deny foreign costs and golden movement tests handle paise, missing and zero baseline explicitly.
- **Evidence:** pending.

### ING-013 — Decide Same product or Different product explicitly
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-045; RAL-048
- **Depends on:** ING-010; ING-030
- **UI tasks:** Candidate identities/reasons side by side, explicit Same/Different controls and source link; map POSSIBLE_DUPLICATE to consistent Possible match terminology. Unresolved ambiguity blocks affected selected rows; exclusion remains possible. Keyboard decision preserves row context.
- **API/backend tasks:** Define review match-decision schema against authorized candidate IDs/current normalization version; exact full brand+SKU only auto-links. Similarity and suffix hits never authorize a merge, cross-business provisional match or approved status.
- **DB tasks:** Selected match/decision/reason in correction layer, separate from extracted identity and original candidate set.
- **Verify:** Similar distinct SKUs and suffix `079n` require deliberate decision; Same/Different round-trip through fixtures. Automated tampered/foreign candidate and stale decision tests fail without changing global identity or raw extraction.
- **Evidence:** pending.

### ING-014 — Correct identity text and MRP in a bounded row editor
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-049
- **Depends on:** ING-011; ING-012; ING-032
- **UI tasks:** Edit only Brand, SKU/product ID, name, description and MRP with original/extracted/corrected distinctions. Product-labeled errors, dirty state, Previous/Next and close protection; no category/series/ontology fields. Missing/zero/negative price follows explicit domain policy, never silent coercion.
- **API/backend tasks:** Typed allowlisted row-correction PATCH under expected review version and nested ownership; validate integer paise/precision and required selected fields. Reject posted approved flags, arbitrary fields and raw-evidence replacement.
- **DB tasks:** None beyond ING-032 versioned correction storage; never UPDATE immutable extraction values.
- **Verify:** Correct missing name and comma/₹ price, save, reopen source: original stays identical. Automated field injection/invalid-price/stale-row tests preserve input and reject invalid writes without publishing facts.
- **Evidence:** pending.

### ING-015 — Edit carry, optional cost and default discount separately
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-049
- **Depends on:** ING-014; Parent gate RAL-013
- **UI tasks:** Carry selection, optional cost and default discount with existing versus proposed values and derived default quote preview. Null cost is not zero; field errors/dirty/pending states and ordinary numeric keyboard editing do not overwrite shop values on opening.
- **API/backend tasks:** Extend review correction schema with allowed seller-only pricing intent; shared precision/discount/precedence rules compute preview, server revalidates at commit. Reject cross-business overlay references and inferred global approval.
- **DB tasks:** Store proposed carry/cost/discount in correction layer only; seller overlay is unchanged until commit.
- **Verify:** Toggle carry, enter/clear cost and change discount, then cancel/save. Automated golden calculations match seller policy; review save changes no live pricing, preserves null cost and remains tenant-private.
- **Evidence:** pending.

### ING-016 — Confirm brand and surface selected-row blockers
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-049
- **Depends on:** ING-013; ING-014; ING-015
- **UI tasks:** Explicit confirmed brand, optional unknown effective date and blocker summary for selected identity/name/price/match requirements. Error links reveal filtered/paginated row before focusing field; excluding an unresolved row unblocks only valid remaining selection.
- **API/backend tasks:** Return authoritative validation/confirmation result under review version; brand confirmation is mandatory at commit but not upload. Do not auto-fill date, resolve fuzzy matches or approve claims from client state.
- **DB tasks:** Persist explicit brand confirmation and nullable effective-date context in versioned review metadata, not immutable source bytes.
- **Verify:** Attempt commit preview with unconfirmed brand/missing name/price/possible match: precise blockers. Automated selection tests allow explicit exclusion, retain unknown date and reject stale/forged confirmation.
- **Evidence:** pending.

### ING-017 — Save review for later into durable D1 state
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-049
- **Depends on:** ING-016; ING-032
- **UI tasks:** Save review for later with Dirty/Saving/Saved/Retry and leave protection; persist selections, corrections and decisions. Loading/resume restores server state and keyboard focus context; offline never claims Saved.
- **API/backend tasks:** `PATCH /api/ingestions/:jobId/review` with expected review version and bounded correction/selection batch; serialize updates, validate membership and return durable saved version. No Workflow wait/restart or catalogue publication.
- **DB tasks:** Use versioned D1 review/correction records and REVIEWING state with actor/time; no Workflow-retention dependency.
- **Verify:** Save, close browser, expire Workflow state and resume one week later: all choices remain. D1/network-failure tests preserve originals, retain local unsaved input and assert no seller/global/claim writes on save.
- **Evidence:** pending.

### ING-018 — Resolve concurrent reviewers without losing corrections
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-049
- **Depends on:** ING-017
- **UI tasks:** Conflict shows your versus saved correction/selection with deliberate reload/reapply choices; retain local values and focus conflict summary. Block commit while unresolved; navigation/close uses dirty-resolution flow.
- **API/backend tasks:** Stable conflict response with authorized current review version; deliberate reapply uses fresh version, not force overwrite. Reject stale confirmation/selection hashes and ignore obsolete client responses.
- **DB tasks:** None; exercise compare-and-swap review writes and correction audit.
- **Verify:** Two reviewers edit same row/selection; only one version succeeds, other retains input. Automated out-of-order/save-failure/reapply tests demonstrate no silent loss and immutable raw evidence after both attempts.
- **Evidence:** pending.

## I5 — Commit preview, progress and result

### ING-019 — Preview exactly the saved selection and seller impact
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-050
- **Depends on:** ING-018; ING-034
- **UI tasks:** Preview adds/price changes/unchanged/excluded/blocked rows, selected count, actual seller MRP impact and brand/date confirmation. Explain shop gets selected changes now, global claims await admin; zero selection blocks Confirm. Modal Cancel/explanation initial focus.
- **API/backend tasks:** Consume authorized server preview tied to review version/selection hash; no client raw-table-as-truth. Revalidate matches/pricing/brand; preview only, no claim or overlay write.
- **DB tasks:** None; read versioned review and seller overlay.
- **Verify:** Change selection after preview: old confirmation conflicts and requires review. Automated counts/price-impact/tenant tests match saved rows, keep unknown date and prove opening/canceling preview changes nothing commercial.
- **Evidence:** pending.

### ING-020 — Report real commit units and resume only unapplied work
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-050
- **Depends on:** ING-019; ING-036
- **UI tasks:** COMMITTING/progress/failed/retry with duplicate guard and keyboard recovery. Show declared units completed versus remaining; fully rolled-back unit says nothing applied, partial file only when durable checkpoints prove it. Leaving screen does not imply cancellation.
- **API/backend tasks:** Call commit with expected review version, selection hash and idempotency key; poll authorized durable outcome, replay same logical operation and resume only unapplied manifest units. Changed payload under key conflicts.
- **DB tasks:** None; read durable ownership/manifest/checkpoints from ING-034–ING-036.
- **Verify:** Crash after one chunk then resume: UI reports exactly committed rows, not whole-file success/rollback. Parallel click/lost-response tests yield one outcome, no repeated claims and no per-row seller/claim split.
- **Evidence:** pending.

### ING-021 — Show immediate seller results separately from pending global evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-050; RAL-052
- **Depends on:** ING-020; ING-033; ING-038
- **UI tasks:** Result counts applied/skipped/failed, pending-global notice and Open My Catalogue; already-committed reopen is read-only. Link to own submission evidence and safe quote-search handoff; keyboard result heading/actions and retry only for unapplied units.
- **API/backend tasks:** Consume authorized durable commit result and own-submission evidence summary; no other business evidence details. Local provisional display/cost/discount become immediately usable, never mislabeled globally approved.
- **DB tasks:** None; read overlay/result/claim lineage without reapplying writes.
- **Verify:** Correct seller name, commit and find it in My Catalogue/Build before moderation: local display is usable, global remains unchanged. Automated reopen/private-global-search tests show no repeated commit or provisional leak and keep ignored rows untouched.
- **Evidence:** pending.

## Non-screen backend — evidence, upload validation and durable execution

The following backend units are prerequisites for the UI tickets above. Their UI field is explicitly N/A except for safe status contracts; no standalone backend screen is implied.

### ING-022 — Separate immutable documents, independent submissions and run history
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-039
- **Depends on:** Parent gate RAL-038
- **UI tasks:** N/A; provide source/run/job vocabulary and safe nullable status fields for I1–I3, never editing controls for originals.
- **API/backend tasks:** Define typed document/submission/run/job/staged-row identities and authorization joins. Distinguish retry request identity from independent submissions; shared document possession is never access authority.
- **DB tasks:** Migrate `source_documents` unique sha256/private key/mime/parse metadata, independent business/uploader/time submissions, versioned extraction runs/artifacts/errors, jobs/stage/progress/attempt/timestamps and staged locator/raw/extracted fields. Separate submission-specific supplied metadata/corrections from immutable binary/run evidence; restrict destructive cascades.
- **Verify:** Replay/upgrade migrations, insert same binary with two submissions and inspect ACL joins: one document, distinct histories. Automated immutability/FK/tenant tests prevent rewriting raw evidence and source access through a foreign submission.
- **Evidence:** pending.

### ING-023 — Validate uploaded objects before idempotent completion
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-040
- **Depends on:** ING-022
- **UI tasks:** N/A; return actionable validation, unsupported/encrypted/malformed, grant-expired and retryable diagnostics for I1 without credentials/provider details.
- **API/backend tasks:** Implement authenticated create/grant and complete contracts with private short-lived PUT, narrow bucket CORS and upload/extraction rate limits. Verify owned object key/actual PDF signature/content/type/configured byte/page limits, hostile/encrypted policy and complete-before-upload. Completion records durable start intent once; workflow dispatch consumes it.
- **DB tasks:** Bind object key to job and CREATED/UPLOADING/UPLOADED conditional transitions; unique completion operation/payload and dispatch intent. Mark safe orphan cleanup eligibility without deleting referenced sources.
- **Verify:** Local R2 tests cover forged MIME/key/job, oversize/page limit, malformed/encrypted data, expired grant and early complete. Parallel completion produces one dispatch intent; failed validation starts no extraction and cleanup preserves referenced evidence.
- **Evidence:** pending.

### ING-024 — End the durable workflow at ready-for-review
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-041
- **Depends on:** ING-023; ING-026; ING-027; ING-030
- **UI tasks:** N/A; persist truthful safe stages/counts/errors for I2 rather than synthetic percentages or provider-state-only progress.
- **API/backend tasks:** Dispatch durable operation from upload intent; orchestrate validate→fingerprint→reuse or convert/extract/persist→normalize/match→stage→READY_FOR_REVIEW. Bound retry/backoff per step, classify retryable versus unsupported/validation failure, replay safe steps and never wait for human input. Real adapter gate remains ING-029/ING-031.
- **DB tasks:** Persist workflow ID, stage progress/attempt/time, conditional monotonic transitions and unique stage-materialization keys in D1; READY ends workflow while review survives independently.
- **Verify:** Restart at each transition using explicit deterministic adapter: work resumes without duplicate staging or completed-job regression. Delete/expire Workflow state after READY and load D1 review a week later; no waiting workflow and no implicit rerun.
- **Evidence:** pending.

### ING-025 — Fingerprint verified object bytes and reuse one binary record
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-042
- **Depends on:** ING-023
- **UI tasks:** N/A; expose reuse outcome without other business names and a safe over-limit diagnostic for I2.
- **API/backend tasks:** Compute SHA-256 from verified R2 bytes, never accept client hash as proof. Measure hashing CPU/memory over supported file limits and reject/degrade explicitly beyond tested bounds; metadata-different/scanned files may legitimately hash differently.
- **DB tasks:** Resolve unique binary hash under concurrent insert; attach independent submissions without conflating retry identity. Compensate duplicate temporary objects only after durable canonical reference succeeds.
- **Verify:** Concurrent identical uploads yield one source object reference and two submissions; retry does not create another submission. Local R2/D1 tests cover hash spoofing, uniqueness race and cleanup crash; record real runtime measurements before choosing limits.
- **Evidence:** pending.

### ING-026 — Fence extraction ownership by document and extractor version
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-042
- **Depends on:** ING-025
- **UI tasks:** N/A; safe reused/waiting/retryable-failed status feeds I2/I3 without revealing another submission.
- **API/backend tasks:** Reserve document+extractor version with durable lease/attempt/fencing; reuse only compatible successful output. Expired-lease recovery checks fencing on publication and staging; incompatible version starts explicit new run, not overwrite.
- **DB tasks:** Unique extraction ownership key, lease expiry/attempt/fence, immutable successful run reference and unique submission-stage materialization keys; no process-local lock as authority.
- **Verify:** Barrier-run A/B identical uploads: one extraction and independent staging/reviews. Crash owner, recover, then let stale worker publish: rejected. Automated tests prove no duplicate rows, no newer-result overwrite and deliberate version reprocess leaves old artifacts intact.
- **Evidence:** pending.

## Non-screen backend — extraction and conservative matching

### ING-027 — Define the versioned extractor and explicit deterministic mock
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-043
- **Depends on:** ING-022
- **UI tasks:** N/A for adapter; expose prominent mock-mode marker to I2/I3 fixtures, with normal failure presentation rather than fake success.
- **API/backend tasks:** Define `CatalogueExtractor.extract(ParsedDocument): Promise<ExtractedCatalogue>` with brand/date, page/row locator, SKU/name/description/MRP and internal field confidence. Strict structured validation treats PDF text as untrusted data; mock requires explicit opt-in, is forbidden in production and missing real credentials fails closed. No tools/canonical writes from model output.
- **DB tasks:** Store extractor/artifact schema versions and immutable source text/extracted values separately; stable unique run/locator/row key. Confidence never becomes approval.
- **Verify:** Deterministic fixtures repeat identical output and explicit failure cases; invalid shape/tool-like instructions are rejected as data. Automated mode guards prove no silent mock fallback or ontology/paired SKU/equivalence promoted to truth.
- **Evidence:** pending.

### ING-028 — Convert private PDFs through the real Workers AI binding
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-044
- **Depends on:** ING-027; ING-026
- **UI tasks:** N/A; emit distinct reading/conversion/unsupported/failed diagnostics and timing for I2 without claiming extraction correctness.
- **API/backend tasks:** Integrate server-only `toMarkdown` from authorized private R2 reference; explicit privacy review, byte/page/call/time/retry bounds and image-heavy/unreadable failure handling. No mandatory external parser server or exposure of binding credentials.
- **DB tasks:** Persist immutable conversion artifact, source locators, converter version, timing and safe errors on run; original PDF unchanged.
- **Verify:** Run real digital and image fixtures with binding, inspect retained conversion output and limits. Automated timeout/provider/malformed tests classify conversion failures separately; absent credentials block real gate and mock logs cannot close this ticket.
- **Evidence:** pending.

### ING-029 — Extract and validate structured rows with the real model
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-044
- **Depends on:** ING-028
- **UI tasks:** N/A; expose extracting/validation-failed status and deliberate version/run retry choice, never “JSON valid therefore accurate.”
- **API/backend tasks:** Implement versioned real extractor (for example cf-ai-v1) with bounded input/output/calls/timeouts/retries, prompt-injection-resistant instructions and strict result validation. No inferred functional slot/category/series/paired SKU/equivalent/sales package becomes approved fact; explicit useful text remains evidence only.
- **DB tasks:** Persist original model output and validated artifact/model/extractor version, field locators, timing and errors; never replace previous successful run artifacts.
- **Verify:** Compare real digital/image extraction to ground truth and retain raw outputs; distinguish model failure from schema validation and conversion errors. Adversarial PDF text cannot invoke tools/write catalogue, and missing service remains explicit limitation rather than mock success.
- **Evidence:** pending.

### ING-030 — Normalize full identity and stage conservative match candidates
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-045
- **Depends on:** ING-027; ING-026; Parent gate RAL-014
- **UI tasks:** N/A; define exact/possible/new/missing-field decisions and POSSIBLE_DUPLICATE→Possible match vocabulary for I4, preserving advisory reasons.
- **API/backend tasks:** Normalize brand/full SKU punctuation/case; full normalized brand+SKU equality links approved identity, otherwise same-brand FTS top five candidates require decision, else new provisional candidate. Scope private evidence; never fuzzy merge or treat suffix as exact. Real extraction integration is verified by ING-031.
- **DB tasks:** Store normalization version, candidate IDs/reasons and selected decision separately from raw/extracted fields; idempotent staged rows per submission/run/locator.
- **Verify:** KUP-CHR/KUP CHR/KUP/CHR normalize consistently; similar SKUs remain distinct and `079n` is not full exact identity. Real D1 tests enforce candidate cap/brand/tenant constraints, replay retains originals and no pending evidence is globally published.
- **Evidence:** pending.

### ING-031 — Score extraction fixtures against source ground truth
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-047
- **Depends on:** ING-024; ING-028; ING-029; ING-030
- **UI tasks:** Test only: verify expected decision/reviewability and locator navigation contracts for consuming I2/I4; schema-valid JSON alone is not acceptance.
- **API/backend tasks:** Ground-truth corpus: digital/multipage tables, repeated headers, missing SKU/price, comma/₹ price, duplicate row, same file twice, changed price, similar SKUs, malformed/image-heavy inputs. Report field accuracy and failure classes separately for real AI and deterministic mock.
- **DB tasks:** None; inspect staged rows/locators and immutable original/output retention for corpus runs.
- **Verify:** Execute corpus through local pipeline and real binding where available; each fixture records expected/actual fields, decisions and source locator. Missing credentials or unmet accuracy criteria remain blocking; do not close with mock-only evidence or auto-approve low-error rows.
- **Evidence:** pending.

## Non-screen backend — durable human correction and commit units

### ING-032 — Persist versioned review corrections independently of evidence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-049
- **Depends on:** ING-022; ING-030
- **UI tasks:** N/A; expose durable review version, field errors and safe conflict states for I4, with explicit raw/extracted/corrected projection.
- **API/backend tasks:** Specify bounded review GET/PATCH allowing only identity text/MRP/carry/cost/discount/match/confirmation fields. Check tenant/job/row membership and expected version, reject approved-status injection and source-evidence mutation. Save is not commit/publication.
- **DB tasks:** D1 review header/version/brand/date/selection and correction/match records with actor/time and audit; conditional bounded batch writes enter REVIEWING. Preserve immutable artifacts and raw staged fields; no Workflow state dependency.
- **Verify:** Parallel reviewer PATCH yields one update plus conflict, not last-write-wins. Automated week-later reload after Workflow expiry restores selections/corrections; immutable-source hashes and global/seller tables remain unchanged; migration replay passes.
- **Evidence:** pending.

### ING-033 — Resolve seller-private provisional identity and display overrides
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-045; RAL-050
- **Depends on:** ING-032; Parent gate RAL-012; Parent gate RAL-013
- **UI tasks:** N/A; provide local/provisional versus globally approved labels and corrected display DTOs for I5/My Catalogue/Build, without an extra identity screen.
- **API/backend tasks:** Finalize parent policy before commit: new identity is PROVISIONAL, origin-business/claim anchored and hidden from global/public search; exact text is not public approval. Corrected brand/SKU/name/description resolve through private overlay snapshots. Handle cross-business provisional collisions without revealing submissions; future publish/merge redirects must not rewrite quote history.
- **DB tasks:** Add/validate provisional status/origin references and private display override fields with scoped uniqueness/FKs; selected approved identity retains immutable global text. Introduce schema seam for later claim link without dangling references.
- **Verify:** Two businesses submit same new SKU: each authorized private view works without leakage; public/global search excludes both pending identities. Automated quote snapshot test uses corrected display before moderation and retains it after later global text change.
- **Evidence:** pending.

### ING-034 — Claim a commit operation bound to saved review and selection
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-050
- **Depends on:** ING-032; ING-033
- **UI tasks:** N/A; expose preview/blockers and safe owned/in-progress/conflict outcome for I5, never treating a browser lock as durable ownership.
- **API/backend tasks:** Define preview and `POST /api/ingestions/:jobId/commit` expected review version/selection hash/key. Server reads saved review, revalidates tenant/selected rows/brand/matches/pricing and canonical payload; acquire durable fenced ownership. Same key/different content conflicts, retry returns/resumes same operation; review changes cannot alter a claimed manifest.
- **DB tasks:** Commit operation unique business/job/key, frozen payload/review/selection hash, owner attempt/fence/state/result and conditional review-to-COMMITTING transition; no commercial writes in preview.
- **Verify:** Parallel commits on same review produce one owner/outcome, altered selection under key conflicts. D1 tests reject foreign rows/stale version/unconfirmed brand and prove a crash after claim can recover without allowing a stale owner to write.
- **Evidence:** pending.

### ING-035 — Atomically apply one seller-plus-claim commit unit
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-050
- **Depends on:** ING-034; ING-037
- **UI tasks:** N/A; define unit applied/rolled-back result for I5; a rolled-back unit must never appear partially successful.
- **API/backend tasks:** Apply a declared bounded unit (row or measured small batch) from server-frozen review under ownership fence. Compute seller overlay updates and pending product/price claims together, with audit/provenance; reject invalid state and never publish canonical facts. Do not accept client raw table as source.
- **DB tasks:** Add `product_claims`/`product_price_claims` source/business/raw-vs-corrected provenance/status and tested unique fingerprints; bounded D1 batch atomically writes overlay+claim+audit+unit checkpoint. Corrected seller name is immediate; global row unchanged.
- **Verify:** Inject failure at each write in unit: either complete seller/claim/audit/checkpoint or none. Replay and concurrent apply create no duplicate claims; local D1 tests retain source bytes/global values and apply private display/cost/discount correctly.
- **Evidence:** pending.

### ING-036 — Resume large commits through bounded chunk checkpoints
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-050
- **Depends on:** ING-035
- **UI tasks:** N/A; expose real per-unit/chunk counts and remaining/error result for I5; explicitly document partial-file semantics versus per-unit atomicity.
- **API/backend tasks:** Measure statement/parameter/row limits and establish deterministic immutable chunk manifest; process bounded units with fences, retry budget and checkpoint resume. Retry only unapplied units; cancellation/failure cannot claim rollback of already durable chunks. Finalize only after every unit outcome is known.
- **DB tasks:** Commit manifest/chunk order/content hash/checkpoint/attempt/error and final result counts; uniqueness ties units to operation and saved review. Prevent lease-expired worker from recording a newer unit outcome.
- **Verify:** Commit a file beyond one batch, crash before/after checkpoint, retry concurrently: applied units stay once, remaining units resume. Boundary tests verify truthful partial progress, no whole-file atomicity claim and no partial seller/claim pair inside a unit.
- **Evidence:** pending.

## Non-screen backend — evidence strength and recovery gates

### ING-037 — Fingerprint row and claim evidence without inflating independence
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-051
- **Depends on:** ING-022; ING-033
- **UI tasks:** N/A; supply stable evidence categories for later summaries; same-file submissions are not presented as multiple parses.
- **API/backend tasks:** Specify versioned row/claim fingerprints including product, normalized MRP, effective context, source document and business; canonical unknown-date sentinel differs from supplied date. Distinguish same-business retry, independent submission, same binary and metadata-different corroborating rows; preserve original/correction provenance.
- **DB tasks:** Fingerprint version/unique keys and provenance FKs/indexes; separate submission references from deduplicated claim/evidence identity so repeat uploads remain traceable without inflating business counts.
- **Verify:** Golden datasets cover same seller retry/re-upload, A/B identical file, metadata-different documents and conflicting prices/dates. Automated counts/uniqueness tests keep independent businesses stable and do not collapse distinct evidence context or overwrite source/corrections.
- **Evidence:** pending.

### ING-038 — Aggregate evidence strength without automatic approval
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-051
- **Depends on:** ING-037; ING-035
- **UI tasks:** Read-only reusable summary contract/presentation: independent businesses, documents, matching rows/conflicts, unknown dates and own source filename/page/row. Keyboard source links are labeled; seller sees own submission only. Full admin queue screen remains outside this file.
- **API/backend tasks:** Define platform-admin evidence summary route with separate moderation grant and seller-own summary projection; group product/MRP/effective context, expose conflicts rather than resolve them. Counts never trigger approved status; no implied access to seller cost from admin privilege.
- **DB tasks:** Aggregate indexes over fingerprints/provenance and safe scoped views/queries; no approval trigger or source/correction rewrite.
- **Verify:** Seven businesses/three documents dataset reports seven/three despite retries; same-file support differs from distinct document support. Automated ACL/conflict/unknown-date tests pass and DB assertions prove any evidence count leaves global approval unchanged.
- **Evidence:** pending.

### ING-039 — Fault-test upload, run ownership and commit recovery boundaries
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-047; RAL-050
- **Depends on:** ING-024; ING-026; ING-036
- **UI tasks:** Test only: feed expiry/retry/partial/permission outcomes into consuming progress and commit fixtures; safe diagnostics never claim completed work that rolled back.
- **API/backend tasks:** Local-binding adversarial matrix: concurrent completes/retries, expired uploads, unauthorized jobs/artifacts, oversized input/output tampering, worker crash at each step, expired owner publication and lost commit response. Verify bounded retries and no production mock fallback.
- **DB tasks:** None; replay/upgrade migrations and inspect immutable documents/runs, independent submissions, unique staging, ownership fences and bounded unit checkpoints after each injected failure.
- **Verify:** Each scenario produces traceable attempt history and one durable logical outcome; no duplicate stages/claims, source leak or per-unit split. Ready review survives provider-state deletion; document known emulator/real-service limitations rather than claiming absent real AI evidence.
- **Evidence:** pending.

### ING-040 — Verify corrected seller value before global publication
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-052
- **Depends on:** ING-004; ING-006; ING-007; ING-008; ING-009; ING-021; ING-031; ING-038; ING-039; Parent gate RAL-027
- **UI tasks:** Test only: keyboard upload→review missing name/possible match→carry/cost/discount→save/resume→commit→My Catalogue→Build; include selected blockers, excluded rows, partial failure and corrected provisional display.
- **API/backend tasks:** Run two-business identical-upload journey, same commit replay, changed selection under reused key, concurrent commits and foreign source/row references. Use actual authorized seller quote search and safe global search, not fixture-only success.
- **DB tasks:** None; assert one compatible extraction/two submissions/two independent businesses, no duplicate B claims, immutable source/extraction, corrected seller overlay, pending claims and unchanged approved global truth.
- **Verify:** Week-later resume and crash/retry retain review and atomic unit results; provisional item can be quoted before admin publication yet never appears in public global search. All original review invariants pass with real AI results separately identified; unresolved real-service gates remain blocking, not marked complete by this ticket's mock path.
- **Evidence:** pending.

## Screen integration checklist — all pending

- [ ] I1: ING-001–ING-004 use ING-022–ING-023 for secure direct upload; selection alone sends nothing, completion is verified, retry preserves submission identity.
- [ ] I2: ING-005–ING-006 consume persisted ING-024–ING-030 progress; reuse is honest, polls do not steal focus, READY ends workflow rather than waiting on review.
- [ ] I3: ING-007–ING-009 resume durable old reviews and append bounded attempts; source viewer separates raw/extracted/corrected and enforces submission ACL.
- [ ] I4: ING-010–ING-018 cover counts/filter/pagination/selection/comparison/match/correction/pricing/brand/save/conflict; ING-032 stores review in D1 independent of Workflow retention.
- [ ] I5: ING-019–ING-021 preview saved selection and consume ING-033–ING-038 durable commit/evidence outcomes; corrected provisional seller products work immediately and all global claims remain pending.
- [ ] Extraction: ING-031 records source-grounded real and mock quality separately; unsupported real service is a blocker, not silent fallback.
- [ ] Concurrency: ING-039 proves hash reuse/fencing/independent submissions/atomic units/chunk recovery before ING-040 closes the seller-value slice.
- [ ] Full admin moderation/publication/merge remains Parent gate RAL-053 through Parent gate RAL-057; no evidence count or human seller correction substitutes for those decisions.

## Parent-to-child map

| Parent | Child tickets |
| --- | --- |
| RAL-039 | ING-022 |
| RAL-040 | ING-001–ING-004, ING-023 |
| RAL-041 | ING-005–ING-006, ING-024 |
| RAL-042 | ING-005, ING-025–ING-026 |
| RAL-043 | ING-027 |
| RAL-044 | ING-028–ING-029 |
| RAL-045 | ING-013, ING-030, ING-033 |
| RAL-046 | ING-007–ING-009 |
| RAL-047 | ING-031, ING-039 |
| RAL-048 | ING-009–ING-013 |
| RAL-049 | ING-014–ING-018, ING-032 |
| RAL-050 | ING-019–ING-021, ING-033–ING-036, ING-039 |
| RAL-051 | ING-037–ING-038 |
| RAL-052 | ING-021, ING-040 |