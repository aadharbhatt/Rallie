# Rallie UI design specification

**Status:** governing design contract; documentation only, not a claim that the UI exists or passes testing.  
**Research accessed:** 28 October 2026.  
**Product authority:** [rallie-init.md](../rallie-init.md). Where that brief defines commercial behavior, permissions, or delivery sequence, it wins. Routes, dimensions, interaction details, and budgets below are design decisions, not assertions about existing implementation.

## 1. Purpose and non-negotiables

Rallie is a calm, fast shop-counter workspace for finding products, reviewing manufacturer price lists, building quotations, and handing approved business to Tally. It should feel like a well-organized price book and quotation pad, not a generic SaaS analytics dashboard.

- **One quotation experience: Build.** No Compare mode, pivot workspace, or parallel quotation composer.
- **Global knowledge and shop pricing are visibly different.** Global publication requires Platform Admin review. A new approved global MRP never silently replaces the shop's active MRP.
- **Evidence is not truth.** Preserve source PDF, page, raw extraction, and seller corrections. Show decisions and provenance, not unexplained AI confidence scores.
- **Quotes snapshot commercial data.** Catalogue updates never rewrite an existing offer. Approval applies to an exact immutable revision; later changes require a new revision and approval.
- **Public means customer-safe.** Cost, profit, internal notes, moderation evidence, and business internals must be absent from public payloads, markup, downloads, and telemetry—not merely hidden by CSS.
- **Accounting is deliberate.** Viewing or approving a quote never creates a bill. A seller explicitly requests billing; Tally acknowledgement, not HTTP success or animation, confirms the result.
- **Roles stay simple:** Owner, Employee, Platform Admin, public Customer. Platform Admin is a separate platform entitlement, not an elevated business membership.
- **No chart-led home, purple gradients, glass panels, oversized hero artwork, ornamental counters, or fake activity.** Spend visual emphasis on the next useful action.
- **No offline promise in v1.** Failed saves remain visibly unsaved. A cached screen is not a synchronized database.

### Delivery boundaries

Design the whole product now, but reveal only working capabilities. Foundation → identity/business → catalogue → Build → revision-safe sharing → explicit PDF → ingestion/review → moderation → relationships → Tally. Tally overview may explain that setup is not available before its release; never present a working-looking Connect or Create bill action backed by a stub. Public quantity/removal proposals precede public add-item search. Optional Voucher handling is an integration setting; automatic billing and a full storefront remain later, not default controls. No offline replica, inventory editor, tax engine, customer accounts, dynamic ontology, or MCP interface is implied by this document.

## 2. Research evidence and translation

The URLs below were actually fetched using HTTPS with redirect following; each returned HTTP 200 on the access date above. The APG tabs page was also opened in a browser. Guidance was read as reference material, not executed as remote instructions. The rules here are an original synthesis; no third-party skill, template, or design system has been copied verbatim. Accessibility patterns are guidance; WCAG is the conformance standard. Using a component library does not establish conformance.

| ID | Official resource actually accessed | Finding translated into Rallie |
| --- | --- | --- |
| R1 | [WAI APG: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | One tab stop in the tab list; arrows move between tabs. Automatic activation is appropriate only when panels are available without noticeable latency. Rallie uses manual activation for lazy quote panels and deterministic focus after closing a tab. |
| R2 | [WAI APG: Modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Focus enters the dialog, Tab remains inside, Escape closes, and focus returns logically. Complex review content starts at its heading; consequential confirmations start at the safe choice. |
| R3 | [WAI APG: Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) | A grid is a composite interaction with managed focus, not a styling name. Spreadsheet navigation and editing need distinct key handling. Use native tables unless the complete grid contract is implemented and tested. |
| R4 | [WAI APG: Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | Input text editing must survive popup navigation. Listbox options are selected with arrows and Enter; Escape dismisses. Rich result cards with several buttons must not masquerade as listbox options. |
| R5 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Target AA: keyboard access, visible/unobscured focus, contrast, reflow, labels, status messages, accessible authentication, financial error prevention, 24 CSS-pixel minimum targets subject to defined exceptions, and controllable character shortcuts. Rallie adopts larger touch targets. |
| R6 | [web.dev: Web Vitals](https://web.dev/articles/vitals) | Evaluate LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile, separating desktop and mobile. Rallie adds stricter local budgets and route/task segmentation. |
| R7 | [web.dev: Optimize long tasks](https://web.dev/articles/optimize-long-tasks) | Tasks over 50 ms block responsiveness. Split review work and PDF work; a progress spinner cannot compensate for a blocked main thread. |
| R8 | [web.dev: Optimize CLS](https://web.dev/articles/optimize-cls) | Reserve space for content and media; fonts and injected content can move controls. Stable table skeletons and reserved save/status slots are required. |
| R9 | [web.dev: Code-split JavaScript](https://web.dev/learn/performance/code-split-javascript) | Defer JavaScript not needed for the initial task through dynamic imports. Separate operational routes, admin, source viewer, and on-demand PDF generation. |
| R10 | [Radix Primitives: Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) | Accessible primitives can supply roles, keyboard behavior, and focus management; authors still own naming, composition, and context. Prefer tested primitives over custom modal/menu plumbing. |
| R11 | [GOV.UK: Error summary](https://design-system.service.gov.uk/components/error-summary/) | Failed form submissions need a focused summary linked to fields, with messages matching inline errors. Preserve entered values and make recovery concrete. |
| R12 | [Carbon: Data table usage (requested URL)](https://carbondesignsystem.com/components/data-table/usage/) → [actual final guidelines URL](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) | Density, row size, toolbar size, selection, and batch actions should form a coherent system. Rallie adopts consistent comfortable/compact modes, with touch overriding compact density. |
| R13 | [web.dev: Code splitting with dynamic imports in Next.js](https://web.dev/articles/code-splitting-with-dynamic-imports-in-nextjs) | Supplemental reference accessed for deferred-loading principles only. Rallie remains React/Vite; no Next.js API or framework change is prescribed. |

### Accessibility obligations

Release target is **WCAG 2.2 AA across complete workflows**, including third-party-hosted transitions where Rallie controls the interface. In particular test 1.3.1 structure, 1.4.3 text contrast, 1.4.10 reflow, 1.4.11 non-text contrast, 1.4.12 text spacing, 2.1.1 keyboard, 2.1.2 no trap, 2.1.4 character shortcuts, 2.4.3 focus order, 2.4.7 focus visible, 2.4.11 focus not obscured, 2.5.7 non-drag alternatives, 2.5.8 target size, 3.3.1–3.3.4 error handling/prevention, 3.3.7 redundant entry, 3.3.8 accessible authentication, and 4.1.2–4.1.3 names/states/status messages. This is a risk-focused list, not a replacement for the full standard.

Our 44-pixel touch target and prominent focus ring are product requirements beyond the AA minimum; do not describe the AAA Focus Appearance criterion as an AA requirement. Automated audits are necessary but insufficient. Do not claim conformance until manual keyboard, screen-reader, zoom, touch, and full-process tests pass.

## 3. Visual language and tokens

### 3.1 Direction

Use warm paper around white work surfaces, dark ink for reading, restrained teal for actions/selection, and amber for decisions needing attention. Thin separators, aligned numbers, quiet typography, and predictable spacing create polish. Avoid making every item a rounded card: cards group tasks, tables compare records, and lists support browsing. Brand distinction comes from material-like neutrals and clear commercial hierarchy, not effects.

### 3.2 Light-theme colors

All tokens are semantic. Components consume tokens, never unexplained one-off hex values. Dark mode is not in this scope. Respect forced-colors mode with system colors and visible borders rather than trying to preserve the palette.

| Token | Value | Contract |
| --- | --- | --- |
| `canvas` | `#F7F5F0` | Warm neutral page background. |
| `surface` | `#FFFFFF` | Main work area, popovers, sheets. |
| `surface-subtle` | `#EFEEE8` | Table headings and quiet grouping; not disabled text. |
| `ink` | `#172B2A` | Primary text and prominent totals. |
| `ink-muted` | `#52615D` | Secondary labels, dates, helper text; never opacity-reduced body copy. |
| `border-subtle` | `#D8DED7` | Decorative dividers only; not the sole boundary of an input. |
| `border-control` | `#667A73` | Inputs, checkboxes, and essential control outlines. |
| `action` | `#0F766E` | Teal primary button, links, selected controls, focus outer ring. |
| `action-hover` | `#115E59` | Hovered primary button. |
| `action-pressed` | `#134E4A` | Pressed primary button. |
| `selection` | `#E6F3EF` | Selected row/tab surface with teal edge and text/icon marker. |
| `warning-ink` / `warning-surface` | `#854D0E` / `#FFF4D6` | New price, missing mapping, stale evidence, unsaved warning. |
| `danger-ink` / `danger-surface` | `#B42318` / `#FEF3F2` | Invalid field, rejected action, failure; not ordinary price drift. |
| `success-ink` / `success-surface` | `#0F766E` / `#E6F3EF` | Saved, approved, confirmed; always with words/icon. |
| `overlay` | `rgba(23,43,42,0.40)` | Modal scrim; only one modal layer at a time. |
| `focus-gap` | `#FFFFFF` | 2 px separation between control and outer 2 px teal ring. |

Calculated using WCAG relative luminance, rounded to two decimals: ink/canvas **13.62:1**; muted/white **6.51:1**; muted/canvas **5.97:1**; white/action **5.47:1**; action/selection **4.80:1**; warning pair **6.25:1**; danger pair **6.05:1**; control border/white **4.57:1**, border/canvas **4.19:1**. These validate only these opaque pairings. Test actual hover, selected, focused, disabled, overlay, and composited states in implementation. Decorative separators need not meet control contrast, but must never carry essential meaning alone.

### 3.3 Typography

- Font family: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. No Google Fonts, CDN font requests, or runtime external typography dependencies.
- If a later brand typeface is approved, self-host licensed WOFF2 subsets, preserve fallback metrics, use swap behavior, and include font bytes in the route budget. Rupee and supported language glyphs must work offline after load.
- Body: **16/24 px**, weight 400. Dense desktop table text: **14/20 px**, not below 14 px for operational content. Form inputs remain 16 px, including mobile to avoid browser auto-zoom.
- Page title: **28/34 px**, weight 650 where available; section title **20/28**, weight 600; component title **16/24**, weight 600; metadata **13/18** minimum; quote total **28/34**, weight 650.
- Use rem-based sizes and unitless line heights in implementation. No fixed-height text containers that clip at zoom or increased text spacing.
- Prices, quantities, percentages, and counts use tabular lining numerals; right-align numeric table columns. SKU uses a restrained monospace stack (`ui-monospace, SFMono-Regular, Consolas, monospace`) at 14/20, with selectable full text.
- Sentence case throughout. Uppercase only short brand marks, familiar acronyms such as MRP/SKU/PDF, and genuine product codes. Long names wrap; truncation must have a keyboard/touch-accessible full-value view, not only a hover tooltip.

### 3.4 Geometry, density, and icons

| System | Values / rule |
| --- | --- |
| Spacing | 4 px base; tokens 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Use 8–12 inside related controls; 24–32 between sections. |
| Radius | 4 px fields/cells; 8 px buttons/cards; 12 px sheets/dialogs; pills only for status tags, not every action. |
| Elevation | Flat base surfaces; small shadow for menus; medium for modal sheets. Example small: `0 2px 8px rgba(23,43,42,.08)`; medium: `0 12px 32px rgba(23,43,42,.16)`. Borders remain visible. |
| Default comfortable | Controls 40 px minimum; data rows 48 px minimum, 64 px for two-line product rows. Header/toolbar density matches content. |
| Compact desktop | Explicit preference only: controls 36 px; simple rows 40 px minimum. Never reduce font to squeeze more rows. Multi-line content may grow. |
| Touch/coarse pointer | Controls and icon hit areas at least 44 × 44 px; rows at least 56 px; 8 px separation for adjacent destructive/primary controls. Touch wins over compact preference. |
| Icon size | 16 px in metadata, 20 px in buttons, 24 px in primary navigation; consistent 1.75–2 px stroke family, bundled locally. |
| Icons | Search, plus, file, check, warning, clock, link, chevron, close, external link. Decorative icons hidden from accessibility tree. Meaningful icons have text or accessible names. No emoji as production status UI. |
| Layers | Base 0; sticky content 10; navigation 20; popover 30; modal scrim/dialog 40/41; non-blocking status 50. Status messages must not cover dialog actions. |

## 4. Shell, hierarchy, and responsive behavior

### 4.1 Authenticated shell

- Left navigation is exactly **Dashboard, Catalogue, Quotations, Tally, Settings**, then a separated **Admin** entry only for Platform Admin. Do not add a separate Inventory top-level module: seller catalogue is commercial inventory; Tally owns stock.
- Desktop rail: 224 px. Top business/context bar: 56 px. Content padding: 24 px; page headers share a baseline and place one main action at the right. A small account/help control exposes preferences, keyboard help, and sign out.
- Header includes business name, user identity/role when opened, and truthful connectivity/save context. Do not place cost/profit in globally visible notifications.
- Business switching appears only when membership permits it. Confirm or resolve unsaved work first; clear business-specific cached data and tab restoration before opening the new business. Never leak a prior business's costs in a transition skeleton.
- Dashboard/forms use a reading width around 1120 px. Catalogue, review, quotations, and moderation use available width up to 1760 px, centered beyond it. Forms generally cap at 640 px.
- Landmarks: skip links, primary navigation, header, main; workspace sections have named headings/regions. Use one page-level h1 and meaningful document titles such as “Rajesh — Q100 · Quotations · Rallie”.
- Browser Back/Forward works with routes, selected catalogue scope, filters, and quote ID. Query parameters carry only appropriate non-secret state. Public bearer links are never copied into analytics events.

### 4.2 Layout ranges

| Width / input | Layout |
| --- | --- |
| ≥1440 px, keyboard/mouse | Full rail. Quote workspace roughly 58% catalogue search / 42% quote, quote pane minimum 420 px. Review can show evidence beside the table. |
| 1200–1439 px | Full rail or persisted collapsed 72 px rail; two-pane quote remains if minimum widths fit. Collapse tertiary evidence into a drawer before shrinking price fields. |
| 960–1199 px | 72 px rail with visible accessible labels on expansion; dense pages use full width. Quote panes remain only if search ≥320 px and quote ≥400 px after gutters, otherwise stack. |
| 768–959 px | Compact header and navigation drawer; search and quote sections stack with visible jump links. Product/evidence sheets use most of the viewport. No hover-only controls. |
| <768 px | Single-column app and public page; navigation is an explicit button. Quote summary and “Jump to quote” remain reachable, not overlapping inputs. Multi-quote chooser replaces a squeezed tab strip. Review offers row-detail forms with Previous/Next; native table can scroll inside a named container. |
| 320 CSS px / 400% zoom | No page-level horizontal scroll except genuinely two-dimensional data inside its own labeled scroll area. All non-table controls, messages, dialogs, and public quote lines reflow. |

Breakpoint changes never discard input or reset active quote/selection. Preserve DOM focus on the same logical control; do not leave duplicate hidden controls tabbable. Sticky headers/footers account for safe-area insets, virtual keyboards, and `scroll-padding`; focused controls must not be obscured. Use minimum heights rather than desktop viewport locks that trap zoomed content.

Desktop-first does not mean mouse-only: design for a 1366 × 768 counter laptop, 1280 × 800 touch device, 1920 × 1080 desktop, and a 360 × 800 customer phone. At mobile widths the primary workflow must be complete, not a “use desktop” dead end.

## 5. Shared component and state contracts

### 5.1 Components

| Component | Required behavior |
| --- | --- |
| Buttons | Primary teal for the main next action; secondary outlined for alternatives; text for low-priority actions; danger only for destructive confirmation. Hover, pressed, focus, pending, disabled, success, and error are distinct. Pending keeps width and label (“Saving…”), prevents duplicate submission, and exposes busy state. A disabled action has adjacent reason text, not an inaccessible tooltip. |
| Fields | Persistent label, optional hint, units/currency outside entered text, required/optional wording, inline error linked with `aria-describedby`, and `aria-invalid` when invalid. Retain bad input for correction. Validate on blur/submit, not angrily on the first keystroke. |
| Number/money entry | Numeric keyboard hints but real validation; paste allowed; support decimal paise and applicable fractional UOM. Empty is not zero. Never change price/quantity on mouse-wheel scroll. Show the authoritative rounded value after validation without changing the commercial meaning silently. |
| Search | Persistent scope label, clear control, loading indicator in reserved space, result count announced politely after settled requests. Cancel obsolete requests or ignore stale responses. No “0 results” flash before data arrives. Retain query, filters, scroll, and selection after opening/closing details. |
| Table | Native `table`, caption, column headers, explicit row-label links/buttons, `aria-sort` on sortable columns. Selection uses labeled checkboxes and indeterminate header checkbox. No “click anywhere” row that hides unrelated buttons or changes text selection behavior. |
| Status tags | Text + optional icon + color. “Pending global review”, “Your active price”, “Latest approved”, “Unsaved”, “Stock last synced …” distinguish different kinds of state. Never reuse “Approved” without indicating customer or global moderation context. |
| Banners/toasts | Persistent banners for unsaved, stale, permission, and partial-failure conditions. Toasts only supplement an inline result; no important outcome or undo exists only in a timed toast. Polite announcements normally; assertive announcements only for urgent blocking failures. |
| Empty state | Explain absence and one useful next step. Distinguish no data, no search match, filtered-out results, unavailable feature, and denied access. No decorative full-screen illustration. |
| Loading | Stable skeleton matching final geometry for first data fetch. Retain prior content with “Updating…” during refresh; mark region busy, skeleton children hidden from AT, and a single loading label exposed. No fake product names or numbers. |
| Menus/popovers | Use only for actual action sets; arrows/Home/End and Escape per primitive behavior. Critical actions remain visible on their task surface. Tooltip opens on focus as well as hover, dismisses with Escape, and never contains the only instructions. |
| Dialog/sheet | Modal sheet uses dialog semantics, inert background, heading/description, contained focus, Escape/Close, and opener restoration. Non-modal detail pane is a named region with no trap. Never use modal styling with non-modal keyboard behavior. |
| Confirmations | State object, effect, scope, and reversibility: “Use ₹6,000 for this product? Existing quotations will not change.” Prefer safe initial focus for irreversible actions. Do not use vague “Are you sure?” or repeated confirmations for harmless actions. |
| Pagination | Server pagination/cursors, default 50 rows, optional 25/100. Show available range and total only if known. Explicit Previous/Next rather than infinite scroll alone. Preserve filters and announce page change; focus table heading on explicit page navigation, not background refresh. |

### 5.2 Universal state matrix

Every screen in §7–§12 inherits this matrix even when its local specification lists only specialized states.

| State | Visible result and recovery | Focus / announcement |
| --- | --- | --- |
| Initial loading | Layout-preserving skeleton and task-specific loading text. | Route heading receives focus after user navigation; no focus into skeleton. |
| Loaded | Clear heading, current scope, main action and trustworthy timestamps. | Normal logical order. Background data arrival does not steal focus. |
| Empty / filtered empty | Reason, clear filters or creation action as appropriate. | Result count announced once; query retains focus. |
| Invalid form | Preserve values; summary links to each invalid field with identical inline wording. | On failed submit focus summary; link moves to field. Use “Error:” title prefix while unresolved. |
| Saving / working | Reserved busy label, duplicate action guarded, other safe work available. | Keep current focus; announce completion once, not every debounced keystroke. |
| Saved / completed | Inline result with object/revision/count and timestamp. | User-directed completion may focus result heading or new item; otherwise remain in place. |
| Failed / retryable | Plain-language failure, retained work, Retry; diagnostic ID in expandable details. | Blocking submit error goes to summary; background failure announces without jumping. |
| Offline / reconnecting | “Connection lost. These changes are not saved.” No false success or queued billing promise. | Keep edits/focus; retry safe operations when appropriate, never silently replay a consequential action. |
| Stale / conflict | Show saved server version vs your changes, actor/time if known, and reload/review choices. Never last-write-wins silently. | Open comparison only by explicit action; return to conflicted field after resolution. |
| Permission / session expired | No sensitive content flash. Explain sign-in or access route. Preserve recoverable work only within the authorized session boundary. | Focus access heading; successful reauthentication returns to intended task without double-submitting. |
| Not found / removed | Distinguish inaccessible internal object generically; public links use non-enumerating unavailable copy. | Offer safe return; focus heading. |

No claimed success before server acknowledgement. “Saved” and “Shared” are different; “WhatsApp opened” is not “Message delivered”; “PDF downloaded” is not “PDF archived”; “Tally connected” is not “Stock current”.

## 6. Keyboard, focus, and accessibility interaction model

### 6.1 Navigation and shortcut safety

Native keyboard behavior always works without enabling shortcuts. Navigation links, buttons, fields, dialogs, tabs, and tables must be usable by Tab/Shift+Tab and their standard keys.

1. **Never intercept browser Ctrl/Cmd+W, +L, +T, +N, +R, +F, +P, browser tab-switching commands, zoom, or browser Back/Forward.** Do not bind a global Save handler over browser shortcuts. Do not use Alt-letter/accesskey bindings or Ctrl+Alt combinations that collide with menus, assistive tech, or AltGr.
2. Optional character chords are **off by default**, described in visible Keyboard help and Settings → Preferences, switchable off, and remappable. Suggested defaults when enabled: `g` then `d` Dashboard, `g` then `c` Catalogue, `g` then `q` Quotations, `n` then `q` New quote. No chord for approval, billing, merging, deleting, or sharing.
3. Use a central shortcut registry with scopes. Ignore a shortcut if the event is already handled, composing (`isComposing`, composition lifecycle, legacy keyCode 229 fallback), repeating, or has unexpected modifiers. Ignore events from input, textarea, select, contenteditable, textbox/searchbox/combobox/spinbutton, grid edit mode, password controls, or any editable descendant, including the composed event path.
4. Do not globally capture arrows, Enter, Escape, Delete, or Space. The focused widget owns them. During IME composition, Enter must commit text, never add a product, submit a form, or approve a quote.
5. After the first chord key, show a small “Navigation shortcut: g … · Esc to cancel” helper; cancel after 1.5 s or any focus/route/modal change. A timeout is acceptable because every action has an untimed visible equivalent. Do not suppress typing merely because it resembles an incomplete chord.
6. Only `preventDefault` for a matched, enabled, safe action that is actually handled. Do not try to detect screen-reader presence; let users disable/remap shortcuts and test actual AT combinations.
7. **F6 region cycling is optional and disabled by default.** Browsers use F6 for browser chrome. Only expose an opt-in after a tested browser/OS combination demonstrates safe behavior; otherwise omit the binding. While enabled and focus is inside the app, F6/Shift+F6 cycles named workspace regions; never intercept it from text editing, dialogs, or browser chrome. Provide permanent “Jump to search / quote / navigation” controls and skip links instead. Do not advertise F6 as universally available or as an APG requirement.
8. Keyboard help lists scope, key, equivalent visible action, and enabled status; rendered hints match platform and user remapping. Apply `aria-keyshortcuts` only for valid supported bindings; do not encode multi-step chords as if they were simultaneous keys.

### 6.2 Tabs, especially IDE quotation tabs [R1]

- Catalogue scopes, admin queues, and desktop quote tabs use labeled `tablist`, `tab`, `tabpanel` relationships where they switch panels in place. Settings subpages are links with current-page indication, not pretend tabs. Route links elsewhere keep native navigation semantics.
- One active tab is in the tab sequence; Left/Right moves focus with wrap, Home/End goes to ends. **Manual activation** via Enter/Space is the default across Rallie, avoiding network fetches on every arrow. Tab leaves the tablist for the active panel's first meaningful focus target or focusable panel. Up/Down in horizontal tablists retains normal page behavior.
- Quote labels: customer or “Untitled quote”, quote number, concise total/status. Visible dirty dot plus accessible “Unsaved changes”; save-error icon/text distinct from dirty. Close target is at least 36 px on desktop, 44 px on touch.
- Tab button and its Close button are **siblings**, not nested interactive elements. Tablist roving focus applies to tabs; a labeled adjacent close control for the selected tab is reachable next in the tab order. An “Open quotes” menu exposes Activate/Close for every tab and works when tabs overflow. New quote is outside the tablist.
- Optional Delete on a focused tab invokes the same close flow, never deletes the quotation. Visible label: “Close Rajesh quote tab”. Actual quote Void is a different deliberate command.
- Closing a saved tab is immediate. Closing a tab with unsaved edits opens **Save and close / Keep editing / Discard unsaved edits**. Initially focus Keep editing. Failed save keeps the tab open. Discard explicitly returns to the last saved revision, not deletion of server history.
- On active-tab close, activate/focus the right neighbor, else left neighbor, else New quote. Closing a background tab preserves the active panel and focus. Cancelling close returns to the close trigger or associated tab if layout changed.
- Keep last-used quote IDs per user and business (up to 8 restoration entries), not quote contents, prices, tokens, or customer data in local storage. Revalidate authorization and server state on restore. More than 8 may remain open during a session via overflow; do not auto-close a dirty tab. Unmounting a panel must not lose unsaved state, pending saves, caret intent, or conflict information.
- Switching tabs preserves each quote's search, scroll, current line, and draft state. On activation focus stays on its tab; Tab enters its panel. A route link that opens a quote initially focuses the quote heading, then offers Jump to search. Screen-reader panel labels include quote identity.
- Internal navigation prompts only for actual unsaved work, never for a saved draft. Attach browser `beforeunload` only while dirty; browsers control the warning and may not show it. Save on normal blur/action; do not rely on unloading for persistence or claim guaranteed crash recovery.

### 6.3 Dialogs, drawers, and focus restoration [R2]

Simple pricing dialog starts at its first field; long product/evidence dialog starts at a focusable heading; irreversible Merge/Bill confirmation starts at Cancel or the explanatory heading. Tab/Shift+Tab stays inside a modal. Escape and explicit Close dismiss; if edits exist, use the unsaved-resolution flow, not silent discard. Replace dialog content for a confirmation rather than stacking modal traps.

Closing returns to the opener. If the opener was removed, choose the next logical row action, previous row, or containing heading; never document body. After adding a global product during quote creation, return to that quote's search/result and announce availability—do not silently add a line as an unrelated side effect. A running durable job may continue after closing a dialog; closing is not cancellation. Long evidence viewers always have a visible Close and source-text alternative to PDF viewing.

### 6.4 Semantic table versus interactive grid [R3]

**Default native tables:** catalogue, quotation list/history, ingestion history, price updates, admin queues, employees, Tally items/jobs, and operational metrics. Inputs/buttons inside table cells retain ordinary Tab order. Use filters, pagination, row-detail forms, and explicit batch actions before inventing spreadsheet behavior.

**Eligible grid surfaces only:** high-volume ingestion editing and a future dense quote-line editor, and only if complete implementation earns its complexity. Initial review may be a native table opening a row editor; this is a valid accessible baseline, not a degraded feature. Never assign `role=grid` just because CSS uses grid layout.

If an interactive grid ships:

- One roving cell/tab stop; arrows move cells without wrapping at edges, Home/End first/last cell in row, Ctrl+Home/End first/last grid cell, PageUp/Down one documented visible page. These keys apply only in grid navigation mode.
- Enter or F2 enters editing; Escape restores the pre-edit value and returns to navigation; Enter validates/commits and returns to that cell. Tab in edit mode commits and advances to the next editable cell, Shift+Tab reverses; at outer boundaries leave the grid. In navigation mode Tab exits the composite. Validation failure retains the value and explains the issue but must allow Escape or normal focus exit—never trap a user.
- During edit mode, native text caret, selection, clipboard, IME, and nested combobox keys win. A nested popup consumes Escape before cell editing does. No global interception of these keys.
- Announce column header, product row identity, value, invalid/read-only/selected state. A selection cell uses a checkbox; Space toggles only that cell's checkbox, never arbitrary rows while typing.
- Maintain stable row/cell IDs when sorting/filtering. Virtualization must preserve the focused/edited row, expose correct row/column counts and indices, and have a paginated native-table alternative. Do not virtualize simply because a dataset exceeds one page.
- Bulk paste/multi-cell fill is out of v1 scope. Do not create spreadsheet expectations that cannot be met.

### 6.5 Comboboxes and rich search [R4]

Brand, customer, and simple product-reference selection can use editable comboboxes: visible label, `aria-expanded`, `aria-controls`, `aria-autocomplete`, stable option IDs, active descendant where appropriate, and a listbox of selectable text options. Up/Down changes active option; Enter selects; Escape closes without clearing user text; Tab exits without secretly selecting; normal Left/Right/Home/End text editing survives. Empty/loading/error are announced, not selectable fake options.

Quote catalogue search is a **search field followed by a semantic results list**, because each result contains Open, Add, and sometimes Add both. Do not put interactive buttons inside listbox options. Enter in the search field submits/refreshes search, not an unannounced add. A Jump to results link and labeled result buttons make the whole flow discoverable without shortcuts.

## 7. Exact page and surface inventory

Paths below are proposed UI paths, **not existing files or backend API contracts**. Named overlays count as required surfaces without requiring a separate page. Direct links must enforce role/business permissions server-side. Every surface inherits §5 states and §6 keyboard rules.

| ID | Page / path or overlay | Access | Required sections / primary action |
| --- | --- | --- | --- |
| A1 | Sign in `/sign-in` | Signed out | Email, password, show password, recovery link; Sign in. |
| A2 | Account recovery `/recover`, `/reset-password` | Signed out | Request/reset form, generic confirmation, expired-token recovery. |
| A3 | Create business `/onboarding/business`; invitation `/invite/:token` | New Owner / invited Employee | Business basics or invitation context; Create business / Accept invitation. |
| A4 | Business chooser, session/access/not-found surfaces | Authorized memberships | Business selection or safe recovery; never expose unauthorized record details. |
| H1 | Dashboard `/` | Owner, Employee | Four work cards: catalogue updates, quotations, PDF review, Tally; no charts. |
| C1 | Catalogue `/catalogue?scope=mine` | Owner, Employee | My Catalogue / Global Catalogue tabs, search, filters, table; New PDF update. |
| C2 | Add to my catalogue pricing sheet | Owner, Employee | Global MRP, optional cost, discount, calculated quote price; Add. |
| C3 | Product detail/pricing/history drawer | Owner, Employee | Identity, seller pricing, approved history, aliases, relationships, Tally stock timestamp. |
| C4 | Price updates `/catalogue/updates` and adoption confirmation | Owner, Employee | Current vs latest MRP, selection, impact preview; Use selected prices. |
| C5 | Suggest relationship overlay | Owner, Employee | Source/target, relationship type/direction, local/pending-global status; Submit suggestion. |
| I1 | New PDF `/catalogue/imports/new` | Owner, Employee | File, optional brand/date, file validation; Upload and process. |
| I2 | Processing `/catalogue/imports/:jobId` | Owner, Employee | Durable stages, counts, source/job metadata; Continue review when ready. |
| I3 | Import history `/catalogue/imports` | Owner, Employee | File, date, stage, row counts, duration, retry/review action. |
| I4 | PDF review `/catalogue/imports/:jobId/review` | Owner, Employee | Decision counts, filters, comparison table, row editor/source pane; Save review / Add or update catalogue. |
| I5 | Review commit/result surface | Owner, Employee | Selection impact, blockers, immediate seller outcome vs pending global claims. |
| Q1 | Quotations list `/quotations` | Owner, Employee | Search, lifecycle filters, customer/amount/revision table; New quote. |
| Q2 | Build `/quotations/:quoteId` | Owner, Employee | IDE tabs, customer, seller search, quote lines, totals, save state; Share / Generate PDF. |
| Q3 | Customer select/edit, line editor, required-item prompt | Owner, Employee | Lightweight name/phone; quantity/pricing; explicit Add both / Add only. |
| Q4 | Share overlay | Owner, Employee | Saved revision/total/phone, public-link notice; Open WhatsApp / Copy link. |
| Q5 | PDF generation/documents overlay | Owner, Employee | Revision, generation state, download/archive outcome, previous documents. |
| Q6 | Quote history/revision/proposal panel | Owner, Employee | Events, immutable revisions, proposed change diff; Accept into new revision / Reject. |
| Q7 | Void/revise/expiry and billing entry confirmations | Owner, Employee | Consequences and exact revision; dedicated deliberate action. |
| P1 | Public quote `/q/:shareToken` | Bearer-link Customer | Shop identity, customer-safe revision, lines, totals; Approve / Suggest changes. |
| P2 | Public approval confirmation/result | Bearer-link Customer | Exact revision and total, approval meaning; Confirm approval. |
| P3 | Public proposal editor/result | Bearer-link Customer | Quantity/removal diff, optional later seller-item picker; Send changes to shop. |
| P4 | Public unavailable/stale/expired/void states | Bearer-link Customer | Safe explanation and shop contact when authorized; no internal shell. |
| T1 | Tally overview `/tally` | Owner, Employee | Connection/company/freshness, sync status, mapping backlog, recent jobs; Sync now. |
| T2 | Stock/items `/tally/items` | Owner, Employee | Item identity, UOM, observed stock/rate, timestamp; review mapping. |
| T3 | Mapping queue/detail `/tally/mappings` | Owner, Employee | Seller product and Tally candidates; Confirm mapping / Map manually. |
| T4 | Create stock item confirmation | Owner, Employee | Company, name/SKU/UOM and required masters; Create in Tally. |
| T5 | Billing preflight/progress/result | Owner, Employee | Approved revision, company, mappings, masters, refreshed stock; Create bill in Tally. |
| T6 | Sync/billing job history/detail `/tally/jobs` | Owner, Employee | Status, quote/revision, attempts, timestamps, voucher result; safe retry/reconcile. |
| S1 | Settings → Business `/settings/business` | Owner edit; Employee read-only safe fields | Name, phone, address, quote identity; Save business. |
| S2 | Settings → Employees `/settings/employees` | Owner | Members/invites, role, invite status; Invite employee / Revoke invite / Remove employee. |
| S3 | Settings → Tally `/settings/tally` | Owner | Pairing, company confirmation, voucher mode, connection management. |
| S4 | Settings → Preferences `/settings/preferences` | Owner, Employee; own preferences only | Density, optional shortcuts/help, motion; Save preferences. |
| S5 | Settings → Account `/settings/account` | Signed-in user | Own identity/security actions supported by auth provider; Sign out. |
| M1 | Admin queues `/admin` | Platform Admin | Product claims, Prices, Relationships, Duplicates; counts/filter/next item. |
| M2 | Product claim detail | Platform Admin | Current/proposed/source comparisons, provenance; Approve / Reject. |
| M3 | Price claim detail | Platform Admin | Current/proposed/effective date/evidence/conflicts/history; Publish price version. |
| M4 | Relationship review detail | Platform Admin | Two products, type, direction, provenance; Approve / Reject. |
| M5 | Duplicate review/merge confirmation | Platform Admin | A/B comparison, destination and reference impact; Not duplicate / Merge into chosen target. |
| M6 | Operations `/admin/operations` | Platform Admin | Last-24-hour resource/quality/job metrics in text/table, timestamps, failures. |

## 8. Screen specifications: entry, catalogue, ingestion

### A1–A4. Entry and access

Use a compact white form on warm canvas, Rallie mark, task heading, and clear help. No marketing carousel or forced splash. Password managers, paste, show-password, autocomplete, and accessible authentication are supported. Recovery submission returns generic copy regardless of account existence. Invitation shows business and invited role before acceptance, with valid/expired/revoked/already-accepted/wrong-account states; do not let an Employee promote themselves to Owner. Business creation requests only name, contact phone, and address needed by the product; identity is handled by authentication, not an invented CRM onboarding wizard.

Keyboard: initial route focus on heading, natural form order, Enter submits only the current form after composition ends, failed submit focuses error summary. Choosing a business restores only that business's authorized state. Reauthentication must not replay Share/Bill/Merge automatically. Account creation, password policy, and recovery mechanics follow the selected auth provider, not new UI cryptography.

**Accept:** keyboard/password-manager sign-in works; invitation states are truthful; unauthorized deep links reveal no data; preserved edits never cross users/businesses.

### H1. Dashboard

Four compact task cards in a two-column grid (single column on small screens):

1. **Catalogue:** products with newer approved prices → Review updates.
2. **Quotations:** open and customer-approved counts → Open quotations, with approved filter link.
3. **PDF processing:** processing and needs-review counts → Continue review or Import history.
4. **Tally:** connection, confirmed company, stock last-synced timestamp → Open Tally; Owner sees setup link if unconnected.

Counts come from aggregation, not a full client-side catalogue download. Zero is useful copy (“No price updates to review”), not missing content. Each card can fail/retry independently. No decorative chart or trend percentages. Navigation uses ordinary links; refreshing counts never reorders cards or moves focus.

**Accept:** all four cards fit a 1366 × 768 first view without giant empty areas; zero/loading/error/partial-error states retain geometry; Employee cannot reach Owner setup through a card.

### C1. Catalogue scopes

Header: Catalogue, My Catalogue/Global Catalogue tabs, New PDF update; secondary Import history and Review price updates. Below: labeled scope-aware search, Brand filter, carried/status/price-update filters as appropriate, result count and pagination. Avoid category trees the data cannot reliably support.

**My Catalogue columns:** selection where needed; brand + SKU + product name; Your MRP; Latest approved MRP + new-price indicator; cost (or “Not entered”); default discount; default quote price; carried/status; Open action. On narrower views show identity, Your MRP, quote price, and update state first; other fields live in detail, never vanish from the workflow. Tally stock is optional contextual data with its own timestamp, never a fake live inventory number.

**Global columns:** brand/SKU/name, latest approved MRP/effective date, in-your-catalogue state, Add/Open. No seller cost or margin. Provisional products belong to the seller view with “Pending global review”, not the approved global list. Exact SKU ranks above broad matches; show what matched without altering the code's punctuation.

States: no seller products → Browse global catalogue / Upload PDF; no match → clear filters or explicit global bridge; new global price → actionable difference, not auto-adoption; failed search → retain prior query; already added → idempotent Already in your catalogue state. Keyboard: manual scope tabs, search stays focused through fetch, normal sortable table controls, Open returns to the same row and scroll on drawer close.

**Accept:** owner/employee edit only seller data; same product may show different shop and latest global MRP; no costs cross business boundaries; changing tabs never loses search unexpectedly (keep a separate query/filter state per scope).

### C2–C3. Add pricing sheet and product drawer

Add sheet shows product identity, selected global MRP/date, optional cost, default discount, calculated default quote price; Cancel/Add. Blank cost produces unknown profit, not zero. If manual quote price is supported, label the pricing basis explicitly so discount and unit price cannot silently compete.

Product drawer: identity/description → Your pricing → chronological approved price history → seller aliases → relationships → Tally mapping/stock context. Mark **Your active price**, **Latest approved**, and seller override separately. Actions: Save seller pricing, Use this price version, Add/remove local alias, carried toggle, Suggest relationship. Global identity is read-only for a seller; use a proposal/review path rather than silently editing shared facts. A global-only product has Add pricing rather than editable seller fields.

Price history includes effective date and approval/provenance where permitted; source access is authorized and private. Adopting a version previews old/new values and any resulting discount-derived default quote price. A manual default unit price stays manual unless explicitly changed. Existing quotes remain unchanged. Editing a carried flag is not hard deletion and does not erase snapshots.

Keyboard/state: modal drawer heading receives focus; fields use natural Tab order; Save failure keeps the drawer and values; dirty Close invokes resolution; successful Add returns to invoking result. Price/source subsection navigation uses headings/links, not hidden accordions for essential facts.

**Accept:** missing cost is honest; unknown/pending global identity is labeled; price history remains append-only; aliases affect only the shop; adoption result explicitly says existing quotes were not changed.

### C4–C5. Price adoption and relationships

Price updates page is a native selectable table: product, active MRP/version/date, latest approved MRP/version/date, absolute and percentage difference, override state, action. Filters include brand and newer-price availability. Header selection applies to **this page** and says so; cross-page selection is a separate explicit opt-in with count and scope, never implicit. Preview bulk impact and exclude blocked rows visibly. Commit reports per-row outcome if backend cannot guarantee one transaction; failed rows retain selection and retry context. Unknown effective date is “Not supplied”, not today.

Relationship suggestion requires source, target chosen by labeled search, and one of **Required with / Commonly sold with / Alternative**. Display direction explicitly for Required with; never infer reciprocity. Show “Available in your shop now · Pending global review” on successful local proposal. Rejected, duplicate, self-reference, unavailable target, and server-conflict states explain resolution. No invented compatibility from product-name similarity.

Keyboard: native checkboxes and buttons; selection count announced once; confirmation safe initial focus; product picker follows combobox contract; completion returns to relevant row/relationship heading.

**Accept:** price adoption never updates unrelated products or quotes; relationship suggestion provides local value without claiming global approval; batch scope is visible before commit.

### I1. New PDF update

Focused page: breadcrumb to Catalogue/imports, heading, file chooser/drop zone, selected filename/size, optional brand and effective date, explanation of processing and review, Upload and process. Drag-and-drop is supplementary; Browse works by keyboard/touch. Expose actual server-supported file limit near the chooser rather than inventing a fixed limit in UI copy. Validate MIME/content/size server-side; client checks are only early feedback. Unsupported, encrypted/unreadable, oversized, interrupted, expired upload URL, and upload failure states give specific next steps without exposing storage credentials.

Brand may be omitted at upload; detected brand must be confirmed before review commit. Do not require a fictitious effective date. Upload uses real transferred bytes when available; extraction is not part of that percentage. Navigating away during an incomplete upload warns that transfer may stop; after safe upload the durable workflow can continue. Keyboard file chooser and Enter submit work; error summary links to file or metadata field.

**Accept:** file is not sent by selecting it alone; safe-upload completion is distinct from extraction completion; duplicate documents reuse extraction while recording this seller's independent submission.

### I2–I3. Processing and history

Stages map to the actual durable state: Created/Uploading → Uploaded → Reading/Parsing → Extracting → Matching → Ready for review → Reviewing → Committing → Completed. Display stage list with text/icon, found-row count only when known, started/updated time, file/brand, and “You can leave this screen. Processing will continue” only after safe upload.

No invented linear percentage across unpredictable extraction steps. Poll active jobs approximately every 2–3 seconds with backoff and visibility awareness; never move focus on a poll. Reused extraction says “Previously processed file found; preparing your review” rather than acting as if AI ran again. Failed stage shows retry eligibility and diagnostic ID; server retry continues/reuses safe state, not a new untracked upload. Human review persists beyond workflow retention and is not a workflow waiting spinner.

History table: document, submitted date, effective date if known, status/stage, rows, duration when known, last error, Continue review/Retry/Open result. Empty history points to New PDF. Ready state announces once and exposes Continue review; do not auto-navigate while user reads. Stale polling/network failure is not mislabeled processing failure.

**Accept:** leave/reopen resumes correct server state; history includes failed jobs; no repeated live-region announcements; unknown counts are not zero; completed job does not rerun on refresh.

### I4–I5. Review and commit

This is a primary work surface, not a generic CRUD page. Header identifies document, brand confirmation, optional effective date, saved state, and source access. Summary reports **Already in your catalogue / Known globally, not carried / New products / Need attention** with counts. Filters: All, Needs attention, Existing, New; attention can overlap product categories, so do not sum overlapping counts as if exclusive. Include search, selected count, and explicit pagination.

Table/row editor inventory:

- Selection / Carry this product; brand; SKU/product ID; name; description in expanded editor; extracted/corrected MRP.
- Alongside it, seller's **existing MRP, cost, default discount, default quote price, carried state**, and proposed cost/discount changes. Existing values are not overwritten merely by opening a row.
- Decision label: exact existing match, known global, new product, missing required data, possible duplicate, conflicting price, duplicate row, or ignored/excluded.
- Possible match provides two explicit actions **Same product / Different product** with identities side by side. Fuzzy suggestions are never committed as automatic merges.
- Evidence panel contains source page/row hint, raw/source text, original extracted values, and seller-corrected values separately. Lazy-load PDF viewer on Open source; text remains available if PDF viewer fails. Store corrections as corrections, never rewrite evidence.

Editable fields are limited to Brand, SKU/product ID, name, description, MRP, carry, cost, and default discount. Do not add inferred category/series/ontology editing. Require valid brand, identity/name, and price for selected rows according to domain validation; unresolved ambiguity blocks only affected rows unless user explicitly excludes them. Zero/negative/missing price needs a clear domain decision, never silent coercion. Cost is optional; unusual price movement is a review warning with amount/percent, not an AI confidence meter.

Footer: **Save review for later** and **Add/update my catalogue (N)**, selected count, unresolved blockers. Save records human review in durable application state. Commit preview groups adds, price changes, unchanged, excluded, and blocked rows; shows whether active seller MRP will change. Confirm brand and preserve “date not supplied” where applicable. Explain before committing: **Your shop receives selected changes now; global product/price claims await Platform Admin review.**

States: source unavailable with text fallback; reviewer conflict; unsaved corrections; validation errors; no selected rows; committing with duplicate-submit guard; all succeeded; partial failure only if backend permits partial execution; already committed/idempotent reopen. On fully atomic failure say nothing was applied. Never display partial success for a rolled-back operation. Completed view shows applied counts, skipped/failed rows, pending-global status, and Open My Catalogue; retry only unapplied work.

Keyboard: native table + row editor is baseline; optional grid follows §6.4 completely. Row editor offers Previous/Next and returns to the original row. Error summary links to filtered/paginated rows, revealing the row before focusing its field. Closing evidence restores Open source. Sticky commit bar never covers focused cells. Bulk selection does not jump focus or select across pages silently.

**Accept:** source, extraction, correction are distinguishable; old seller commercial values are visible beside new MRP; same-file submissions remain independent evidence; review can resume a week later; unselected rows remain untouched; seller result and pending global publication are separate outcomes.

## 9. Screen specifications: quotations and documents

### Q1. Quotations list

Header with New quote; customer/phone/quote-number search; lifecycle filters Draft, Shared, Changes proposed, Approved, Tally pending, Billed, Void, Expired. Billing failures get a visible error indicator/filter without implying approval was revoked. Columns: quote number/customer, current revision, total, status, last activity, Open. Show customer-approved revision when it differs from a newer draft. Sort defaults to recent activity; no financial charts.

Empty → Create first quote. No matches → clear filters. Open focuses an existing workspace tab if already open; otherwise creates one without duplicating the quote. New quote is a deliberate action with double-click guard; no blank server quote on every page load. Keyboard uses standard table links/filter controls; list state is restored after leaving Build.

**Accept:** list distinguishes approved from billed; one quote ID opens one workspace tab; filters/bookmarks survive navigation; void/expired records remain available as history.

### Q2–Q3. Build workspace

At desktop, customer context and seller catalogue search on the left; quote lines, totals, and actions on the right, under IDE tabs. Keep quote number, revision/state, and reserved save label visible. Use vertical space efficiently without reducing legibility. The quote pane is a real working area, not a narrow shopping-cart popover.

**Customer:** lightweight name/phone selection from this business only; allow creating/updating name and phone without a CRM detour. Draft may be untitled; WhatsApp share requires a valid international phone. A selected customer's address-book update and a historical quotation snapshot are different; label any action that changes shared customer data.

**Search/results:** My Catalogue only, exact SKU first, seller aliases supported. Result shows brand, name, SKU, active MRP, default quote price, and known relationships. Out-of-stock/stale stock is contextual and dated, not a silent add prohibition unless domain validation requires it. No seller match → explicit “View matching global products and add to my catalogue” flow with pricing sheet. Do not silently mix unpriced global items into results.

**Adding:** Add has immediate in-place feedback and retains search context. Required-with prompt names both items and their quantities/prices; actions Add both / Add this product only / Cancel. Neither relationship suggestions nor approvals silently add lines. If required item is already present, explain existing quantity and any proposed increase; avoid duplicates by accident. If missing from seller catalogue, resolve seller pricing before adding it. Alternatives are suggestions, never automatic replacements.

**Line inventory:** product snapshot identity/description; quantity and UOM; MRP snapshot; discount; quoted unit price; line total; seller-only cost/profit; Remove. Use a row form/details expansion rather than many tiny unlabeled fields. Label fields with product context. Removal has visible undo or confirmation where loss is consequential; it must not rely on a toast alone. Last-line removal returns focus to quote-empty state/Add products. No drag-only reordering; if ordering ships, provide Move up/down controls.

**Pricing:** quantity × unit price yields line total; discount-derived price or manual unit price has an explicit active basis. Money uses domain-defined minor-unit/rounding rules; UI and server share fixtures. Do not invent tax/GST calculations or silently round away paise. Show MRP total, discount/savings if meaningful, quote total, and internal profit. If any cost is missing, total profit is “Incomplete — cost missing for N lines”; optionally show a labeled known-lines subtotal, never a falsely complete total. Negative margin can warn non-blockingly; shop pricing is not overwritten by editing a quote.

**Saving:** recompute display totals immediately; persist after roughly 500 ms debounce or blur/action. Share, PDF, and billing flush/validate pending changes and wait for server acknowledgement. Save labels: Unsaved changes → Saving… → Saved at time, or Couldn't save · Retry. Server version conflicts show your values vs saved values; preserve input and prohibit sharing an uncertain revision. Losing network never changes label to Saved. Approved/shared snapshots are not mutated by inline editing; edits create a new working revision with clear reapproval requirements.

Keyboard: manual tab contract; visible Jump to search / Jump to quote / Add line controls; ordinary result actions; no Enter-to-add from a typing field; no shortcut required to switch customer or adjust quantity. Keep focus/caret on the edited field when totals update. Announce total on committed edit or a restrained debounce, not every character. On Add, announce product/quantity and keep focus at its Add button; offer a jump rather than forcing it into the line.

**Accept:** two customers can be served without state crossing tabs; missing cost is not zero; catalogue MRP changes never rewrite snapshots; failed saves prevent share of unsaved data; composition Enter never adds an item; all line actions fit touch mode.

### Q4. Sharing

Share sheet shows quote/customer, exact revision and total, phone validation, and explanation that anyone holding the link can see this customer quotation. Steps: validate → persist revision → acquire authorized public link/mark that revision shared → offer **Open WhatsApp** and **Copy link**. Use trusted Rallie-origin link construction. Avoid popup blockers by presenting a user-activated final link after async save, rather than relying solely on delayed `window.open`.

State labels distinguish Saving, Link ready, WhatsApp opened, and Cannot open WhatsApp. Copy link is a fallback. Do not claim message delivery/read receipts. Repeated Share reuses the appropriate revision/link operation rather than duplicating revisions accidentally. Shared status and app navigation never trigger PDF generation.

Keyboard: form validation summary; final WhatsApp link clearly says opens new tab; dialog focus stays logical after copy; close returns to Share. No private cost/profit in message, URL parameters, or link preview. Do not offer unsupported revoke/expiry controls as if implemented; if link expiry is configured, show the actual effective state.

**Accept:** invalid phone blocks WhatsApp action with recoverable input; stale/failed saves cannot be shared; blocked popup still has a visible link; customer sees only the intended shared revision, not an unshared working draft.

### Q5. PDF and documents

Generate PDF is explicit only. Persist a coherent revision snapshot first, then dynamically import the renderer and render the customer-safe document. Saving, sharing, opening a quote, approval, and hover/prefetch must not generate a document. Button states: Generate PDF → Loading document tools → Generating revision N → Download ready, or Failed · Retry. Avoid unsupported precise progress percentages.

Document layout: shop name/contact/address, quote/customer identity, date/revision, product brand/SKU/name, quantity/UOM, MRP/discount/unit price/line totals as applicable, total, validity/terms only when actually configured, and clear **Quotation — not a tax invoice** designation. No cost, profit, internal evidence, diagnostic IDs, or Tally secrets. Local/self-hosted fonts only; no runtime network font fetch. Repeat table headings across pages, avoid stranded totals, retain readable selectable text and logical order; provide accessible HTML quote as the primary alternative and do not claim a tagged accessible PDF unless verified.

Separate download success from optional R2 archival success. If download succeeds but archival fails, say so and retry archival for the same document; don't create misleading duplicate records. Documents list revision, created time/actor, available download, and archival state. Regenerating a changed revision makes a new historical document; never replace the approved old one. Browser restrictions may require an explicit final Download button.

Keyboard: progress announced politely; focus not stolen by renderer; Cancel/Close dismisses UI without pretending a completed download can be recalled; completion exposes a focusable download link. Closing or switching quote must not cause another quote's PDF to be downloaded/labeled by mistake.

**Accept:** initial app bundle excludes PDF renderer; PDF contains exactly one known revision; non-generation events produce zero documents; document creation/archive states are independently truthful.

### Q6–Q7. Revision history, changes, and consequential actions

History panel shows chronological events with actor, timestamp, revision and total: created, shared, customer proposal, accepted/rejected, approved, PDF generated, billing requested/failed/acknowledged, voided/expired. Revision selector is read-only for history; old approval remains attached to its exact revision/hash. Show “Approved revision 2 · New draft revision 3 needs approval” rather than erasing audit history.

Proposal review shows base revision and explicit added/removed/quantity-changed lines, prior/new values, and requested status. **Accept into new revision** creates seller-owned working data; seller can reprice and must reshare. Reject keeps the seller quote unchanged. If the base is stale, show comparison and require reconciliation; never blindly apply it to a newer revision. A rejection comment is helpful only if supported, not a hidden requirement.

Editing an approved quote starts with a clear revise action/notice; new content cannot inherit the prior approval. Void confirms quote/revision, public consequence, and that it does **not** reverse an existing Tally voucher. Expiry is derived from real domain validity, not a cosmetic tag. Billing action appears for an eligible approved revision and opens T5; browsing history never triggers it. While billing is pending, do not allow ambiguous revision mutation or a second bill request; preserve the immutable job payload and explain how to wait/reconcile before proceeding.

Keyboard: history is a list/table with named revision controls; diffs use text, not red/green alone; confirmations follow safe-focus rules; result focus moves to revision/result heading when explicitly created.

**Accept:** stale revision approval cannot approve newer content; customer proposals never directly alter price; voiding cannot reverse accounting; every displayed approval and PDF identifies its revision.

## 10. Screen specifications: public customer experience

### P1. Public quote

Mobile-first single reading column (maximum around 760 px), white content on warm neutral, shop identity more prominent than Rallie. No app rail, user account, onboarding, internal role controls, or seller analytics. Show quotation number, named customer, date/revision, valid-until only if supplied, clear status, and shop contact. Product lines show brand/name/SKU, quantity/UOM, MRP/discount where appropriate, quoted unit price, line total; total remains unambiguous. No public cost/profit even in hidden DOM, JSON, PDF, accessible descriptions, or tracking.

Primary Approve quotation; secondary Suggest changes and contact shop. Sticky mobile action area must not obscure content or focus; reserve its height including safe area. Do not require customer registration/OTP in v1 or imply verified legal identity: possession of this private link authorizes access. No unrelated ads, public catalogue links, or social sharing widgets. Tokens are bearer credentials: no third-party analytics on this page, no token/referrer leakage, no sensitive local-storage persistence.

States: shared/current; already approved (revision/time, no duplicate CTA); changes sent; seller preparing a new quote; approved older revision vs new offer; billing pending/billed with appropriate acknowledgement but not an invented tax invoice. No access to unshared working drafts. Public stock or catalogue detail appears only through an intentionally safe DTO, never internal catalogue serialization.

Keyboard: linear headings/lines/actions, standard buttons and links, no global chords; auto-refresh does not steal focus or replace a customer's active reading/selection. If an updated offer is available, show a clear View latest offer action before approval.

### P2. Approval

Confirmation names the shop, quote number, exact revision, and total; explain this confirms that offer and is not payment. Provide Cancel and **Approve ₹X**. Submit includes the revision identity/hash expected by the server, not whatever quote happens to be current. Pending prevents duplicate submission; success displays approved revision/time. Repeated request returns the same approved outcome safely.

If revision is stale, reject with “The shop updated this quotation. Review the latest version before approving.” Preserve context, offer View latest, and require a new deliberate confirmation; never auto-approve newer content. Expired/void/unavailable token blocks mutations. Confirmation follows modal focus rules and initially focuses explanatory content or Cancel; result focuses success heading.

### P3. Suggest changes

Start from identified base revision. V1 permits quantity changes/removal and clear Undo removal; show original and requested values. No edit control for MRP, discount, unit price, seller cost, or total. Label total as estimated/pending shop review where new pricing is unknown; never present a proposed price as agreed. All-removed proposal needs an explicit confirmation rather than silently becoming a zero-value order.

Later add-item increment may expose **only this seller's customer-safe catalogue** through a dedicated public search contract. It must not expose internal costs, margins, unapproved global evidence, aliases marked internal, or other shops. Its availability is a release gate, not a promised first-release feature.

Send changes produces a pending proposal, not direct mutation. Confirmation says “Changes sent to the shop. Your quotation has not changed yet.” Duplicate-submit guard, retry with retained fields, stale-base comparison, withdrawn/unavailable quote handling, and safe cancellation are required. Keyboard uses labeled quantity fields and explicit Remove/Undo buttons; error summary links to the line; return focus to Suggest changes after cancelling.

### P4. Unavailable and exceptional public states

Invalid/revoked/unavailable links use non-enumerating copy: “This quotation link is unavailable. Ask the shop for a new link.” Show shop contact only when the token is authorized to reveal it. Expired/void offers may show safe historical content if policy allows, but never active approval controls. Network failure offers Retry and does not imply the offer was withdrawn. Pending approval after lost connection shows “Checking approval status” before offering another submit; no invented success.

**Public acceptance:** complete approval/proposal on 320–360 px widths and keyboard; totals never mismatch the confirmed revision; no internal field leaks in response/DOM/download/logging; no customer account required; screen-reader confirmation announces the exact amount and revision; opening/viewing never bills or generates a PDF.

## 11. Screen specifications: Tally and settings

### T1–T2. Tally overview and stock items

Overview shows four independently named facts: **Bridge connection**, **Tally reachable**, **Confirmed company**, **Last stock sync**. One green dot must not stand in for all four. States: not configured, pairing, connected, bridge offline, Tally closed/unreachable, no company loaded, wrong company, syncing, stale observations, sync error. Owner gets Settings → Tally; Employee sees safe connection information and asks Owner for setup.

Main actions: Sync now, Review mappings, View jobs. Stock table shows Tally identity/name, aliases if supplied, unit, observed stock, optional configured rate, last sync, seller mapping. “14 pcs · Last synced 7 minutes ago” always retains an absolute accessible timestamp. Unknown stock is “Not available”, not 0; stale stock is never called live. Rates from Tally are observations, not silent overrides of Rallie quote pricing. No stock adjustment or accounting editor.

Keyboard uses tables, explicit refresh, and normal navigation; sync announcements occur at start/result, not every heartbeat. Sync may continue after navigation. Prevent duplicate Sync now while equivalent job is active, with explanation.

**Accept:** connection and stock freshness can disagree visibly; last-known data remains dated during outage; correct company is always visible; neither sync nor row view changes shop selling prices.

### T3–T4. Mapping and master creation

Mapping queue filters Unmapped, Proposed, Confirmed, Rejected. Detail shows seller brand/SKU/name and each Tally candidate's identity/name/UOM/stock/time plus reason such as Exact SKU or Similar name. Prefer explainable evidence to “99% likely”; it is still a proposal. Candidates use a radio group, including None of these; Confirm mapping persists stable identity/company. Manual search is always possible. Reassigning a confirmed mapping previews the change and affects future operations only, not old job evidence.

No candidate → Create stock item in Tally / Map manually / Cancel. Creation confirmation includes confirmed company, name/SKU, UOM, and required configured master context; explain that this creates an accounting master. Validate required fields before dispatch. Pending, Tally rejection, unknown outcome, and success retain job ID and actual created Tally identity. A timeout is not proof that creation failed; reconcile before retrying. Do not auto-map on a fuzzy score or imply new master creation guarantees voucher creation.

Keyboard: radio arrows/Space choose, explicit button confirms; search combobox follows §6.5, or a full results table if candidates have multiple actions; after confirmation next queue row is optional, never steals focus during background refresh.

**Accept:** confirmation is required even for a strong proposed match; units/company are visible; creation has durable outcome tracking; corrected mapping does not rewrite billed history.

### T5–T6. Billing preflight and jobs

Preflight identifies **customer-approved revision, total, selected voucher mode, confirmed company**. Checklist: bridge online; Tally reachable/correct company; all lines confirmed-mapped; required ledger/stock/UOM masters; stock refreshed; shortage warnings with affected quantity. Blockers have actionable links returning to the same preflight. A stock warning is not automatically a blocker; use explicit configured policy, not invented availability logic. Do not let the UI substitute products/rates to satisfy stock silently.

Final action **Create bill in Tally** is explicit and confirms the immutable revision/company. State progression: queued → delivered/executing → awaiting Tally result → acknowledged success or error/unknown outcome. Parse actual Tally import success and voucher identity; HTTP 200 alone is insufficient. While pending, disable duplicate billing with reason and let the user leave for Job details. After connection loss following execution, show **Awaiting confirmation — do not create another bill** and reconcile using the same idempotency key. Retrying must not produce a new commercial action or key.

Normal Sales Voucher success may show Billed with voucher number/master identity and time. **Optional Voucher success must say “Sent as optional voucher — awaiting Tally posting”, not ordinary Billed**, until posting is verified. This is a required domain/status clarification before enabling optional mode; hide that setting if the backend cannot represent the distinction. Rallie does not fabricate a final GST/tax invoice or recalculate Tally accounting totals silently.

Job table/detail: operation, quote/revision, company, created/updated times, status, attempts, sanitized last error, voucher result and correlation ID. Queued/active jobs can be inspected; not all can be cancelled. Expose Cancel only if actual cancellation semantics exist. Retry only after safe reconciliation/confirmed failure. Show actionable master/line errors without raw secrets or unredacted XML. Viewing a job never executes it.

Keyboard: preflight headings/checklist/links in order; final confirmation safe focus; progress uses polite announcements and retains focus; success heading receives focus after user-directed completion, not a background ACK on a different screen.

**Accept:** quote viewed/approved → zero billing jobs; explicit confirmed action → one durable job; disconnect after Tally creation/before ACK → original voucher recovered, not duplicate; wrong-company/unmapped blockers cannot be bypassed client-side; optional voucher is not misrepresented as posted billing.

### S1. Settings → Business

Owner edits shop name, contact phone, address, and customer-facing quote identity supported by the domain. Show a small text preview of how identity appears on public quotes/PDFs; avoid inventing a full template editor. Save/cancel and dirty-state guard; successful changes affect future content under snapshot policy, not silently rewrite historical documents. Employee sees only safe read-only identity and “Ask the owner to change business details”.

Keyboard: ordinary form and focused error summary. States: loading, unchanged, dirty, saving, saved, invalid phone/missing name, conflict, permission revoked. **Accept:** Employee cannot submit Owner mutation by direct request; old generated PDFs remain unchanged; settings errors retain input.

### S2. Settings → Employees

Owner-only native table: name/email, role, membership or invitation state, invited/joined date, actions. Invite form asks email and fixed Employee role, with clear business name. Pending, expired, revoked, already-member, delivery-failed, and accepted states differ. Resend/revoke only when backend supports them. Removal confirmation identifies person and loss of business access; history retains actor identity. No Manager/Salesperson role editor, platform-admin assignment, or casual owner deletion. Prevent removing the last Owner and leave ownership transfer outside scope unless defined.

Keyboard: Invite dialog field first; remove/revoke safe confirmation; after removal focus next row or table heading. **Accept:** Employee cannot view management UI or manage owners; duplicate invitation errors are recoverable; removal never deletes historical quotes/events.

### S3. Settings → Tally setup

Owner-only guided sequence, with editable review before final connection:

1. Explain Windows Tally PC and local bridge; browser may be on another OS. Show trusted bridge download/instructions only when available.
2. Generate short-lived pairing code, display expiry and Copy code; regeneration invalidates old code according to server policy. Pairing code is a secret, excluded from logs and analytics.
3. Install/start bridge on Tally PC; bridge opens outbound secure connection. Never instruct opening an inbound Internet port.
4. Verify bridge connection and local Tally HTTP availability; explain Tally running, server configured, company loaded. Do not expose localhost XML directly from browser.
5. List discovered companies; Owner explicitly selects and confirms full company/fiscal identity. Never automatically bind the first company.
6. Start initial sync; link to mapping queue and Tally overview when ready.

States: code expired/copied/waiting, bridge unreachable, Tally unreachable, no companies, multiple companies, selected company gone, sync failed, connected. Returning later shows actual connection, not a reset wizard. Device disconnect/revoke confirms impact and pending-job reconciliation; it must not lose unknown billing results. Voucher mode controls explain normal Sales vs Optional and respect T5's status gate. Automatic billing is absent/off in v1. Do not add competing two-way price synchronization settings.

Keyboard: ordered steps/heading announce progress; code selectable/copied with button, not time-limited keyboard puzzle; company radio/select; step changes focus heading; expired code keeps a visible Regenerate action. **Accept:** pairing cannot attach the wrong business/company silently; Employee has no credential access; disconnect warning describes pending jobs.

### S4–S5. Preferences and account

Preferences are per user: Comfortable/Compact density, optional shortcut enable/remap and help, reduced-motion preference (System/Reduce; never override system Reduce with forced animation). Touch minimums override Compact. Preview preference effects without moving the currently focused control. Save/reset feedback is explicit; preference failure does not alter business data.

Account shows signed-in identity and supported provider-managed security controls. Password fields accept paste/managers, validate through provider, and never reveal stored credentials. Sign out resolves unsaved edits, clears business/session-sensitive in-memory data and appropriate caches, then returns to Sign in; do not claim unsaved server persistence. Platform Admin without a business membership still gets own account/preferences via account menu, not business settings access.

Keyboard help is a named non-modal page or modal dialog with a visible Close, searchable action list if needed, and full shortcut-disable control. **Accept:** disabling shortcuts restores ordinary character input everywhere; density does not shrink touch targets; OS reduced motion is honored; sign-out never leaks the previous quote into next sign-in skeleton.

## 12. Screen specifications: platform administration

### M1. Moderation shell and queues

Admin is a separated work area labeled Platform administration, not a new business role. Four manual-activation tabs: **Product claims, Prices, Relationships, Duplicates**, with counts and filters Pending/Reviewed plus supported brand/date filters. Operations is a secondary link. Queue tables show product/proposal summary, source/submission context, received date, conflict/attention label, and Review. No bulk approve-by-confidence or “three shops means true” shortcut.

Detail uses side-by-side current/proposed data and an evidence pane; at narrow widths stack labeled Before/Proposed sections. Actions remain near a concise consequence summary. Every decision records actor/time/source and is reflected in history. If another admin decided first, show resolved state and reload comparison; do not double-publish. Empty queue says All caught up with filters/history link; source failure leaves the item unresolved with retry.

Keyboard: native queue tables, manual tabs, heading focus on detail, source modal returns to evidence link, close/Back restores original row/filter. Optional Next item is explicit after completion; no automatic advancing during screen-reader reading. Financial/global destructive actions have no character shortcuts.

### M2. Product claims

Compare brand, SKU, name, description field by field; distinguish new product vs changes to existing identity. Evidence lists immutable document/page/raw text, seller correction, independent business submissions, document count, and conflicts. A repeated binary across shops is one document with multiple submissions—not fabricated independent documents. Approve publishes approved identity/claim; Reject records decision/reason if supported. Potential duplicate routes to M5 rather than silently merging. Never expose seller cost/profit merely because the reviewer has platform privileges.

States: pending, source unavailable, conflicting evidence, already resolved, approved, rejected, possible duplicate. Keyboard uses headings and clearly named action buttons, with confirmation where publication scope is consequential. **Accept:** correction never overwrites source; audited publication requires admin action; platform role alone does not grant shop-private price access.

### M3. Price changes

Display current approved MRP, proposed MRP, effective date (or unknown), price delta, history, independent business count, document count, identical-row evidence, conflicts, and source locators. Avoid confidence badges as the decision itself. Button names exact effect, such as **Publish ₹6,000 price version**. Preview clearly states **Shop prices and existing quotations will not change automatically**. Reject preserves evidence and history. Duplicate/already-approved claim does not create another identical version unintentionally.

Keyboard: readable comparison followed by evidence and action; confirmation safe focus; success returns to resolved detail or queue row. **Accept:** history is append-only; seller active MRP stays untouched; seven agreeing submissions do not auto-publish; missing date remains honest.

### M4. Relationships

Show product A/B full identifiers, relation type and direction, local proposer/evidence, existing relationships, and conflicts. Required with is directional; Alternative must not imply unverified technical compatibility. Approve publishes a globally trusted relation; Reject preserves local proposal/audit semantics according to domain policy and explains outcome. Flag self-reference, duplicate edge, and conflicting direction for review rather than silently fixing them.

Keyboard: comparison sections, source access, Approve/Reject, clear outcome. **Accept:** publication is deliberate and auditable; shop-local suggestion is visibly different from global approval; no hallucinated relationship text.

### M5. Duplicates and merge

Side-by-side identity A/B with SKUs, descriptions, price history references, evidence counts, source documents, and active-reference impact. Explicit destination selection shows **Merge B into A** in heading, confirmation, and button. **Not duplicate** is a separate non-destructive decision. Preview states that historical IDs/evidence are preserved, merged product redirects to target, and active references move under domain rules. Do not delete source records or rewrite quote snapshots.

No destructive “accept best match” default, no destination chosen only by fuzzy ranking. Confirm target and impact before server action; safe initial focus; pending disables duplicate submission. Already merged/conflict/target unavailable/rejected merge states retain comparison and recovery. No fake Undo for an irreversible merge; correction requires a defined administrative process.

**Accept:** target cannot be ambiguous; historic quotations/documents keep their content; evidence survives; duplicate-click or concurrent moderation cannot merge twice or into a stale target.

### M6. Operations

Read-only, platform-restricted **Last 24 hours** page: Worker requests; D1 reads/writes; R2 storage; Workflows started/failed; AI-extracted documents; median extraction time; rows extracted; rows requiring correction; exact SKU match percentage; possible duplicate percentage; pending admin claims; online Tally agents; Tally job success percentage. Use metric table/compact text groups, definitions/denominators/time zone, observation window and last updated time. Zero, unavailable, stale, and partial-source failure are distinct.

Resource limits are current configured values if known—not hardcoded promises from an old free-tier table. Support diagnostic links must be authorized and redact tokens, customer phone, secrets, and raw commercial payloads. No requirement for dashboard charts, live request ticker, or fetching every business record into the browser. Refresh is explicit or low-frequency with preserved focus. **Accept:** no platform metrics reach a seller/public session; missing telemetry is not 0; resource usage is not advertised as guaranteed free operation.

## 13. Content and commercial formatting

- Use action/object labels: **Add to my catalogue**, **Use ₹6,000**, **Save review for later**, **Approve quotation**, **Create bill in Tally**. Avoid generic Submit/Proceed where consequences matter.
- Prices use locale-aware Indian grouping and ₹; display paise when meaningful and use consistent precision within a comparison/total. Align decimals where practical. Show negative values with a minus sign, not color alone.
- “MRP” means MRP; “Your MRP”, “Latest approved MRP”, “Quoted unit price”, “Cost price — internal”, and “Profit — internal” are not interchangeable. Lock icon alone is not a privacy control or label.
- Quantity includes UOM. Use real unit precision rules, not a universal integer stepper. Phone numbers are normalized/validated for sharing without unnecessarily forbidding spaces while typing.
- Dates are unambiguous (“28 Oct 2026”); local timestamps include zone/context where needed. Relative freshness has an absolute accessible timestamp. Effective date, upload date, approval date, and sync time are labeled distinctly.
- Empty cost: “Cost not entered”; incomplete profit: “Profit incomplete”; uncertain stock: “Stock not available”; missing effective date: “Not supplied”. Do not fill missing values with 0 or today's date.
- Errors name problem and recovery: “Enter a product code before adding this row”, “Couldn't save. Your changes are still here. Retry”, “Tally created a result we have not confirmed yet. Check job status before retrying.”
- Privacy: no tokens/phones in diagnostic toast text or analytics route names. Public and seller-safe labels are independently reviewed. External link text says when a new tab opens.
- No default tax/discount terms, expiry promises, delivery promises, refund policies, or legal approval language invented by design. Where business policy is undefined, present honest absence or gate the affected feature until the domain contract is settled.

## 14. Motion, cold start, and performance

### 14.1 Motion and splash

- Default micro-feedback 100–150 ms; drawer/popover entrance at most 180 ms using opacity and a small translation. No bounce, parallax, pulsing totals, flashing warnings, perpetual shimmer, or chart animation.
- Respect `prefers-reduced-motion: reduce`: remove translation/scale, smooth scrolling, shimmer, rotating decorative loaders, and nonessential animation; use static status/progress text and immediate state changes. Loading must remain understandable without motion.
- **Splash only on a genuine cold start when critical session/bootstrap state is unresolved.** A small static Rallie mark and “Opening your workspace…” may occupy the already-sized shell region. No minimum display time, timer-based artificial delay, mandatory logo animation, or splash on route changes, quote switches, warm reloads, or background refresh.
- If bootstrap is ready, render immediately without flashing a splash. After roughly 1 s of unresolved loading, show meaningful task/status text; after 10 s without progress, show Retry/sign-in recovery and diagnostic context. Do not hide slow initialization behind a brand screen or fake percentage. Returning cached data must be revalidated and labeled accurately.

### 14.2 Loading boundaries

- Eager initial shell, current-route essentials, system typography, critical styles, and small icons only. Public quote has its own lean entry path, not authenticated shell/admin imports.
- Lazy-load Catalogue review, Admin, Tally, and other non-current route modules. Prefetch lightweight likely-next routes only after idle/explicit intent, respecting Save-Data/network constraints; never prefetch all routes.
- **PDF renderer and source-PDF viewer are separate lazy chunks.** Load renderer only after explicit Generate PDF; source viewer only after Open source. Do not preload either during app boot, quote typing, share, or public view. Generated documents are immutable revision artifacts.
- Render first page of data, not full business datasets. Abort stale searches; initial search debounce around 200 ms, tuned by measurement, with immediate input echo. Keep server aggregates on Dashboard. Cap unpaginated DOM work; use tested pagination before virtualization.
- Break tasks around 50 ms; avoid main-thread parsing of source PDFs. Move suitable CPU work to a worker where library/runtime supports it, otherwise yield/chunk and measure. Dynamic import reduces startup cost but does not make PDF rendering nonblocking by itself.
- Skeletons match column widths, row count/height, heading, total block, and action footprint. Reserve icon/media aspect ratios and status rows. Error/empty replacement preserves containers where sensible; never reserve huge blank space solely to improve a metric.
- Route-loading/error boundaries keep shell, active quote identity, and unsaved state intact. A failed lazy chunk offers Retry; full reload warning appears if reload could discard unsaved work.

### 14.3 Measurable budgets

These are **targets**, not measurements of current code. Use compressed transfer sizes (gzip-equivalent) consistently; document actual production build measurements. Cold cache includes critical dependencies, not just the app entry file.

| Metric | Release gate | Internal aim / measurement |
| --- | --- | --- |
| LCP | ≤2.5 s p75 on desktop and mobile separately | Aim ≤2.0 s for seller entry and public quote on representative devices/networks. Do not count a blank splash as useful success. |
| INP | ≤200 ms p75, segmented by device and major task | Aim ≤150 ms; local input echo/totals paint ≤100 ms in scripted counter tests. Measure interaction latency, not just request time. |
| CLS | ≤0.10 p75 over full page lifetime | Aim ≤0.05; no moving primary controls during loading, notices, tab switches, or font changes. |
| Long tasks | No avoidable >50 ms tasks in steady search/edit interactions | Investigate every >100 ms task in quote/review traces; PDF work must not lock basic navigation. |
| Initial JS | Authenticated shell + Dashboard ≤200 KB gzip; public quote ≤100 KB gzip | Include shared dependencies. Direct heavy-route initial JS ≤300 KB excluding explicitly requested PDF/viewer tools. Review exceptions before release. |
| Initial CSS / fonts | ≤40 KB gzip CSS per entry; network font requests **0** | System stack default; any approved self-hosted font gets a separate explicit budget. |
| Lazy modules | Each feature route incremental chunk budget ≤100 KB gzip | Larger necessary chunks need measured justification and subdivision; no admin code on public path. |
| Search feedback | Settled query → results ≤500 ms p95 on reference counter setup, including debounce | Input remains responsive during slower network; pending indicator in reserved space. Report API and UI times separately. |
| Warm navigation | Visible route shell/heading ≤200 ms; data useful within 1 s on reference setup | Already-open quote switching paints cached panel ≤100 ms without waiting for revalidation. |
| Save feedback | Saving visible within 100 ms of save starting; acknowledgement aim ≤1 s p95 after dispatch | Debounce is distinct from network time. Never use a timer to mark Saved. |

Reference lab runs: production build; cold and warm cache; 1366 × 768 counter-class laptop and representative mid-range Android at 360 px; repeatable mobile profile around 1.6 Mbps down / 750 Kbps up / 150 ms RTT with 4× CPU slowdown, plus actual device measurements. These profiles are local testing decisions, not web.dev-mandated hardware. Exercise 50-row catalogue pages, 412-row paginated review, 100-line quote, and eight open quotes. Record device/browser/build/profile with results.

Use field Web Vitals grouped by route family/device class, with privacy-safe aggregation and adequate sample/window labels. Never log public token paths, customer names/phones, quote content, or cost. A lab Lighthouse score is not a field p75 and does not establish INP; use actual interactions and field data. Test long-session layout shifts, not only first load. API/server limits and poor networks must degrade to truthful recoverable states rather than a false performance pass.

## 15. Acceptance and review checklists

### 15.1 All-screen design gate

- [ ] Every inventory ID has a route/overlay, access rule, useful loaded state, and applicable loading/empty/error/offline/permission/conflict states; unreleased features are honest and gated.
- [ ] Light-theme tokens, type hierarchy, numeric alignment, control heights, icon family, and spacing are consistent; no purple gradients, decorative charts, or remote fonts.
- [ ] First view emphasizes current task and next action rather than empty hero space; long names/SKUs, Indian price grouping, missing cost, large totals, and fractional UOM fit.
- [ ] Desktop, touch, 320 px reflow, 200% zoom, 400% zoom, text-spacing overrides, and forced-colors mode remain usable; sticky surfaces never obscure focus.
- [ ] All interactive controls have names, labels, visible focus, sufficient contrast, and appropriate targets. Hover is never the sole discovery mechanism.
- [ ] Native table versus grid choice is documented per surface; grids pass navigation/edit/IME/virtualization testing before shipping.
- [ ] Dialogs trap only when modal, dismiss safely, and restore focus; deleted openers have tested logical fallback.
- [ ] No success is based on animation/timer alone; partial success and uncertain result are distinguishable from failure.

### 15.2 Keyboard and assistive-technology gate

- [ ] Complete sign-in → catalogue add → quote build → share → public approval → explicit billing without a mouse.
- [ ] Complete PDF upload → source review → row correction → catalogue commit → admin publication using keyboard and screen reader.
- [ ] Test VoiceOver/Safari on macOS, NVDA/Firefox or Chrome on Windows, and TalkBack/Chrome for public/mobile flows; record tested versions and observed failures. Do not imply these tests ran just because this checklist exists.
- [ ] Tab/Shift+Tab order is logical; tabs use arrows and explicit activation; quote dirty/error states and close alternatives are announced; closing a tab never deletes a quote.
- [ ] Ctrl/Cmd+W/L/T, browser find/print/zoom, browser Back, OS/AT shortcuts, and text caret/clipboard keys retain native behavior.
- [ ] IME composition, dead keys, AltGr, pasted SKUs, password managers, multiline content, and screen-reader browse modes do not trigger commands. Optional chords are off by default and can be disabled/remapped.
- [ ] F6 is absent unless the explicit opt-in has a tested safe platform matrix; visible region-jump alternatives always work.
- [ ] Validation summary links reveal and focus the correct field/row even across filters/pagination. Routine polls never steal focus or flood live regions.

### 15.3 Domain workflow gate

- [ ] Catalogue: seller edits never mutate approved global identity; adopting global price is explicit; existing quote snapshots remain unchanged.
- [ ] Review: source extraction remains intact after correction; same PDF reuses extraction but retains separate submissions; unresolved match cannot silently merge; selected scope is explicit; saved human review survives a week away.
- [ ] Quote: two active customer tabs retain independent work; missing costs do not inflate profit; unit-price/discount authority and rounding are consistent with server; save conflict blocks unsafe share.
- [ ] Revision: stale revision-1 approval cannot approve revision 2; approved revision is immutable; customer change acceptance creates a new revision requiring reapproval.
- [ ] Public: inspect response, markup, accessible names, logs, link preview, and PDF for cost/profit leakage; no login requirement; lost network after approval reconciles safely.
- [ ] PDF: save/share/view/approve generate no PDF; explicit Generate creates the right revision artifact; download and archive failures are distinguished.
- [ ] Admin: approve/reject/merge have provenance and concurrency handling; price publication appends history but does not adopt prices for sellers; merge preserves evidence/historical IDs.
- [ ] Tally: wrong company/unmapped item/missing master blocks action; stock timestamps are truthful; duplicate delivery after lost ACK resolves to one voucher; Optional Voucher never falsely appears posted.
- [ ] Settings: only Owner can manage employees/business/Tally pairing; employees cannot manage Owner; preferences do not change another user's business data.

### 15.4 Performance and polish gate

- [ ] Cold start has no artificial minimum splash; warm routes/tab changes have none. Slow bootstrap offers meaningful status/recovery.
- [ ] Initial bundles exclude PDF renderer/viewer and unrelated Admin/Tally code; generated PDF font loading uses no external network fonts.
- [ ] Real production measurements meet LCP/INP/CLS gates or have a documented release-blocking plan; report field/lab distinctions and sample limitations.
- [ ] Skeletons, error banners, totals, tab labels, and font fallbacks do not shift active controls; images/viewers have reserved dimensions.
- [ ] Search/edit remains responsive at stated fixtures; long tasks investigated; polling pauses/backs off appropriately and background save work remains reliable.
- [ ] Reduced motion eliminates nonessential movement without hiding progress or meaning; no flashing/pulsing status or perpetual shimmer.
- [ ] Screenshots at reference sizes cover normal, empty, loading, error, long-content, touch, and high-zoom states; review with realistic Jaquar/Cera-style product codes and paise values, never production private data.

### 15.5 Evidence required at implementation review

Attach inventory IDs delivered, screenshots/state matrix, keyboard and AT findings, measured contrast for actual rendered states, bundle report, lab traces, field-metric availability, and domain tests for snapshot/approval/billing invariants. Record exceptions with owner, risk, and resolution date. This document supplies design rules and verified external research, **not implementation test results or permission to weaken the product brief**.