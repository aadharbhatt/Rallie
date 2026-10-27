# Access and settings — screen-first tickets

Sources: [parent requirements](../IMPLEMENTATION.md), [design inventory and A1–A4/S1–S5 specifications](../DESIGN.md). Parent details, security contracts and acceptance criteria remain authoritative; these children do not replace them. All work is TODO, including any existing scaffolding. Normal size is one observable behavior, usually no more than half a day after dependencies; split further if needed.

## Explicit parent mapping

- RAL-007 → ACC-001–ACC-006, ACC-010, ACC-024–ACC-025.
- RAL-008 → ACC-007–ACC-012, ACC-021, ACC-025.
- RAL-009 → ACC-013–ACC-015, ACC-022–ACC-023, ACC-025.
- RAL-010 → ACC-011–ACC-012, ACC-016–ACC-021, ACC-025.
- RAL-011 → ACC-025, inheriting the negative checks on each feature.

S4 personal preferences are design-required supplements to settings under RAL-009, not new business fields. S5 follows RAL-007. Signup follows the chosen auth provider and A1–A4, not a new identity system. Proposed endpoints below must be finalized with request/response/error fixtures. No custom cryptography. Each protected request resolves current membership server-side; cookie mutations require origin/CSRF protection. Parent gates refer to accepted evidence, not filenames. No Tally settings functionality, quotation content, admin management or email-delivery claims are introduced here.

## A1 — Sign in and provider-backed account creation

### ACC-001 — Establish the Worker-compatible auth adapter
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** Parent gate RAL-005.
- **UI checklist:** [ ] Define provider-supported sign-in/signup/recovery capabilities and truthful unavailable actions.
- **API/backend checklist:** [ ] Select maintained SQLite-compatible library/version, verify Worker support, define library routes and `GET /api/session`; sessions expose safe own identity, expiry and memberships only.
- **DB checklist:** [ ] Add users and library account/session tables, normalized unique email and expiry indexes; platform-admin flag is not client-writable.
- **Verify:** 1. Create/load a session in the Worker-compatible runtime. 2. Over-post admin/role fields: reject or discard without elevation; inspect DTO for secrets.
- **Evidence:** pending.

### ACC-002 — Submit accessible sign-in and return safely
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-001.
- **UI checklist:** [ ] Email/password labels, show-password, paste/autocomplete, pending/retry and generic errors; focus heading then failed-submit summary; Enter submits only after composition ends.
- **API/backend checklist:** [ ] Use library sign-in route, rate limits and generic invalid-credential response; accept only allowlisted same-app return destinations.
- **DB checklist:** [ ] Use provider sessions; no custom password storage.
- **Verify:** 1. Keyboard/password-manager login reaches authorized return route. 2. Bad credentials, external return URL and rate-limit response remain safe and reveal no account existence.
- **Evidence:** pending.

### ACC-003 — Create an account without self-granted business privileges
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)); design A1–A4.
- **Depends on:** ACC-001.
- **UI checklist:** [ ] Provider-supported signup uses name/email/password policy and verification messaging; no CRM wizard; show pending, invalid and recoverable duplicate-account result without enumeration.
- **API/backend checklist:** [ ] Use provider registration/verification contract; accept no business role/admin fields; newly authenticated account has no membership until bootstrap or invitation acceptance.
- **DB checklist:** [ ] Provider normalizes unique identities and stores credentials with library-managed cryptography.
- **Verify:** 1. Complete provider-supported signup by keyboard and reach onboarding/invitation. 2. Duplicate normalized email and injected OWNER/admin flags do not create duplicate identity or privilege.
- **Evidence:** pending.

## A2 — Account recovery and reset

### ACC-004 — Request recovery with non-enumerating confirmation
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-001.
- **UI checklist:** [ ] `/recover` has labeled email, pending/retry and the same confirmation for unknown and known accounts; do not claim delivery when transport is unavailable.
- **API/backend checklist:** [ ] Provider recovery request is rate-limited with origin checks and approved callback origin; configure actual delivery or explicitly block live recovery.
- **DB checklist:** [ ] Use provider token/expiry persistence only; no plaintext recovery tokens in logs or evidence.
- **Verify:** 1. Submit known/unknown emails by Enter: same public result. 2. Observe delivery in an authorized test mailbox or record blockage; abuse/callback tests reject unsafe requests.
- **Evidence:** pending.

### ACC-005 — Reset a password once and expire prior credentials
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-004.
- **UI checklist:** [ ] `/reset-password` supports managers/paste, policy errors and expired/used-token recovery link; focus result heading and never echo token.
- **API/backend checklist:** [ ] Provider validates bounded single-use token and password policy; define and test prior-session invalidation and safe sign-in return, never automatic sensitive-action replay.
- **DB checklist:** [ ] Consume reset state atomically through provider and revoke sessions according to the agreed policy.
- **Verify:** 1. Valid reset works once; old password fails. 2. Expired/replayed token and revoked session fail; error preserves non-secret form context only.
- **Evidence:** pending.

## A4 — Session lifecycle and membership context

### ACC-006 — Revoke sessions and clear sensitive client state
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-001, ACC-002.
- **UI checklist:** [ ] Sign-out resolves dirty work, clears account/business caches and returns to Sign in; expiry offers reauthentication with only safe unsaved-work warnings.
- **API/backend checklist:** [ ] Library logout revokes session; enforce expiry, Secure/HttpOnly/SameSite cookies, narrow CORS and CSRF/origin checks; no automatic replay of prior mutation.
- **DB checklist:** [ ] Persist revocation/expiry through provider tables and expiry indexes.
- **Verify:** 1. Logout, then replay old cookie: unauthorized. 2. Sign in as another user: no prior business prices flash; forged-origin logout/mutation is rejected.
- **Evidence:** pending.

## A3 — Owner business onboarding

### ACC-007 — Create the first business and Owner atomically
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-008 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-001, ACC-003.
- **UI checklist:** [ ] `/onboarding/business` requests name, phone and address only; pending prevents double submission; validation focuses summary and retains values on failure.
- **API/backend checklist:** [ ] Proposed `POST /api/businesses` derives creator from session, validates bounds and uses a retry-safe creation key; bootstrap policy explicitly defines eligibility, no posted owner/admin identity.
- **DB checklist:** [ ] Create business plus OWNER membership and audit atomically; unique membership and OWNER/EMPLOYEE role checks.
- **Verify:** 1. Keyboard submit/retry creates one business with the caller as Owner. 2. Inject another user/admin role or fail membership write: no privilege or orphan business remains.
- **Evidence:** pending.

## A4 — Business chooser, forbidden and missing-context states

### ACC-008 — Resolve active membership for every protected request
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-008 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-007.
- **UI checklist:** [ ] Shell receives authorized business name/role; no-membership state links to safe onboarding rather than an empty operational app.
- **API/backend checklist:** [ ] Middleware derives business from session and active membership; body/query `business_id` cannot grant scope; nested IDs and cursor scope are checked; platform admin is orthogonal.
- **DB checklist:** [ ] Scope all membership joins; FK/unique role constraints and membership-change audit are present.
- **Verify:** 1. Owner/Employee can access allowed operational contracts. 2. Forge business/URL/body/cursor IDs across two tenants and use admin without membership: no seller access.
- **Evidence:** pending.

### ACC-009 — Switch only among authorized business memberships
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-008 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-008.
- **UI checklist:** [ ] Chooser appears only when applicable; resolve dirty work first, clear old business state, preserve keyboard focus and show a neutral loading state.
- **API/backend checklist:** [ ] Proposed `POST /api/session/business` accepts a candidate ID but validates active membership before changing context; `GET /api/session` returns only authorized choices.
- **DB checklist:** [ ] Use provider/session context supported by chosen adapter; do not add membership on switch.
- **Verify:** 1. Switch A→B and Back: only each business's authorized state appears. 2. Tamper with candidate ID or revoke membership during switch: fail safely with no old cost cache visible.
- **Evidence:** pending.

### ACC-010 — Render safe expiry, forbidden and missing-record recovery
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007, RAL-008 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** ACC-006, ACC-008.
- **UI checklist:** [ ] Distinguish signed-out, removed-membership, forbidden and not-found recovery; keyboard focus lands on heading, return links stay safe, no unauthorized record names.
- **API/backend checklist:** [ ] Standardize 401/403/404 contracts and disclosure policy; session recheck detects removal; reauthentication never replays Share/Bill/Merge or other mutations.
- **DB checklist:** None beyond existing current membership/session reads.
- **Verify:** 1. Open protected deep link signed out, then as removed member: safe recovery. 2. Probe another tenant's record and compare absent-record response under disclosure policy: neither leaks data.
- **Evidence:** pending.

## A3 — Invitation landing and acceptance

### ACC-011 — Display invitation context without exposing its secret
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-008, RAL-010 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** ACC-008, ACC-017.
- **UI checklist:** [ ] `/invite/:token` distinguishes valid, expired, revoked, already accepted and wrong-account states; authorized context shows business and fixed Employee role before acceptance.
- **API/backend checklist:** [ ] Proposed invitation inspection verifies token hash/TTL, limits attempts and returns minimal context; email-binding details require correct signed-in account; redact URL/token from analytics/logs.
- **DB checklist:** [ ] Read invitation state without consuming it; use hash lookup, never store plaintext token.
- **Verify:** 1. Open each state with keyboard and follow safe sign-in/recovery. 2. Random token or wrong account reveals no private member list or usable acceptance capability.
- **Evidence:** pending.

### ACC-012 — Accept a bound Employee invitation once
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-008, RAL-010 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** ACC-011.
- **UI checklist:** [ ] Explicit Accept has pending/success/conflict states; wrong account offers switch-account, not role editing; focus moves to authorized business result.
- **API/backend checklist:** [ ] Proposed `POST /api/invitations/accept` verifies authenticated email, hash, expiry and unrevoked state; derives business/EMPLOYEE from invite and refuses over-posted privileges.
- **DB checklist:** [ ] Atomically consume invitation, insert unique membership and audit; concurrent/repeated acceptance is harmless and cannot recreate revoked access.
- **Verify:** 1. Race two accepts: one membership and one effective consumption. 2. Expired/revoked/cross-business token, wrong email and OWNER injection fail without mutation.
- **Evidence:** pending.

## S1 — Settings → Business

### ACC-013 — Load safe business identity and text preview
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-009 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-008.
- **UI checklist:** [ ] Owner sees editable name/phone/address; Employee sees safe read-only fields and “Ask the owner”; loading/error/retry and small future quote-identity text preview, no template editor.
- **API/backend checklist:** [ ] `GET /api/settings/business` returns scoped identity plus update version; no member secrets or unrelated tenant data.
- **DB checklist:** [ ] Read business row; add version/timestamp only if absent, no quote schema.
- **Verify:** 1. Load both roles by keyboard: controls match policy. 2. Tampered business parameter cannot change response scope; preview contains supported fields only.
- **Evidence:** pending.

### ACC-014 — Save validated business changes with an audit
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-009 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-013.
- **UI checklist:** [ ] Save/Cancel and dirty/saving/saved/error states; adjacent validation plus focused summary; invalid name/phone/address retains input and explains limits.
- **API/backend checklist:** [ ] `PATCH /api/settings/business` accepts allowlisted fields and expected version, Owner only; audit old/new values safely; changes affect future identity snapshots, not historical documents.
- **DB checklist:** [ ] Conditional versioned update and audit commit together; do not create quotation/PDF tables.
- **Verify:** 1. Owner keyboard save persists after reload; cancel restores saved values. 2. Employee direct PATCH and over-posted roles fail; audit matches accepted changes without unsafe logging.
- **Evidence:** pending.

### ACC-015 — Preserve edits on conflict, navigation or permission loss
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-009 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-014.
- **UI checklist:** [ ] Dirty navigation confirmation restores focus; 409 keeps entered values and offers deliberate reload/reconciliation; permission loss stops edits without caching them for another user.
- **API/backend checklist:** [ ] Return explicit conflict/current-version metadata only to authorized callers; recheck Owner membership at write, not just form load.
- **DB checklist:** [ ] Stale expected version affects zero rows; no audit success on failed update.
- **Verify:** 1. Two tabs save different values: stale tab cannot overwrite silently. 2. Revoke permission mid-edit, then save/navigate by keyboard: no write or cross-user retention.
- **Evidence:** pending.

## S2 — Settings → Employees

### ACC-016 — List members and invitation lifecycle states
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-010 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-013, ACC-017.
- **UI checklist:** [ ] Owner-only native table shows name/email, role, invited/joined date and pending/expired/revoked/accepted/already-member/delivery-failed states; loading/empty/error/retry and row actions are keyboard accessible.
- **API/backend checklist:** [ ] Proposed `GET /api/settings/employees` uses bounded scoped pagination and explicit delivery/status metadata; Employee direct request denied.
- **DB checklist:** [ ] Scoped membership/invitation joins; no plaintext tokens in list results.
- **Verify:** 1. Seed each lifecycle state: table distinguishes it accurately. 2. Employee, foreign cursor and foreign business request reveal no management list.
- **Evidence:** pending.

### ACC-017 — Create a fixed-role, expiring Employee invitation
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-010 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-008, ACC-014.
- **UI checklist:** [ ] Invite dialog asks email, displays current business and fixed Employee role, focuses email; pending/duplicate/invalid feedback is recoverable.
- **API/backend checklist:** [ ] Proposed `POST /api/settings/invitations` is Owner-only/rate-limited; finalize bounded TTL and duplicate policy; securely generate token, return share capability only when authorized, never accept privilege fields.
- **DB checklist:** [ ] Store unique hash, business, normalized email, EMPLOYEE, expiry/consumed/revoked timestamps; audit creation without secret.
- **Verify:** 1. Create via keyboard: persisted row contains hash only. 2. Duplicate email, Employee request and OWNER/admin injection cannot create unintended membership or privilege.
- **Evidence:** pending.

### ACC-018 — Deliver invitations honestly with accessible copy fallback
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-010 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-017.
- **UI checklist:** [ ] Separate “link ready/copied”, “sent” and delivery failure; clipboard failure offers selectable link; show resend only if supported, with safe focus return.
- **API/backend checklist:** [ ] Finalize email transport capability/result contract; do not equate invitation creation with delivery; if resend supported, define token rotation/revocation and rate limiting.
- **DB checklist:** [ ] Persist delivery outcome only as needed; never persist recoverable plaintext invitation token for later listing.
- **Verify:** 1. Unprovisioned email offers working keyboard copy without claiming send. 2. Simulate clipboard/email failure: recovery works and logs/artifacts contain no bearer link.
- **Evidence:** pending.

### ACC-019 — Revoke a pending invitation deliberately
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-010 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-016, ACC-017.
- **UI checklist:** [ ] Confirmation names invitee/business, focuses safe action and returns to row/heading; pending/error retains context; revoked state is visible.
- **API/backend checklist:** [ ] Proposed `POST /api/settings/invitations/:id/revoke` checks Owner and same business; retry is harmless and races acceptance atomically.
- **DB checklist:** [ ] Set revocation timestamp with audit; already-consumed invite cannot pretend to remove an existing member.
- **Verify:** 1. Revoke then accept: acceptance fails. 2. Race revoke/accept and try a foreign invite ID: consistent outcome, no unauthorized mutation.
- **Evidence:** pending.

### ACC-020 — Remove an Employee and immediately deny effective access
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-010 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-016, ACC-008.
- **UI checklist:** [ ] Removal confirmation names person and loss of business access; cancel is safe, failure retains row; success focuses next row or table heading.
- **API/backend checklist:** [ ] Proposed `DELETE /api/settings/employees/:membershipId` is Owner-only and scoped; current-membership checks invalidate effective access on the next request, including existing sessions.
- **DB checklist:** [ ] Revoke membership and audit without deleting user identity or historical actor references; no future quote/event deletion cascade.
- **Verify:** 1. Remove Employee with an open session: next protected request denied. 2. Employee/foreign ID removal fails and previously recorded audit actor remains intact.
- **Evidence:** pending.

### ACC-021 — Preserve the last Owner under concurrent changes
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-008, RAL-010 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** ACC-007, ACC-020.
- **UI checklist:** [ ] No casual Owner-delete or role editor; blocked action explains protection; ownership transfer remains out of scope.
- **API/backend checklist:** [ ] Reject unsupported Owner removal/promotion and protect at least one active Owner under races; no Platform Admin assignment through membership routes.
- **DB checklist:** [ ] Atomic membership-change guard and constrained roles enforce invariant, not only a UI count.
- **Verify:** 1. Attempt direct last-owner removal/demotion and concurrent owner changes: at least one Owner remains. 2. Employee and platform-admin-without-membership cannot bypass business policy.
- **Evidence:** pending.

## S4 — Settings → Preferences and keyboard help

### ACC-022 — Save personal density and reduced-motion choices
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-009 ([requirement](../IMPLEMENTATION.md)); design S4 supplement.
- **Depends on:** ACC-001.
- **UI checklist:** [ ] Comfortable/Compact and System/Reduce preview without moving focus; Save/reset success/error; touch targets stay large and system Reduce always wins.
- **API/backend checklist:** [ ] Proposed own-user `GET/PATCH /api/me/preferences` accepts allowlisted values and works without business membership; preference failure never changes business data.
- **DB checklist:** [ ] Minimal per-user preference persistence, scoped by authenticated user, with defaults; no business-shared preference row.
- **Verify:** 1. Save/reload at touch width and OS reduced motion: correct presentation. 2. Inject another user/business ID: cannot alter their settings; error preserves preview and keyboard focus.
- **Evidence:** pending.

### ACC-023 — Expose shortcut help and complete shortcut disable
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-009 ([requirement](../IMPLEMENTATION.md)); design S4 supplement.
- **Depends on:** ACC-022.
- **UI checklist:** [ ] Named help surface with visible Close, documented actions and disable control; optional remapping reports conflicts; shortcuts never consume text input or IME composition.
- **API/backend checklist:** [ ] Extend own-preference contract with shortcut enablement and validated supported remaps only; business mutation APIs unaffected.
- **DB checklist:** [ ] Reuse per-user preference storage; no new roles or business settings.
- **Verify:** 1. Disable shortcuts, type ordinary characters in all inputs: no navigation/action fires. 2. Keyboard-open/close help returns focus; unsupported/conflicting remap is rejected clearly.
- **Evidence:** pending.

## S5 — Settings → Account

### ACC-024 — Show own identity and provider-supported security actions
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007 ([requirement](../IMPLEMENTATION.md)).
- **Depends on:** ACC-001, ACC-006.
- **UI checklist:** [ ] Own identity, supported provider security controls and sign out; password managers/paste work; platform admin without membership can use account menu without gaining business-settings access.
- **API/backend checklist:** [ ] Use `GET /api/session` and supported library own-account routes; validate reauthentication where provider requires it; never expose stored credentials or editable admin flags.
- **DB checklist:** [ ] Provider-owned identity/session updates only; no business membership changes.
- **Verify:** 1. Keyboard security action succeeds through provider and sign out clears state. 2. Foreign user ID/privilege fields fail; unsupported provider actions are not displayed as working.
- **Evidence:** pending.

## A1–A4 / S1–S5 — Identity integration gate

### ACC-025 — Record the two-business identity authorization regression gate
- **Status:** TODO
- **Owner:** unassigned
- **Parents:** RAL-007, RAL-008, RAL-009, RAL-010, RAL-011 ([requirements](../IMPLEMENTATION.md)).
- **Depends on:** ACC-001–ACC-024.
- **UI checklist:** [ ] Keyboard walkthrough covers signup/login/recovery, onboarding, invites, business settings, sign-out, expiry and role-gated navigation; forbidden routes disclose nothing.
- **API/backend checklist:** [ ] Reusable Owner/Employee/Platform Admin × two-business policy harness tests URL/body/cursor forgery, CSRF, over-posted roles, revocation and onboarding; link future catalogue/quote IDOR obligations to RAL-019/RAL-027, not fake passes.
- **DB checklist:** [ ] Replay identity migrations and assert membership uniqueness, role constraints, last-owner races and audit integrity; no advance domain tables.
- **Verify:** 1. Run targeted policy matrix and lifecycle suites: expected allow/deny results recorded. 2. Review traces manually for focus and credential/token leakage; record unresolved recovery/delivery blockers.
- **Evidence:** pending.

## Screen completion checklist

- [ ] A1: ACC-001–ACC-003 verified with provider compatibility, password manager and keyboard evidence.
- [ ] A2: ACC-004–ACC-005 verified including real test delivery or explicit blocker; no false delivery claim.
- [ ] A3: ACC-007, ACC-011–ACC-012 verified for owner bootstrap and every invitation state.
- [ ] A4: ACC-006, ACC-008–ACC-010 verified across membership changes and users without cached-data leakage.
- [ ] S1: ACC-013–ACC-015 verified for Owner and Employee, conflict and dirty navigation.
- [ ] S2: ACC-016–ACC-021 verified for invitation/removal races and safe keyboard confirmation.
- [ ] S4: ACC-022–ACC-023 verified for per-user scope, reduced motion, touch and disabled shortcuts.
- [ ] S5: ACC-024 verified without requiring business membership for own account.
- [ ] Identity gate: ACC-025 accepted with limitations; no child or parent marked DONE from scaffolding.

## Suggested implementation order

ACC-001 → ACC-002/ACC-003 → ACC-004/ACC-005/ACC-006 → ACC-007/ACC-008 → ACC-009/ACC-010 → ACC-013/ACC-014/ACC-015 → ACC-017/ACC-018 → ACC-016/ACC-011/ACC-012 → ACC-019/ACC-020/ACC-021. Personal settings ACC-022–ACC-024 can follow auth independently. Close with ACC-025 before Parent gate RAL-011 permits catalogue schema.