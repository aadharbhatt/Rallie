# Rallie — Product Architecture and AI Implementation Plan

## Architectural direction

Rallie should become **simpler than the architecture in the earlier documents, not more sophisticated**. The previous designs introduced useful ideas—global versus seller catalogues, price history, crowdsourced evidence and a local Tally bridge—but also accumulated complexity around SQLite-Wasm replication, dynamic ontologies, token-learning systems and comparison/pivot modes. fileciteturn0file0 fileciteturn0file1 fileciteturn0file2

For the product you have now described, I would make five foundational changes:

1. **Use one cloud, Cloudflare, for the initial product.**
2. **Treat catalogue data as evidence that becomes progressively trusted, not as a perfect canonical taxonomy that must be understood during ingestion.**
3. **Have only Owner, Employee, Platform Admin, and public Customer access.**
4. **Have only one quotation experience: Build.**
5. **Make Tally an explicit integration boundary and accounting source of truth, rather than trying to reproduce Tally inside Rallie.**

The resulting architecture is:

```text
                              RALLIE
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
           React Web App                  Public Quote
        Owner / Employee                   Customer
                  │                             │
                  └──────────────┬──────────────┘
                                 │ HTTPS
                                 ▼
                       Cloudflare Worker
                     API + Authentication
                                 │
             ┌───────────────────┼──────────────────┐
             │                   │                  │
             ▼                   ▼                  ▼
            D1                  R2             Workers AI
     application data      PDFs/documents     PDF → text +
      + FTS5 search                           extraction
             │
             ▼
      Cloudflare Workflows
       ingestion pipeline
             │
             ▼
      Admin Review Queue
             │
             ▼
      Global Catalogue

Later:
                                 │
                                 ▼
                        Durable Object
                     hibernating WebSocket
                                 │
                           outbound WSS
                                 │
                                 ▼
                       Rallie Bridge.exe
                        on Tally PC
                                 │
                     localhost:9000 XML
                                 ▼
                            TallyPrime
```

**Why Cloudflare rather than Vercel + OCI + Cloudflare?** Cloudflare now supports deploying React static assets and Worker API code as one deployment, and its documentation explicitly recommends Workers Static Assets rather than Pages for new full-stack/static projects. citeturn12search0turn12search6 This lets Rallie use one deploy, one network, one access-control model and bindings directly from the API to D1, R2, Workflows, AI and later Durable Objects.

I would **not use Vercel Hobby for the production Rallie application**. Vercel's own current documentation says Hobby is restricted to non-commercial personal use, while Rallie is plainly a commercial product. citeturn12search4turn12search5 Vercel Pro could be reconsidered later if its developer experience creates enough value, but it defeats your initial zero-cost objective without solving a problem Cloudflare cannot currently solve.

I would likewise **not introduce Oracle Cloud in version one**. OCI is an escape hatch only if arbitrary PDF processing eventually requires a long-running container running software such as Docling or MinerU. That should be an evidence-driven migration, not an architectural prerequisite.

The proposed Cloudflare footprint is deliberately small:

| Concern | Rallie v1 choice | Why |
|---|---|---|
| React application | Workers Static Assets | Same deploy as API |
| Backend | Cloudflare Worker | Thin HTTP/API layer |
| Relational data | D1 | One SQL database |
| Catalogue search | D1 FTS5 | No second search engine |
| Original price-list PDFs | R2 private bucket | Cheap object storage |
| Generated quotation PDFs | R2 private bucket | Only produced on demand |
| PDF conversion/extraction | Workers AI + `toMarkdown` | Avoid operating OCR infrastructure initially |
| Durable ingestion | Cloudflare Workflows | Retryable multi-step jobs |
| Message queue | **None initially** | Add Queue only for actual fan-out |
| Tally live connection | Durable Object, later | Long-lived agent connection |
| Heavy processing server | **None initially** | Add OCI only if metrics prove necessary |

D1 supports SQLite's FTS5 full-text-search module, so the initial catalogue does not need Typesense, Elasticsearch, Postgres, pgvector or a replicated in-browser database. citeturn15search0 D1's Free allocation currently includes 5 million rows read per day, 100,000 rows written per day and 5 GB total database storage. citeturn12search2 R2 includes 10 GB-month of storage, one million Class A operations and ten million Class B operations per month, with no Internet egress charge. citeturn13search5 Workers Free allows 100,000 requests per day but has a tight 10 ms CPU limit, which is exactly why Rallie's Worker must remain an orchestration/API layer rather than attempting CPU-heavy PDF processing itself. citeturn15search6

Cloudflare Workflows is available on the Free plan and presently includes 3,000 steps per day and 1 GB-month of workflow state; free-plan workflow state defaults to three days of retention. Waiting on external calls or sleeping does not consume CPU. citeturn13search3 Workers AI presently includes 10,000 neurons per day on the Free plan. citeturn16search0 Cloudflare's document conversion can process PDFs through `toMarkdown`; ordinary document conversion is free in many cases, although image-heavy conversion can invoke AI and therefore consume the AI allocation. citeturn15search2turn15search11

So **“free-tier capable” is realistic for development and an early pilot, but must not mean “Rallie is guaranteed to cost ₹0 at any scale.”** Large numbers of image-heavy price lists or high traffic can exceed those allocations. The important architectural property is that there is no always-on server or database bill simply to keep an early Rallie deployment alive.

The previous architecture's SQLite-Wasm/offline catalogue should also be removed from the first implementation. fileciteturn0file0 It solves a future connectivity problem by creating a present consistency problem: browser snapshots, schema upgrades, delta replication, conflict resolution and two search implementations. Start with D1 FTS5. Only introduce an offline replica after real counter telemetry demonstrates that network availability is materially harming quotation creation.

**Roles are equally simple.**

| Actor | Authentication | Permissions |
|---|---|---|
| Owner | Rallie account | Everything inside their business, including employees and settings |
| Employee | Rallie account | Catalogue operations and quotations for that business |
| Customer | No Rallie account | Access only to a shared quotation token |
| Platform Admin | Rallie account + platform-admin flag | Global catalogue moderation, duplicates, prices and relationships |

There is deliberately no Manager, Salesperson, Catalogue Reviewer or Customer account role. “Employee” is enough until actual businesses demonstrate that finer permissions are required.

I would also avoid building custom password cryptography. A small authentication library backed by the existing SQLite-compatible database is preferable; for example, Better Auth currently supports email/password authentication and a Drizzle SQLite adapter. citeturn14search0turn19search0 That implementation choice can be swapped without changing Rallie's domain model.

The critical product principle is:

> **Global catalogue = shared knowledge. Seller catalogue = what this business actually sells and how it prices it. A quotation always snapshots seller data. A source PDF is evidence, never truth by itself.**

That principle keeps the rest of Rallie understandable.

## Catalogue and data model

The biggest correction I would make to the previous design is to stop thinking of the global catalogue as something Rallie must completely understand before accepting data.

A manufacturer PDF might have columns today and prose tomorrow. One brand may encode series in its SKU. Another may put it in a page heading. Another might have no usable structure. The earlier token/ontology design attempted to infer structured concepts such as functional categories and code segments during ingestion. fileciteturn0file2 That can eventually improve search, but it should **not be a prerequisite for getting a product into Rallie**.

The v1 canonical global object should therefore contain only facts Rallie actually needs:

```text
Brand
Product ID / SKU / model code
Product name
Product description
Approved global MRP history
Search aliases (optional)
```

Everything else is an optional enhancement.

The data model should be divided into **source evidence**, **global knowledge**, **business-specific catalogue data**, **quotation snapshots**, and **integration state**.

| Table | Important fields | Purpose / invariant |
|---|---|---|
| `users` | `id`, `name`, `email` | Authentication identity |
| `businesses` | `id`, `name`, `phone`, `address` | Seller/business |
| `business_memberships` | `business_id`, `user_id`, `role` | `OWNER` or `EMPLOYEE`; unique membership |
| `brands` | `id`, `name`, `normalised_name` | Stable brand identity |
| `source_documents` | `id`, `sha256`, `r2_key`, `mime_type`, `effective_date`, `parse_status` | One binary PDF object |
| `source_submissions` | `id`, `document_id`, `business_id`, `uploaded_by`, `submitted_at` | Records each independent dealer submitting that PDF |
| `extraction_runs` | `id`, `document_id`, `extractor_version`, `status`, `workflow_id`, `artifact_r2_key`, `error` | Reproducible parser execution |
| `staged_products` | extraction + source locator + extracted fields + edits + match | Reviewable rows before commit |
| `global_products` | `id`, `brand_id`, `sku_display`, `sku_normalised`, `name`, `description`, `status` | Admin-approved shared product identity |
| `product_claims` | source, business, proposed product fields, status | Evidence for global attributes |
| `product_price_claims` | product/source/business/MRP/effective date/status | Evidence that a product had a particular price |
| `product_price_versions` | product/MRP/effective date/approved source | Admin-approved global price history |
| `seller_products` | business/product, active MRP, cost, discount, default quote price, carried | Seller's catalogue overlay |
| `seller_product_aliases` | seller product/alias | Shop-specific search terms |
| `product_relationship_candidates` | product A/B/type/proposer/status | Shopkeeper-proposed relationships |
| `product_relationships` | product A/B/type/admin approval | Globally approved relationships |
| `customers` | business/name/phone | Lightweight seller-owned address book |
| `quotes` | business/customer/status/current revision/share token | Long-lived quotation identity |
| `quote_revisions` | revision number/hash/totals/actor | Immutable commercial revision |
| `quote_lines` | product snapshots, quantity, prices, discount | Exact line data belonging to a revision |
| `quote_events` | actor/event/revision/timestamp | Audit trail |
| `quote_documents` | revision/R2 key/hash | Explicitly generated PDFs |
| `tally_connections` | business/device/company/last seen | Local Tally installation |
| `tally_items` | connection/item identity/stock/rate/sync time | Locally observed Tally masters |
| `seller_product_tally_map` | seller product ↔ Tally item | Stable product mapping |
| `tally_sync_jobs` | operation/payload/status/attempts/result | Durable billing/inventory jobs |

There are several important details hidden inside that table.

**Source PDFs must be immutable.** The seller can correct what Rallie extracted, but Rallie must preserve the original extraction and source location. A corrected name is another claim; it is not a rewrite of what the PDF said. This provides an audit trail when two dealers disagree.

**The same PDF is not the same thing as the same evidence.** Suppose Jaquar sends one October price list and twenty dealers upload exactly the same binary. `source_documents` should contain one deduplicated R2 object and one extraction result, but `source_submissions` should contain twenty independent submissions. This prevents wasting AI/PDF processing while retaining information that twenty businesses independently received the document.

**Global products are identities; claims are observations.** A row such as:

```text
Jaquar
KUP-CHR-35079NKPM
Exposed Part of 3-Way Hi-Flow Diverter
₹3,450
```

does not directly `UPDATE global_products`. It produces claims about an existing or new product.

The matching algorithm should intentionally be conservative:

```text
1. normalised brand + normalised SKU exact match
       ↓
   auto-link to existing global product

2. SKU not found
       ↓
   search same brand using SKU/name/description
       ↓
   very likely duplicate
       → mark POSSIBLE_MATCH, require review

3. no plausible match
       ↓
   create provisional product candidate

4. seller confirms review
       ↓
   add to seller catalogue immediately

5. global claim remains pending
       ↓
   platform admin approves, merges or rejects
```

Do **not** automatically merge products solely because an embedding or fuzzy string score is high. Accidentally merging two sanitaryware SKUs is much more damaging than temporarily keeping duplicates.

This is also where I would change the old “three dealers = consensus truth” concept. Earlier designs proposed automatically publishing a price after a quorum of independent uploaders. fileciteturn0file1 Multiple independent matching submissions should increase the **evidence strength**, but **the Platform Admin should remain the publication authority in v1**. Three shops can all upload the same outdated list; three PDFs can all inherit the same typo; three submissions can even come from the same distributor channel.

An admin-facing price proposal can instead show:

```text
Jaquar • ALD-CHR-079N

Current approved global MRP       ₹5,000

Proposed MRP                      ₹6,000
Effective date                    01 Oct 2026

Independent businesses            7
Documents                          3
Identical row evidence             7
Conflicting claims                 0

Source:
Jaquar_Oct_2026.pdf
Page 48 / row 11

[Open source]      [Reject]      [Approve ₹6,000]
```

After approval, insert a **new** `product_price_versions` row. Never overwrite the ₹5,000 row.

The seller catalogue then references the global product while maintaining seller-specific commercial data:

```text
seller_products

business_id
product_id

active_global_price_version_id  nullable
seller_mrp_override             nullable

cost_price
default_discount_pct
default_quote_price

is_carried
created_at
updated_at
```

The seller should **not be silently upgraded** when the admin approves ₹6,000 globally. Their catalogue should instead show:

> New global MRP available: ₹6,000  
> Your active MRP: ₹5,000  
> [Update to ₹6,000]

This preserves the valid case where the business still wants to sell old inventory against an older price.

Price history therefore becomes naturally simple:

```text
Product
  ├── ₹4,500 — approved Jan 2025
  ├── ₹5,000 — approved Nov 2025 ← seller currently uses this
  └── ₹6,000 — approved Oct 2026 ← latest global
```

There is no need to encode an entire manufacturer PDF as one “software version” to make this work. The PDF can still have a release identifier, but product price history should remain **per product**.

Product relationships should be equally conservative. Do not attempt to derive an entire sanitaryware ontology.

Use only:

```text
REQUIRED_WITH
COMMONLY_SOLD_WITH
ALTERNATIVE
```

`REQUIRED_WITH` drives the important quotation experience:

```text
Jaquar Kubix diverter trim
KUP-CHR-35079NKPM

Required with:
ALD-CHR-079N
Concealed body

[Add product] [Add both]
```

An owner or employee may suggest this relationship. The business gets immediate value from its own proposed relationship, while a `product_relationship_candidate` enters the admin queue. Once approved, everyone receives it.

This solves your observation precisely: **shopkeepers teach Rallie the relationship graph; Rallie does not hallucinate one from arbitrary PDFs.**

Search must index the things shopkeepers are likely to know rather than the ontology Rallie wishes existed:

```text
brand
SKU / product code
product name
description
approved aliases
seller-specific aliases
```

D1's FTS5 support makes this possible without another infrastructure service. citeturn15search0 Maintain a normal B-tree index on `sku_normalised` for exact product codes, then use FTS for words, prefixes and descriptions.

A typical search path should be:

```text
"079n"

exact normalised SKU?
        │
       yes
        ▼
ALD-CHR-079N              ← rank first

then FTS:
"079N body"
"concealed body 079"
"description containing 079"
```

And:

```text
"jaquar kubix diverter"

brand boost        Jaquar
name/description   Kubix, diverter
SKU                optional
aliases            optional
```

That is vastly easier to reason about than maintaining vector search, a dynamic category tree and a client-side replica simultaneously.

## Screen-by-screen product and implementation

Rallie's desktop application should have a deliberately short left navigation:

```text
RALLIE

Dashboard
Catalogue
Quotations
Tally
Settings

----------------
Admin             ← visible only to platform admin
```

The Owner and Employee see essentially the same operational product. Owner-only controls live inside Settings rather than creating a different application.

**Application shell and Dashboard**

The Dashboard is not an analytics product. It exists to surface work requiring attention.

The first version should contain four compact cards:

```text
Catalogue
14 products have newer approved prices
[Review updates]

Quotations
6 open quotations
2 customer-approved
[Open quotations]

PDF processing
1 price list needs review
[Continue review]

Tally
Connected • Arihant Sanitation
Stock synced 7 min ago
```

No charts are required.

Frontend reads:

```http
GET /api/dashboard
```

Backend returns already aggregated counts. The browser should not fetch thousands of products to calculate these.

Database reads:

```text
seller_products
quotes
extraction_runs
tally_connections
```

The Employee sees the same cards except business-owner settings.

**Catalogue page**

This is the primary catalogue control surface you described.

Header:

```text
CATALOGUE

[ My Catalogue ] [ Global Catalogue ]        [ + New PDF update ]

Search products, codes, brands... [________________________]
```

The two tabs are important because they communicate the global/seller distinction without exposing database concepts.

`My Catalogue` shows seller products:

```text
Jaquar | ALD-CHR-079N
Concealed body for 3-way diverter

Your MRP       ₹5,000
Latest global  ₹6,000     New price available
Cost           ₹3,400
Default quote  ₹4,100

[Open]                    [Update to ₹6,000]
```

`Global Catalogue` shows everything approved in Rallie:

```text
Jaquar | ALD-CHR-079N
Concealed body for 3-way diverter
Global MRP ₹6,000

Already in your catalogue
```

or:

```text
Cera | F1013101
Campbell Diverter
Global MRP ₹3,800

[Add to my catalogue]
```

Endpoints:

```http
GET  /api/catalogue/mine?q=&cursor=
GET  /api/catalogue/global?q=&cursor=
POST /api/catalogue/products/:productId/add
PATCH /api/catalogue/seller-products/:id
```

Adding a global product to My Catalogue should open a small pricing sheet rather than a separate page:

```text
Add to my catalogue

MRP                     ₹6,000
Cost price              [ ₹4,050 ]
Default customer disc.  [ 18 % ]
Default quote price      ₹4,920

[Cancel] [Add]
```

Do not require cost price if the business does not know it yet. Profit can display “Unknown” until cost is entered.

**Product detail drawer**

Clicking a product should open a large drawer, not navigate the user away from their work.

Sections:

```text
Jaquar
ALD-CHR-079N

Concealed body for 3-way diverter
[description]

Your pricing
--------------------------------
Active MRP       ₹5,000
Cost             ₹3,400
Default discount 18%
Quote price      ₹4,100

Price history
--------------------------------
Jan 2025     ₹4,500
Nov 2025     ₹5,000      YOUR ACTIVE PRICE
Oct 2026     ₹6,000      LATEST GLOBAL

[Use ₹6,000]

Relationships
--------------------------------
Required with:
KUP-CHR-35079NKPM   Kubix trim

Commonly sold with:
...

[Suggest relationship]
```

Endpoints:

```http
GET   /api/catalogue/products/:id
PATCH /api/catalogue/seller-products/:id
POST  /api/catalogue/seller-products/:id/use-price-version
POST  /api/catalogue/relationship-proposals
```

Price switching should atomically update the seller overlay. D1's `batch()` executes batched statements as a transaction and rolls back the batch when a statement fails, which is useful for operations where the seller overlay and audit event must succeed together. citeturn20search0

**New PDF update**

Clicking the button at the top of Catalogue opens a focused upload screen:

```text
New catalogue update

Drop a manufacturer's PDF here
┌─────────────────────────────────────────┐
│                 PDF                     │
│     Drop file or click to browse        │
└─────────────────────────────────────────┘

Brand
[ Jaquar                               ]

Effective date (optional)
[ 01 / 10 / 2026 ]

[Upload and process]
```

Do **not** make brand mandatory if Rallie can reliably find it. But asking the shopkeeper to supply or confirm it dramatically reduces ambiguity, so preselect detected brand and require confirmation before the final commit.

The browser first obtains an upload URL:

```http
POST /api/ingestions
```

Response:

```json
{
  "jobId": "ing_...",
  "uploadUrl": "...",
  "r2Key": "source-pdfs/..."
}
```

The browser then PUTs the PDF directly to R2. Cloudflare explicitly supports browser/client uploads using presigned R2 PUT URLs without exposing storage credentials; presigned URLs should be short-lived because they function as bearer credentials. citeturn15search1turn15search9

After upload:

```http
POST /api/ingestions/:jobId/complete
```

That starts the workflow.

The screen changes to:

```text
Processing Jaquar_Oct_2026.pdf

✓ File safely uploaded
✓ Reading document
● Extracting products
○ Matching against catalogue
○ Preparing review

412 products found so far

You can leave this screen. Processing will continue.
```

For v1 use polling every two or three seconds:

```http
GET /api/ingestions/:jobId
```

There is no need for WebSockets simply to show PDF processing progress.

**PDF review screen**

This is one of Rallie's most important screens and should receive more design attention than a generic CRUD table.

Do not expose AI confidence everywhere. Show the user **decisions**, not the internals of the extraction model.

Top summary:

```text
Review Jaquar October price list

412 rows found

286  Already in your catalogue
78   Known globally, not in your catalogue
41   New products
7    Need attention

[ All ] [ Needs attention ] [ Existing ] [ New ]
```

Rows:

```text
┌──────┬────────────────┬────────────────────┬──────────┬────────────┐
│      │ Product        │ Name               │ New MRP  │ Your data  │
├──────┼────────────────┼────────────────────┼──────────┼────────────┤
│ ✓    │ ALD-CHR-079N   │ Concealed body... │ ₹6,000   │            │
│      │                │                    │          │ You carry  │
│      │                │                    │          │ ₹5,000     │
│      │                │                    │          │ Disc 18%   │
│      │                │                    │          │            │
│      │ Existing global match • Price changed +20%                 │
├──────┼────────────────┼────────────────────┼──────────┼────────────┤
│ !    │ KUP-...        │ [______________]   │ [_____]  │ Not carried│
│      │ Missing product name — please complete                     │
├──────┼────────────────┼────────────────────┼──────────┼────────────┤
│ ?    │ 1230098        │ XYZ Basin Mixer   │ ₹8,200   │            │
│      │ Possible match: 123-0098 XYZ Basin Mixer                  │
│      │ [Same product] [Different product]                         │
└──────┴────────────────┴────────────────────┴──────────┴────────────┘
```

Editable fields should be only:

```text
Brand
SKU / product ID
Product name
Description
MRP
```

plus seller-specific:

```text
Carry this product
Cost price
Default discount
```

That is the right place to make your requirement explicit: **when a row is already in the seller's catalogue, show the seller's existing MRP, cost and discount alongside the newly extracted data.**

Submission:

```text
[Save review for later]                [Add / update my catalogue]
```

The commit API is:

```http
POST /api/ingestions/:jobId/commit
```

A successful commit performs three logically distinct actions:

```text
Seller catalogue
    → update/add selected seller products immediately

Evidence layer
    → create product and price claims from reviewed rows

Global catalogue
    → pending admin review only
```

The seller should therefore immediately receive the value of the upload without waiting for the Platform Admin.

**Quotation workspace**

There is no Compare mode.

Quotations are a working surface similar to an IDE: the seller may be dealing with multiple customers simultaneously, so desktop tabs make sense.

```text
Quotations

[ Rajesh • ₹48,200 × ] [ Sharma Villa • Draft × ] [+ New quote]
```

Tabs are a **UI convenience**, not separate browser-local documents. Each tab is simply a quote ID backed by D1. Keep the last few tab IDs in local storage for restoration, but the server remains authoritative.

The workspace:

```text
┌──────────────────────────────────────────────────────┬──────────────────────────┐
│ Rajesh • +91 98xxxxxx                               │ QUOTE                    │
│                                                      │ Rajesh                   │
│ Search my catalogue                                  │                          │
│ [ diverter 079 _________________________________ ]  │ 1. Kubix Diverter        │
│                                                      │ Qty        [-] 1 [+]     │
│ JAQUAR                                               │ MRP          ₹3,450      │
│ Kubix Prime diverter trim                            │ Discount      [18%]      │
│ KUP-CHR-35079NKPM                                    │ Price         ₹2,829     │
│ MRP ₹3,450  • Quote ₹2,829                           │ Cost          ₹2,346 🔒  │
│                                                      │ Profit          ₹483 🔒  │
│ Requires: ALD-CHR-079N body                          │                          │
│ [Add] [Add both]                                     │ 2. Concealed Body       │
│                                                      │ ...                      │
│ JAQUAR                                               │                          │
│ Concealed body                                       │ ------------------------ │
│ ALD-CHR-079N                                         │ MRP total     ₹8,450     │
│ [Add]                                                │ Your quote    ₹6,929     │
│                                                      │ Profit        ₹1,183 🔒  │
│                                                      │                          │
│                                                      │ [Generate PDF]           │
│                                                      │ [Share with customer]    │
└──────────────────────────────────────────────────────┴──────────────────────────┘
```

Quotation search should default to **My Catalogue only**. This prevents employees accidentally adding an item with no known store pricing.

If nothing is found:

```text
No result in your catalogue.

2 matching products exist in Global Catalogue
[View and add to my catalogue]
```

That is a safer bridge than mixing global and seller products indiscriminately in one result list.

Relevant APIs:

```http
POST   /api/quotes
GET    /api/quotes/:id
PATCH  /api/quotes/:id/customer

POST   /api/quotes/:id/lines
PATCH  /api/quotes/:id/lines/:lineId
DELETE /api/quotes/:id/lines/:lineId

GET    /api/quote-search?q=
POST   /api/quotes/:id/share
POST   /api/quotes/:id/pdf
```

Every quantity, discount or price change updates the right-hand totals immediately in React. The server save should be debounced by roughly half a second or saved on blur/action rather than creating an HTTP request for every keyboard event.

Importantly, **cost and profit are never sent by the public quote endpoint**.

**Public customer quotation**

The public page needs no left navigation, no Rallie account and no seller internals.

```text
ARIHANT SANITATION

Quotation for Rajesh
27 October 2026

Jaquar Kubix Prime Diverter
KUP-CHR-35079NKPM
Qty 1

MRP                         ₹3,450
Discount                       18%
Your price                   ₹2,829

Concealed Diverter Body
ALD-CHR-079N
Qty 1

Your price                   ₹4,100

----------------------------------
Quotation total              ₹6,929

[Approve quotation]

Need a change?
[Suggest changes]
```

The only API payload exposed publicly should contain customer-safe snapshots.

```http
GET  /api/public/quotes/:shareToken
POST /api/public/quotes/:shareToken/approve
POST /api/public/quotes/:shareToken/proposals
```

**Admin**

Admin should not maintain the global catalogue manually product by product. The primary UX is an exception/review queue:

```text
ADMIN

[ Product claims 31 ]
[ Price changes 14 ]
[ Relationships 7 ]
[ Possible duplicates 5 ]
```

A product claim shows old versus new information and source provenance.

A duplicate screen shows:

```text
Possible duplicate

A
Jaquar
KUP-CHR-35079N
Kubix diverter trim

B
Jaquar
KUP CHR 35079N
Kubix Prime exposed diverter

Evidence:
4 seller submissions point to A
1 submission created B

[Not duplicate]               [Merge B into A]
```

Merging should never delete evidence. Set `global_products.status = MERGED` and `merged_into_product_id = A`, migrate active references, and preserve historical IDs.

Price approval produces a new price-version row rather than modifying old history.

Relationship approval turns a candidate into a globally trusted `product_relationship`.

That gives you exactly one central moderation interface rather than a separate “catalog reviewer” persona.

## Ingestion, deduplication and search

The ingestion pipeline is where durable execution is genuinely useful.

Cloudflare Workflows is the correct initial choice over self-hosting Temporal because Rallie already runs on Cloudflare, Workflows persists step state, retries work and it has dashboard observability without another cluster or database. Workflows is available on the Free plan. citeturn13search3 Cloudflare has also added visual workflow diagrams in its dashboard, which gives you at least the operational visibility you are looking for, even though I would not claim it is equivalent in sophistication to Temporal's full ecosystem. citeturn13search4

The key architectural trick is **not to leave a workflow waiting for the shopkeeper's review**. Free-plan workflow state defaults to three days, while a dealer might return to a price list a week later. citeturn13search3 Human-review state belongs in D1.

The ingestion state machine should therefore be:

```text
CREATED
   │
   ▼
UPLOADING
   │
   ▼
UPLOADED
   │
   ▼
PARSING
   │
   ▼
EXTRACTING
   │
   ▼
MATCHING
   │
   ▼
READY_FOR_REVIEW
   │
   └──────────── workflow finishes here
                        │
                        │ human may return tomorrow/week later
                        ▼
                    REVIEWING
                        │
                        ▼
                    COMMITTING
                        │
                        ▼
                    COMPLETED
```

The first workflow should execute approximately these durable steps:

```text
start(job_id)

    step: validate_file
        verify R2 object
        verify MIME and max size

    step: fingerprint_file
        SHA-256
        lookup existing source_document

    if existing extraction is usable:
        step: attach_existing_extraction
    else:
        step: convert_document
        step: extract_product_records
        step: persist_extraction

    step: normalise_records

    step: exact_match_products

    step: candidate_match_unmatched_products

    step: materialise_staging_rows

    step: mark_ready_for_review

end
```

The important optimisation is hash reuse:

```text
Dealer A uploads exact Jaquar PDF
        ↓
Rallie parses it
        ↓
source_document SHA = abc...

Dealer B uploads same binary
        ↓
SHA = abc...
        ↓
Do not OCR/extract again
        ↓
reuse extraction
        ↓
create separate source_submission for Dealer B
```

If the manufacturer distributes the same underlying content with different PDF metadata or scan artefacts, binary hashes will differ, so Rallie may parse it again. Row-level fingerprints subsequently discover that the resulting claims agree.

For v1 the extraction schema should be deliberately boring:

```json
{
  "document": {
    "brand": "Jaquar",
    "effectiveDate": "2026-10-01"
  },
  "products": [
    {
      "sourceLocator": {
        "page": 48,
        "rowHint": "..."
      },
      "sku": "ALD-CHR-079N",
      "name": "Concealed Body for 3-Way Diverter",
      "description": "40mm cartridge ...",
      "mrp": 6000,
      "confidence": {
        "sku": 0.99,
        "name": 0.93,
        "description": 0.84,
        "mrp": 0.99
      }
    }
  ]
}
```

Do not ask the extraction model to decide:

```text
functional_slot
canonical_category
series hierarchy
paired SKU
cross-brand equivalent
sales package
```

unless those values are explicitly present and useful. Those are precisely the kinds of inferred semantics that make arbitrary catalogues brittle.

Cloudflare's `toMarkdown` can take a PDF sourced from R2 through the Workers AI binding, which is a good first-stage parser before structured extraction. citeturn15search3turn15search10 If a particular brand's PDF proves too complex or image-heavy for acceptable extraction quality, record that as a measurable parser failure and add a brand-specific or OCI-hosted fallback later. Do not make a containerised extraction stack mandatory for every document just because a subset may eventually need it.

**Matching and deduplication should use deterministic evidence first.**

Normalisation:

```text
brand:
"JAQUAR" → "jaquar"

SKU:
"KUP-CHR-35079NKPM"
"KUP CHR 35079NKPM"
"KUP/CHR/35079NKPM"

→ kupchr35079nkpm
```

Then:

```pseudo
if exact(brand_id, sku_normalised):
    match = EXACT_SKU
    matched_product_id = existing.id

else:
    candidates = FTS(
        brand + sku + name + description,
        within_same_brand=true,
        limit=5
    )

    if one candidate is strongly plausible:
        match = POSSIBLE_DUPLICATE
        require human decision
    else:
        match = NEW_PRODUCT
```

Never make similarity thresholds a hidden destructive action.

Price claims have their own fingerprint:

```text
product_id
normalised MRP
effective date
source document
business
```

When seven businesses upload matching evidence, the admin UI can show `7 independent businesses`, but this is **evidence**, not an automatic SQL trigger that changes everyone else's MRP.

When the admin approves ₹6,000:

```text
INSERT product_price_versions (...)

UPDATE global_products
SET latest_price_version_id = ...

do NOT update seller_products.active_price_version_id
```

The seller dashboard can determine drift simply by comparing the two IDs.

**Search needs two scopes.**

Catalogue search:

```text
My Catalogue
Global Catalogue
```

Quotation search:

```text
My Catalogue only
```

The FTS index can be conceptually:

```sql
CREATE VIRTUAL TABLE global_products_fts USING fts5(
    brand,
    sku,
    name,
    description,
    aliases
);
```

D1 supports FTS5 as a supported extension. citeturn15search0 Keep an ordinary indexed `sku_normalised` column as well, because exact SKU lookup should not depend on full-text ranking.

Ranking:

```text
highest  exact SKU
        seller alias exact/prefix
        product name match
        brand + product-name combination
        description
lowest   broad alias
```

Seller-local aliases should not need global approval to improve that business's search:

```text
ALD-CHR-079N
seller alias:
"079 body"

Employee searches:
079 body
   ↓
seller alias exact match
   ↓
ALD-CHR-079N
```

But a shop-specific alias should not automatically become global simply because one seller typed it. Later telemetry can show that fifty independent businesses repeatedly use the same phrase, at which point the admin can promote it.

This keeps the useful “self-learning search” concept from the previous research without building a self-modifying ontology in the critical path. fileciteturn0file2

**Queues should not be introduced just because asynchronous architecture usually has queues.**

Workflows already handle the durable ingestion process. Add Cloudflare Queues only when there is a genuine fan-out concern such as:

```text
Global price approved
        │
        ├── create seller update notifications
        ├── refresh analytics
        └── update many secondary artefacts
```

Cloudflare Queues currently provides 10,000 operations per day on Workers Free, but free-plan messages are retained for only 24 hours. citeturn13search1turn15search8 Consequently, a Queue should never become Rallie's source of truth. A durable D1 record should describe the work; a queue message merely accelerates its execution.

Every ingestion also needs an application-level `ingestion_jobs`/`extraction_runs` record regardless of the Workflows dashboard:

```text
workflow_id
document_id
status
current_stage
progress_current
progress_total
started_at
finished_at
last_error
retry_count
```

That gives the product itself a supportable history:

```text
Jaquar Oct 2026
Completed
412 rows
2m 14s

Cera Sept 2026
Failed during extraction
[Retry]
```

rather than requiring you to diagnose user-facing state from cloud logs.

## Quotation lifecycle, customer experience and documents

The most important quotation implementation decision is to make **revisions immutable once the customer has approved them**.

A naïve live quote creates a dangerous sequence:

```text
Seller shares ₹50,000
Customer reads ₹50,000
Customer approves
Employee changes discount
Quote now says ₹55,000
```

That must never happen.

Instead:

```text
Quote Q100
    │
    ├── revision 1    ₹50,000
    │       shared
    │
    ├── revision 2    ₹48,500
    │       shared
    │       APPROVED BY CUSTOMER
    │
    └── revision 3    only exists if seller changes it later
            approval required again
```

The quote state machine should be:

```text
DRAFT
  │
  │ Share
  ▼
SHARED
  │
  ├──────── Customer proposes change ────────┐
  │                                           ▼
  │                                   CHANGE_PROPOSED
  │                                           │
  │                                   Seller accepts/reprices
  │                                           │
  └───────────────────────────────────────────┘
                     │
                     ▼
                  SHARED
                     │
               Customer approves
                     │
                     ▼
                  APPROVED
                     │
              Create in Tally
                     │
                     ▼
                TALLY_PENDING
                     │
             successful Tally ACK
                     │
                     ▼
                   BILLED
```

Also support `VOID` / `EXPIRED`.

Every revision needs a deterministic content hash generated from customer-facing commercial fields. Customer approval records:

```text
quote_id
revision_id
revision_content_hash
approved_at
approval_token_id
customer_name
```

Once approved, that revision is frozen.

This leads to a correction to the phrase **“quotation automatically gets converted to bill when user views it after it.”**

I strongly recommend **not** creating a bill merely because somebody views an approved quotation. Viewing is a read action. Billing is an accounting action with consequences for stock, GST/accounting records and Tally. Instead:

```text
Customer approves
      ↓
Rallie shows
APPROVED — READY TO BILL
      ↓
Owner/employee clicks
[Create bill in Tally]
      ↓
Tally acknowledges creation
      ↓
Rallie status = BILLED
```

That boundary is especially valuable because Tally's voucher imports require the relevant masters such as ledgers, stock items and units to exist, and Tally explicitly returns import errors/statistics that the integration must handle. citeturn11search9

If you later discover that businesses genuinely want immediate billing after customer approval, introduce an opt-in business setting:

```text
[ ] Automatically send customer-approved quotations to Tally
```

but it should not be the safe default.

**Quotation price data must always be snapshotted.**

Do not model a quote line as only:

```text
product_id = 123
quantity = 2
```

because tomorrow's catalogue price would then rewrite yesterday's commercial offer.

Instead:

```text
quote_lines

seller_product_id

brand_snapshot
sku_snapshot
name_snapshot
description_snapshot

quantity

mrp_snapshot
cost_price_snapshot          seller only
discount_pct
unit_price
line_total
```

Profit is therefore:

```text
line profit =
(unit price - cost price) × quantity

quote profit =
sum(line profits)
```

When an employee changes discount, React can calculate profit instantly without a round trip.

If a product has no cost price:

```text
Profit: —
Cost price missing
```

Do not silently treat cost as zero.

Cost/profit must remain seller-only all the way through API design. `GET /api/public/quotes/:token` should build a specific public DTO rather than serialize the internal quote entity and remove fields afterwards.

**Sharing over WhatsApp should be deliberately simple.**

On:

```text
[Share with customer]
```

Rallie should:

```text
1. Validate customer phone.
2. Persist current revision.
3. Ensure a public share token exists.
4. Mark that revision SHARED.
5. Construct customer URL.
6. Build WhatsApp message.
7. Open WhatsApp Click to Chat in a new browser tab.
```

WhatsApp officially supports Click to Chat with an international phone number and an optionally pre-filled message, so this flow does not require WhatsApp Business API integration in v1. citeturn9search0

The message can be:

```text
Hi Rajesh,

Here is your quotation from Arihant Sanitation:

₹48,200
Rallie quotation: <share link>

You can review and approve it from the link.
```

The server should never redirect through an arbitrary customer-provided URL. The quotation link is always generated from Rallie's own origin.

The public share token should be high-entropy and only its hash should be stored in the database. Treat possession of the link as access to the quotation. For high-value or more sensitive workflows, customer OTP approval can be introduced later, but requiring accounts or OTP on the first iteration would add friction to what should feel like opening a WhatsApp quotation.

**Customer editing should not mutate the seller's approved commercial document.**

Your idea of allowing the customer to add/remove products from the seller's own catalogue is good, but it needs a safe ownership model.

The customer can create a **proposal**:

```text
Original seller revision

1 x Basin Mixer
1 x Diverter
1 x Body

Customer:
- removes Basin Mixer
+ changes Diverter quantity to 2
+ adds Shower Arm from seller catalogue

[Send changes to shop]
```

This becomes:

```text
customer_proposal

based_on_revision_id
proposed_lines
created_at
status = PENDING
```

The seller then sees:

```text
Rajesh suggested 3 changes

- Basin Mixer
Diverter qty 1 → 2
+ Shower Arm

[Reject] [Accept into quote]
```

Acceptance creates a new seller revision. The seller can adjust discounts, then reshare it. The customer approves that exact revision.

The customer **never edits discount, MRP, seller cost or quoted unit price directly**.

For the earliest MVP, customer self-editing can be narrowed even further to quantity/removal only. Adding arbitrary seller-catalogue items involves exposing catalogue search publicly and is a useful second increment rather than a prerequisite for proving the quotation workflow.

**PDF generation should be exactly as you requested: explicit only.**

No PDF is created on:

```text
save
share
price edit
customer view
approval
```

Only:

```text
[Generate PDF]
```

At that moment:

```text
current immutable revision
       ↓
client-side PDF renderer
       ↓
Blob
       ├── browser download
       └── optional upload to R2
```

`@react-pdf/renderer` currently supports browser-side on-demand PDF generation and exposes the generated Blob, making it a good fit for generating only when the user clicks the button rather than paying for a server-side browser renderer. citeturn17search0

Persist:

```text
quote_documents

id
quote_revision_id
sha256
r2_key
generated_by
generated_at
```

Generating again after the quote changes creates another document tied to the new revision; it does not overwrite historical PDFs.

## Tally bridge and two-way synchronisation

The earlier research was directionally correct that Rallie needs a local bridge between its cloud application and Tally running on a shop's Windows PC. fileciteturn0file0 I would keep that concept but simplify and harden the protocol.

TallyPrime has a built-in XML-over-HTTP integration interface; when its HTTP server is enabled, the default example port is 9000 and third-party applications can send XML to `http://<Tally-IP>:9000`. Tally can return data and accept masters/transactions through that integration mechanism. citeturn18search1turn18search6 Tally also supports third-party applications pulling collections such as StockItem, Voucher and Ledger over HTTP/XML, and it supports ODBC for external data access. citeturn18search2turn18search0

This means Rallie does **not** need to screen-scrape Tally or automate its UI.

The production topology should be:

```text
                        CLOUDFLARE

Rallie Browser
      │
      │ HTTPS
      ▼
Rallie Worker
      │
      ▼
tally_sync_jobs in D1
      │
      ▼
Durable Object
      ║
      ║ secure outbound WebSocket
      ║
═══════════════════════════════════════════════════════════
                    SHOP WINDOWS PC

      ║
      ▼
Rallie Bridge Windows Service
      │
      │ HTTP/XML
      ▼
http://127.0.0.1:9000
      │
      ▼
TallyPrime
```

There is no inbound port forwarding. The Rallie Bridge initiates the cloud connection.

A Cloudflare Durable Object is a strong fit for the cloud endpoint because Durable Objects can act as WebSocket servers, and Cloudflare's hibernation API allows idle objects to sleep without dropping connected WebSocket clients or accruing duration charges while hibernating. citeturn13search0turn13search2

I would build `Rallie Bridge` in **Go** or **.NET**. Either can become a small Windows service. The important architecture is not the language; it is that the bridge has exactly three responsibilities:

```text
Cloud connection
Tally XML adapter
Reliable local job execution
```

Do not put catalogue or quotation business logic into the Windows application.

On initial setup:

```text
Rallie → Tally

Step 1
Owner opens Settings → Tally → Connect

Step 2
Rallie displays:
PAIR CODE
RALLIE-8F3D-92KQ

Step 3
Install Rallie Bridge on Tally PC

Step 4
Bridge asks for pairing code

Step 5
Bridge opens outbound TLS connection

Step 6
Bridge probes localhost:9000

Step 7
Bridge discovers loaded Tally company/companies

Step 8
Owner confirms:
Connect to "Arihant Sanitation FY26-27"

Step 9
Initial Tally catalogue sync begins
```

Tally's documented integration prerequisites include having TallyPrime running, an appropriate company loaded and the HTTP server configured. citeturn18search6

The first sync should fetch:

```text
Tally stock item identity
Tally stock item name
aliases, if available
unit of measure
closing / current stock data
relevant price/rate information where configured
last sync timestamp
```

Tally can expose stock/master collections to third-party applications; its integration documentation explicitly describes pulling master data and stock information, and its ODBC/XML mechanisms expose internal objects and collections. citeturn18search0turn18search2

However, I would **not make Rallie continuously mirror every Tally mutation in v1**. Start with:

```text
Sync when bridge starts
Sync when it reconnects
Manual [Sync now]
Sync immediately before billing
Periodic sync every X minutes while connected
```

That gives Rallie a useful stock indicator without trying to become an event-sourced replica of Tally.

Display inventory as:

```text
Tally stock
14 pcs

Last synced 7 minutes ago
```

Never imply that a five-hour-old stock figure is realtime.

The crucial problem you identified is **product mapping**.

Do not attempt to solve it every time a quote is billed. Maintain a permanent mapping:

```text
seller_product_tally_map

business_id
seller_product_id
tally_connection_id
tally_item_key

match_method
match_confidence
status

confirmed_by
confirmed_at
```

Mapping status:

```text
PROPOSED
CONFIRMED
REJECTED
```

The initial matching engine works in this order:

```text
Rallie item
ALD-CHR-079N

      │
      ├─ Existing confirmed mapping?
      │       yes → DONE
      │
      ├─ exact SKU against Tally Part No / alias?
      │       yes → high-confidence proposal
      │
      ├─ exact normalised item name?
      │       yes → proposal
      │
      ├─ brand + fuzzy name?
      │       yes → review candidate
      │
      └─ no candidate
              → Unmapped
```

Do not silently fuzzy-match an accounting item.

The owner/employee gets a one-time mapping UI:

```text
Rallie
Jaquar ALD-CHR-079N
Concealed Diverter Body

Tally candidates:

○ ALD-CHR-079N
  Jaquar concealed diverter body
  Stock 14 Nos
  99% likely

○ ALD BODY
  Concealed body 40mm
  Stock 3 Nos

○ None of these

[Confirm mapping]
```

Once confirmed, future quotes use the mapping deterministically.

If the product does not exist in Tally, offer:

```text
No Tally stock item found

[Create stock item in Tally]
[Map manually]
[Cancel]
```

Tally officially supports creating a Stock Item from a third-party application using XML. citeturn11search9 The creation response and resulting Tally identity are saved back into the mapping table.

The approved-quote billing flow should then be:

```text
Customer approves revision 4
          │
          ▼
Quote status = APPROVED
          │
          ▼
[Create bill in Tally]
          │
          ▼
Pre-flight
  ├─ Bridge online?
  ├─ Correct Tally company loaded?
  ├─ Every quote line mapped?
  ├─ Required Tally masters exist?
  ├─ Refresh stock
  └─ Warn on stock shortage
          │
          ▼
Create tally_sync_job
          │
          ▼
Send job through WebSocket
          │
          ▼
Bridge posts XML to localhost:9000
          │
          ▼
Tally response
  ├─ CREATED / success
  └─ errors / line error
          │
          ▼
Bridge ACK to cloud
          │
          ├─ failure → TALLY_ERROR
          └─ success → BILLED
```

Tally's XML import responses expose counts such as `CREATED`, `ALTERED` and `ERRORS`, and can return `LINEERROR` details; its documentation also warns that required masters such as Ledger, Stock Item and UOM must exist before voucher import. citeturn11search9 Rallie must parse those responses rather than treating HTTP 200 as “invoice created”.

I would initially let Rallie create a **regular Sales Voucher only after explicit seller action**. An alternative is to create an Optional Voucher first; current TallyPrime supports Optional Vouchers that do not post to the books until regularised. citeturn11search1 That can be useful for businesses wanting a final Tally-side review, but it should be a business setting:

```text
When sending approved Rallie quote to Tally:

(•) Create normal Sales Voucher
( ) Create Optional Voucher for Tally review
```

Rallie should not attempt to replicate Tally's tax engine. The billing job sends the agreed item/quantity/rate/customer context to the configured Tally voucher template; Tally remains the final accounting system.

**On MCP:** I would not use MCP as the production communication protocol between Rallie Cloud and the Windows bridge.

The production path is billing-critical and should use a tiny, typed protocol such as:

```json
{
  "type": "CREATE_SALES_VOUCHER",
  "jobId": "tsj_123",
  "idempotencyKey": "quote_82_rev_4",
  "payload": {}
}
```

and:

```json
{
  "type": "JOB_RESULT",
  "jobId": "tsj_123",
  "success": true,
  "tally": {
    "voucherNumber": "...",
    "masterId": "..."
  }
}
```

That protocol is deterministic, versioned and testable.

MCP is still useful as an **optional interface layered over the same bridge capabilities**:

```text
tools:
get_tally_status
list_stock_items
search_stock_item
get_stock
sync_catalogue
create_stock_item
create_sales_voucher
get_voucher
```

That would let an AI support agent inspect a Tally connection or assist an administrator later. But the “Create Bill” button should call Rallie's typed billing API, not ask an AI/MCP agent to reason its way through an accounting transaction.

The two-way sync responsibility should therefore be intentionally asymmetric:

```text
TALLY → RALLIE
------------------------
Stock-item masters
Current stock
Existing item identities
Selected price information
Voucher result

RALLIE → TALLY
------------------------
Confirmed mappings / new masters when requested
Approved customer
Approved quote lines
Final quantities/rates
Sales voucher request
```

Avoid a default where both Rallie and Tally continually overwrite each other's selling prices. Tally itself supports price-list concepts, so two independent price-authority systems would otherwise create a loop. citeturn11search9turn18search10 In v1, **Rallie owns quotation pricing; Tally owns accounting/inventory truth**.

## AI implementation sequence and definition of done

The coding AI should **not build this as “all schemas first, then all APIs, then all frontend”.** That creates a large untested system whose domain assumptions are discovered too late.

Build Rallie as vertical slices in the exact order below.

**Foundation slice — deploy one empty Rallie**

Create a monorepo:

```text
rallie/
  apps/
    web/
      src/
        app/
        components/
        features/
        lib/
    bridge/                 later

  packages/
    domain/
    db/
    api-contracts/
    tally-protocol/         later

  migrations/
  wrangler.jsonc
```

Use:

```text
React
TypeScript
Vite
Cloudflare Worker
Cloudflare D1
Drizzle or thin typed SQL layer
Zod-style request validation
Vitest
Playwright
```

Workers Static Assets supports deploying a React SPA and Worker API as a single Cloudflare unit. citeturn12search0

Implement:

```text
GET /health
```

Create dev/staging/production environments.

Set up D1 migrations.

Do not introduce Redis, Kubernetes, Docker in production, microservices, Kafka, GraphQL, CQRS or a repository abstraction for hypothetical future databases.

**Definition of done:** a commit to main deploys one React application and Worker, `/health` passes, migrations can be replayed into an empty D1 database.

**Identity and business slice**

Implement authentication and:

```text
businesses
business_memberships
```

Rules:

```text
Owner can invite Employee.
Employee cannot invite/remove Owner.
Every operational query contains business_id from authenticated membership.
Client-supplied business_id is never trusted for authorisation.
Platform admin is a separate platform claim, not a business role.
```

Build Settings → Business and Settings → Employees.

**Definition of done:** automated test proves an employee from Business A cannot read Business B's catalogue or quotations by modifying an ID in the request.

**Minimal catalogue slice**

Create:

```text
brands
global_products
product_price_versions
seller_products
seller_product_aliases
```

Seed a few real-looking test products manually.

Build Catalogue:

```text
My Catalogue
Global Catalogue
Search
Add to my catalogue
Product drawer
Edit seller pricing
```

Add FTS5. D1 officially supports FTS5, so test ranking against D1 rather than mocking it away. citeturn15search0

Acceptance tests:

```text
Search exact SKU → exact SKU first.
Search product words → correct item returned.
Global item can be added to seller.
Seller can change cost/discount without changing global data.
Business B cannot see Business A cost price.
```

Do **not** start PDF ingestion before this slice works: the ingestion pipeline needs a real place to put products.

**Quotation slice**

Create:

```text
customers
quotes
quote_revisions
quote_lines
quote_events
```

Build the single Build workspace.

Implement IDE-style desktop tabs.

Implement seller catalogue search.

Implement relationship placeholder but not relationships yet.

Implement right-hand quote.

Pricing tests must cover:

```text
qty change
percentage discount
manual unit price
missing cost
rounding to paise/rupee policy
profit calculation
MRP changes after quote creation
```

Store money as integer minor units where practical:

```text
₹6,000.50 → 600050 paise
```

rather than floating-point values such as JavaScript `6000.50`.

Acceptance test:

```text
Create quote at MRP ₹5,000.
Save.
Global product changes to ₹6,000.
Reload quote.
Quote must still show its original ₹5,000 snapshot.
```

That test captures one of the most important invariants in the whole application.

**Sharing and revision slice**

Implement public tokens and exact-revision approval.

Share action:

```text
save revision
→ mark shared
→ generate URL
→ open WhatsApp Click to Chat
```

WhatsApp supports opening a conversation with a prefilled message through Click to Chat. citeturn9search0

Test:

```text
Seller shares revision 1.
Customer loads revision 1.
Seller modifies quote → revision 2.
Customer's stale revision-1 approval request must not approve revision 2.
```

After approval:

```text
revision locked
quote = APPROVED
```

If seller edits:

```text
create revision 3
quote returns to SHARED/DRAFT
new customer approval required
```

Implement customer change proposals only after this locking model is correct.

**Explicit PDF generation slice**

Create one reusable `QuotationDocument` component using the immutable revision snapshot.

On click:

```text
Generate PDF
→ render blob client-side
→ download
→ optionally PUT to R2
→ record quote_document
```

React-pdf supports on-demand browser rendering and access to the generated Blob. citeturn17search0

Acceptance test:

```text
Saving quote does not generate PDF.
Sharing quote does not generate PDF.
Customer view does not generate PDF.
Only clicking Generate PDF creates quote_documents row.
```

**PDF ingestion slice**

Only now add:

```text
source_documents
source_submissions
extraction_runs
staged_products
product_claims
product_price_claims
```

Set R2 bucket private.

Implement presigned upload. Cloudflare supports direct browser PUT to R2 using server-generated presigned URLs. citeturn15search9

Implement Cloudflare Workflow:

```text
validate
hash
dedupe
convert
extract
normalise
match
stage
finish
```

Use Workers AI `toMarkdown` for initial document conversion. citeturn15search3

Crucially, implement an `Extractor` interface:

```ts
interface CatalogueExtractor {
  extract(document: ParsedDocument): Promise<ExtractedCatalogue>;
}
```

The first adapter can be `CloudflareAiCatalogueExtractor`.

That keeps an OCI/Docling fallback possible without putting OCI into the initial system.

Use an extractor version:

```text
cf-ai-v1
cf-ai-v2
docling-v1
```

in `extraction_runs`, so changes in parsing behaviour remain diagnosable.

Acceptance fixtures should include:

```text
digital table PDF
multi-page table
headers repeated on every page
missing SKU row
missing price
price containing comma
₹ symbol
duplicate row
same file uploaded twice
same product with changed price
two similar SKUs
```

For every parsed row preserve:

```text
source page
raw/source text
extracted values
seller corrections
```

A parser must never be “correct” merely because its JSON validates.

**Review-and-global-evidence slice**

Build the review screen exactly after the extraction pipeline is producing real staged rows.

Commit seller catalogue and claims atomically where possible. D1's batched statement API provides transaction-like atomic execution for a set of statements. citeturn20search0

Test:

```text
Seller edits extracted name:
source extraction remains unchanged.
seller catalogue receives edited value.
claim records edited proposal.
global product remains unchanged until admin.
```

Test duplicate document:

```text
Business A uploads PDF X.
Extraction runs once.

Business B uploads identical PDF X.
No second extraction.
Second source_submission exists.
Evidence count becomes two businesses.
```

**Admin moderation slice**

Build the four tabs:

```text
Product claims
Prices
Relationships
Duplicates
```

Implement:

```text
approve
reject
merge
```

Admin publication must be auditable:

```text
approved_by
approved_at
source_claim_id
```

When a price claim is approved:

```text
new product_price_versions row
latest pointer updates
seller prices DO NOT update
```

Catalogue dashboard then surfaces drift.

**Relationships slice**

Add:

```text
relationship_candidates
relationships
```

Allow owner/employee to propose.

Use local proposal immediately for that business.

Admin approval makes it global.

Quote search now returns:

```text
Required product
Commonly sold with
```

For a `REQUIRED_WITH` relation, UX should make omission explicit:

```text
You're adding Kubix diverter trim.

Required:
ALD-CHR-079N concealed body

[Add both]
[Add trim only]
```

Do not silently insert products into a quote. The employee should see what Rallie is doing.

**Tally bridge slice**

Only after approved quotations are stable should the AI build accounting integration.

First implement a fake bridge protocol in tests:

```text
connect
heartbeat
list-company
sync-items
create-item
create-voucher
job-result
```

Then build the real Windows bridge.

Tally's documented XML/HTTP interface supplies the integration boundary, with Tally acting as an HTTP server receiving XML requests and sending XML responses. citeturn18search1turn18search6

Implement Durable Object WebSocket transport only at this stage. Durable Objects' hibernatable WebSocket API is designed to maintain idle client connections while allowing the object to hibernate. citeturn13search0

Every cloud-to-agent message requires:

```text
protocol_version
message_id
job_id
idempotency_key
type
payload
sent_at
```

Every result requires:

```text
message_id
job_id
success
result
error_code
error_message
completed_at
```

The bridge also keeps a small local SQLite job ledger:

```text
job_id
payload_hash
status
result
```

so a reconnect/retry cannot accidentally create the same sales voucher twice.

The cloud also stores the idempotency key. **Exactly-once delivery should not be assumed; duplicate execution must be made harmless by design.**

Implement stock sync first.

Then mapping.

Then stock-item creation.

Finally sales-voucher creation.

Do not build all four simultaneously.

Acceptance test for the accounting boundary:

```text
1. Approved revision exists.
2. User clicks Create bill.
3. Job reaches bridge.
4. Connection drops after Tally successfully creates voucher
   but before cloud receives ACK.
5. Cloud retries.
6. Bridge recognises same idempotency key.
7. It returns original result instead of creating second voucher.
8. Rallie shows one bill.
```

This failure case is more important than the happy path.

**Free-tier and scaling checkpoints**

Do not pre-optimise for millions of products. Instrument actual consumption.

The Cloudflare free allocations currently include 100,000 Worker requests/day, 5 million D1 rows read/day, 100,000 D1 rows written/day, 5 GB D1 storage, 10 GB-month R2 storage, 3,000 Workflow steps/day and 10,000 Workers AI neurons/day. citeturn15search6turn12search2turn13search5turn13search3turn16search0

Create an internal operational page showing:

```text
Last 24 hours

Worker requests
D1 reads/writes
R2 storage
Workflows started/failed
AI extraction documents
Median extraction time
Rows extracted
Rows requiring human correction
Exact SKU match %
Possible duplicate %
Admin claims pending
Tally agents online
Tally job success %
```

These metrics tell you **when** to complicate the architecture.

The migration rules should be explicit:

| Evidence observed | Change to make |
|---|---|
| Cloud search is fast enough and counters remain connected | Keep D1; do not build SQLite-Wasm |
| Stores regularly lose connectivity during sales | Add offline seller-catalogue snapshot |
| D1 FTS ranking becomes insufficient | Add dedicated search service, not before |
| PDF extraction quality poor for particular brands | Add brand-specific extraction adapter |
| CPU-heavy document processing is genuinely necessary | Add OCI worker/container only for that stage |
| Workflows become too limited for complex long-lived orchestration | Evaluate Temporal then |
| Admin queue becomes overwhelmed by obvious trusted updates | Add rules-assisted auto-approval selectively |
| Customer self-edit usage is high | Expand customer storefront/search |
| Tally agent use becomes widespread | Invest in auto-update, diagnostics and MCP support tools |

The final architecture is therefore intentionally asymmetric:

```text
                  RALLIE V1

Simple where correctness is obvious
------------------------------------
React SPA
Worker API
D1
R2
FTS5
One quotation builder
Owner / Employee
Public customer links


Strict where mistakes are expensive
-----------------------------------
Immutable PDF evidence
Admin-controlled global publication
Append-only price history
Immutable quote revisions
Exact-revision customer approval
Confirmed Tally product mappings
Idempotent billing jobs


Optional complexity only when proven
------------------------------------
Offline SQLite
Vector search
Dynamic ontology
Voice
OCI compute
Temporal
Automated catalogue consensus
MCP agent tooling
```

That is the architecture I would give an AI coding agent as the governing rule for Rallie: **do not attempt to understand the entire hardware industry, synchronise every system in real time, or predict future scale. Preserve evidence, make mutations explicit, snapshot commercial commitments, put human approval at uncertain boundaries, and keep the common counter workflow extremely fast.**