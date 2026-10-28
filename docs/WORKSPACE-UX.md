# Rallie desktop workbench

Updated: 29 October 2026. Current direction: the user-supplied Google AI Studio blueprint, adapted to catalogue and quotation work, with Radix interaction primitives. This is a local preview, not production feature completion. Commercial authority remains [rallie-init.md](../rallie-init.md); release criteria remain in [DESIGN.md](DESIGN.md).

## Goal and reference evidence

Calm like AI Studio, useful like a workbench. Use readable typography, neutral surfaces, short copy, and space between tasks. Keep the IDE strengths—persistent navigation, keyboard commands, quote tabs, adjacent totals—without developer jargon, fake activity, or panels everywhere.

| Reference | Useful pattern | Rallie translation |
| --- | --- | --- |
| Google AI Studio screenshot and supplied blueprint | Regular 32–36 px heading, 20–22 px sections, 14 px reading/navigation text; dark canvas; wide rounded input; chips; 240–256 px sidebar | 36 px start heading, 32 px route headings, 20 px sections, 14 px body, 12 px metadata, 248 px sidebar, centered real catalogue search, rounded shortcuts |
| Bolt.new | Established task/working-surface pairing with restrained chrome | Keep context and task together; no chat-first shell or fake generation |
| Replit | Established IDE document tabs and adjacent tools | Quote tabs, editor, pricing summary, predictable connection state; no terminal/deployment controls |
| [VS Code UI anatomy](https://code.visualstudio.com/docs/getstarted/userinterface) | Primary sidebar, editor groups/tabs, secondary tools, command access, status bar | Collapsible navigation, command finder, quote tabs, product inspector, local-data status |

The AI Studio screenshot and reverse-engineering blueprint were supplied by the user; blueprint sizes are estimates, not measured browser styles. The integrated browser redirected AI Studio to sign-in. System Chrome opened the authenticated page, but computed-style inspection was blocked because Apple Events JavaScript was disabled. No exact Google font/size claim is made. VS Code public documentation was reachable. Bolt/Replit were network-blocked, so those references describe established patterns rather than verified current interfaces. No network restriction was bypassed.

## Less hierarchy, more readability

The first compact version overused 8–12 px text, uppercase eyebrows, fixture-count cards, tiny badges, and repeated disclaimers. The current version removes that clutter rather than merely enlarging it:

- One page heading and one supporting sentence; no repeated WORKSPACE / PAGE overline.
- No dashboard KPI/fixture-count cards or duplicate quick-access task panel.
- One centered product search and three actionable shortcuts.
- One sample-product surface, with price/finish and meaningful catalogue links.
- Short connection status; technical binding details are collapsed by default.
- No top header row or preview badge; local/session context is not dressed up as an authenticated account. Bottom chrome contains only the current page and keyboard shortcuts; route-specific fixture/preview boundaries remain in the content.

## Typography

| Role | Size / weight / rhythm |
| --- | --- |
| Start-page heading | 36 px / 400 / 1.3 |
| Route heading | 32 px / 400 / 1.3 |
| Section heading | 20 px / 500 / 1.4 |
| Body, navigation, product names, prices, inputs | 14 px / 400 / 1.6; active navigation 500 |
| Metadata, supporting labels, status, secondary details | 12 px / 400 |
| Optional actual section label | 12 px / 500, slight tracking; no decorative overlines |
| Commercial total | 24 px / 400, tabular numbers |

Font stack: `Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Inter/Roboto are used only if available locally; otherwise the system fallback renders. Google Sans is **not** bundled, fetched, or claimed to match exactly. No external font or extra icon-font request is required. Sizes use rem tokens on a 16 px root. Touch inputs become 16 px; mobile headings are 28 px. Do not shrink content back to 8–10 px to fit more information.

## Colors and surfaces

| Role | Value |
| --- | --- |
| Canvas / navigation / chrome | `#131314` |
| Panel surface | `#1E1F20` |
| Input / chips / active navigation | `#282A2C` |
| Main text | `#E2E2E2` |
| Secondary text | `#A4A7A5` (brighter than the blueprint's dimmest option for readability) |
| Decorative separators | `#333537` |
| Input boundaries | `#5F6364`, plus visible focus |
| Accent / focus / links | `#A8C7FA` |
| Hover | `rgba(255,255,255,.08)` for general controls; `#282A2C` for navigation and footer hover/focus |

Navigation icons match their text. The existing locally bundled Lucide outline family remains: 20 px sidebar icons, 16–18 px chip icons, rather than a new Material Symbols font/network dependency. No decorative glow, continuous animation, gradient badge, or meaningless product image. WCAG AA remains a release target, not a certification from token values.

## Geometry and placement

- **Sidebar:** 248 px expanded, 64 px collapsed; 12–14 px horizontal item padding, 4 px gaps, 40 px navigation targets with 20 px icons. Brand and collapse toggle share the top; the page finder sits below, before the 12 px Local workspace label and 14 px route items. Search becomes an accessible icon button when collapsed or on mobile. Selected item uses a neutral pill surface, `aria-current`, and medium text. Only session identity stays at the bottom; no duplicate help link.
- **Headerless content:** no top row, breadcrumb, or preview badge; main content starts at the top of its scroll region with existing page padding. **Status strip:** 29 px baseline, growing for coarse-pointer targets; `Workspace / Current page` bottom-left and the sole `Keyboard shortcuts` button bottom-right. Footer hover/focus matches the navigation highlight. On narrow screens omit the Workspace prefix, not the page name or shortcuts label. The current-page link preserves the query/hash.
- **Start page:** an 880 px centered column, 56 px top/bottom content padding, one 72 px-tall real search form with 28 px radius and 16–20 px padding. No AI prompt, mic, mode selector, or fake generation controls.
- **Shortcuts:** 36 px high, 18 px radius, 14 px text, 16–18 px icons, 10 px gap. Browse catalogue, open quotation demo, review Tally scope.
- **Panels:** 12 px radius, subtle 1 px border, 16–24 px internal spacing. Sample-product rows replace a decorative gallery because Rallie needs names and prices, not image-first browsing.
- **Catalogue/quotes:** use available width, not the start-page cap. Wide catalogue has a 288 px contextual inspector. Quote editor has a 320 px summary, 360 px at ≥1600 px.
- **Reading pages:** settings/Tally use the 880 px cap while preserving the same shell.
- **Responsive:** above 1150 px inspector is adjacent; otherwise below. At ≤760 px use the 64 px accessible icon rail, stacked quotation summary, 28 px headings, contained tab/table scrolling, wrapping shortcuts. Only genuine tables overflow horizontally inside their labeled region. Coarse-pointer targets expand to ≥44 px.

The component baseline remains in [styles.css](../apps/web/src/styles.css); the single current visual layer is [workspace.css](../apps/web/src/workspace.css). It replaces the prior accumulated compact/sage overrides.

## Functional behavior and speed

- Dashboard search submits to `/catalogue?q=…`; empty search opens all fixtures. Catalogue query changes replace the current URL entry. Reload retains query and browser Back returns to the preceding route. Category remains local state; no server or persistence claim.
- Sample-product links filter catalogue by SKU. Inspector still inspects a local fixture; its quote link opens the example and explicitly does not add that product.
- `⌘/Ctrl K` opens finder while editing; closing restores focus. `⌘/Ctrl B` toggles sidebar outside editable controls. `?` opens help outside editable controls. No browser search/refresh/new-tab shortcut override.
- Quote tabs preserve separate quantity/discount state while the route is open. No save, PDF, sharing, or persisted document IDs. Native tables/disclosures remain; Radix Tabs owns roving focus, arrows, Home/End, automatic activation for immediate local panels, and tab/panel semantics.
- **UI foundation:** use Radix primitives for interactive patterns instead of building another focus-management system. Reusable [dialog](../apps/web/src/components/ui/dialog.tsx) and [tooltip](../apps/web/src/components/ui/tooltip.tsx) surfaces retain the existing visual tokens. Radix provides modal background isolation, focus trapping, Escape/outside dismissal, and tooltip keyboard support; the command wrapper restores focus for shortcut-opened dialogs. Keep ordinary inputs/buttons/links native. A library does not replace accessibility validation.
- Intent-based sidebar module preloading, lazy feature routes, system fonts, and immediate local filtering/calculation remain. No animation delays the task. Honor reduced motion and forced colors.
- Shell stays mounted with an independently scrolling main region. Keyboard focus, zoom, spacing changes, and touch must stay usable; layout cannot hide prices to achieve density.

## Validation and release boundaries

Check strict TypeScript, Vite build, whitespace, command/help focus, sidebar state retention, product inspector, integer pricing and quote tabs. Browser regressions include dashboard search/URL/reload/history, product links, computed blueprint typography/geometry, progressive connection diagnostics, and all five routes at 320/390/1366/1440/1920 CSS px.

**Local verification, 28 October 2026:** nine frontend browser tests passed, including 25 route/viewport combinations and the new query/history, typography, and diagnostic-disclosure checks. Strict TypeScript passed with Vite's CSS import declarations. Browser computed styles confirmed the 36/32/20/14 px hierarchy, 248 px rail, 880 px search width, 72 px search height, 28 px search radius, and 36 px chips. Dashboard and quotation surfaces were visually inspected. These are local checks, not field performance or full accessibility certification.

**29 October follow-up:** eleven frontend tests pass, adding footer-only page location/help, shared navigation/footer highlights, modal Tab/Shift+Tab trapping, Escape/outside dismissal and return focus, collapsed-navigation tooltips, and Radix tab keyboard/state checks. Existing route/viewport and query regressions remain.

**Headerless-shell follow-up:** page finder and collapse toggle now live in the sidebar. A twelfth regression verifies no banner/header space and finder access/focus restoration in expanded, collapsed, and 320 px mobile layouts.

The real-health smoke test and backend recovery test require Worker/D1 and are excluded from UI-only runs; mocked diagnostics do not prove backend readiness. Authentication, seller pricing, persisted quotes, ingestion, Tally sync, PDFs, and approvals remain unimplemented by this revision. Performance targets (including p75 INP ≤200 ms) need measurement; new typography/preloading is not field-performance proof.