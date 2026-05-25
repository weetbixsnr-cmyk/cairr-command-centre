# Dashboard Data Model Restructure Plan

**Created:** 2026-05-21
**Audited:** 2026-05-21 — Partial Pass. Six fixes applied (see Audit Response section at bottom).
**Purpose:** Fix the BTS dashboard data model so updates are repeatable, consistent, and gradually scriptable.
**Problem:** `bts-status.json` is 53K tokens with duplicate data in 5+ sections. Published content stays in "Future Posts" because there's no single update procedure. Manual updates miss sections and the dashboard drifts out of sync.
**Scope:** Phase 1 only (content.json). Phases 2-4 remain documented as roadmap but are not approved for implementation.

## Current State (What's Broken)

### The Monolith Problem

`bts-status.json` contains 15+ top-level sections that duplicate the same data:

| Data Point | Where It Appears | Example Drift |
|---|---|---|
| Blogs published count | `metrics[3].value`, `seo.blogsPublished`, `blogInventory.published`, `publishLedger.totalBlogs`, `seoDash` | metrics says 17, blogInventory says 14, publishLedger says 14 |
| Pending draft count | `metrics[6].value`, `seo.pendingDraftAssets`, `seo.contentPipeline.pendingDraftAssets`, `blogInventory.pendingDraftAssets` | Some say 7, some say 10 |
| Live pages | `metrics[2].value`, `seo.pagesLive`, `blogInventory.livePages`, `publishLedger.totalPages` | metrics says 39, blogInventory says 35 |
| Content item status | `drafts.drafts[].status`, `seo.contentPipeline.pending[].status`, `blogInventory.planned[].status` | Same item shows "published" in one, "draft" in another |

### Full Blog Content Inline

The `drafts.drafts` array stores entire blog markdown (5,000+ chars each) as JSON string values. This accounts for ~40K of the 53K token file. The dashboard only needs title, status, type, and batch.

### No Lifecycle State Machine

When a post gets published, someone must manually update:
1. `drafts.drafts[id].status` → "published"
2. `drafts.drafts[id].publishedAt` and `wpId`
3. `seo.contentPipeline.pending` → remove the item
4. `blogInventory.planned[id].status` → "published"
5. `publishLedger.entries` → add the item
6. `publishLedger.totalBlogs` / `totalNews` → increment
7. `publishedBatch` → update batch info
8. `metrics` array → update blogs/news/pages/pending counts
9. `seo.blogsPublished` / `newsInsightsPublished` → increment
10. `seo.pendingDraftAssets` → decrement

Miss any one of these and the dashboard shows stale data. The "Future Posts" tab still shows published content because step 1 was missed.

## Target State

### Principle: One Fact, One Place

Every piece of data lives in exactly one location. The dashboard code derives views from that single source. No manual sync between sections.

### Data Ownership and Flow

**Principle:** BTS repo owns BTS content truth. Command Centre consumes an exported copy.

```
BTS REPO (source of truth)              COMMAND CENTRE (renderer)
─────────────────────────               ──────────────────────────
content/content.json ───── copy ──────> public/data/bts/content.json
                                        │
                                        ▼
                                        lib/dashboard-data.js reads it
                                        │
                                        ▼
                                        Vercel serves dashboard
```

**Short-term (Phase 1):** Manual copy. After updating `content.json` in BTS, copy it to `public/data/bts/content.json` in Command Centre. Both repos get committed.

**Medium-term (Phase 3):** A script handles the copy as part of the publish procedure.

**Long-term (Phase 4):** Build-time import. Command Centre's build step pulls `content.json` from BTS repo (via git submodule, GitHub API, or a pre-build script). Eliminates the manual copy entirely.

**Vercel constraint:** Vercel's filesystem is ephemeral at runtime. The dashboard cannot read files from the BTS repo at request time. All data must be present in the Command Centre repo at build/deploy time. API routes that write JSON (like `bts-drafts.js`) cannot persist changes across deploys. Write actions must either commit back to the repo (triggering a redeploy) or use external storage. For Phase 1, the dashboard is read-only for content lifecycle; all writes happen via Claude Code sessions updating the JSON files directly.

**Write-route classification (2026-05-25):**

| Route | Writes To | Auth | Risk |
|-------|-----------|------|------|
| `/api/action` | `dashboard-status.json` | Dashboard cookie | Local-only; ephemeral on Vercel |
| `/api/bts-draft-action` | `bts-status.json` | BTS cookie / dashboard cookie / API key | Local-only; ephemeral on Vercel |
| `/api/bts-drafts` | `bts-status.json` | BTS cookie / dashboard cookie / API key | Local-only; ephemeral on Vercel |
| `/api/bts-suggestions` | `bts-status.json` | BTS cookie / dashboard cookie | Local-only; ephemeral on Vercel |
| `/api/nbhw-draft-action` | `nbhw-status.json` | Dashboard cookie / API key | Local-only; ephemeral on Vercel |
| `/api/nbhw-drafts` | `nbhw-status.json` | Dashboard cookie / API key | Local-only; ephemeral on Vercel |
| `/api/nbhw-gbp-action` | `nbhw-status.json` | Dashboard cookie / API key | Local-only; ephemeral on Vercel |
| `/api/nbhw-suggestions` | `nbhw-status.json` | Dashboard cookie | Local-only; ephemeral on Vercel |

All write routes are guarded by `canWriteJson()` (`lib/auth.js`): allowed locally, blocked on Vercel unless `ENABLE_JSON_WRITES=true`. Future durable writes require GitHub commit flow or external storage.

### Split Into Domain Files (Phase 2+ Roadmap)

Future phases will replace the monolith with focused files in `public/data/bts/`:

```
public/data/bts/
├── content.json         # ALL content items with lifecycle status (Phase 1 — DO NOW)
├── status.json          # Top-level status, blockers, next actions (Phase 2)
├── seo-metrics.json     # Scores, keywords, rankings (Phase 2)
├── competitors.json     # Competitor watch data (Phase 2)
├── courses.json         # Course inventory (Phase 2)
└── news-bank.json       # News story bank (Phase 2)
```

**Phase 1 only creates `content.json`.** The existing `bts-status.json` remains for all other sections. Old duplicate sections in `bts-status.json` are marked deprecated but not removed until the dashboard proves stable on the new data source.

### Content Lifecycle (content.json)

Every content item has exactly ONE record with ONE status field:

```json
{
  "items": [
    {
      "id": "blog-15-slough",
      "title": "Gas and Plumbing Training Near Slough",
      "type": "location",
      "service": "Multi-trade",
      "batch": "4A",
      "status": "published",
      "wpId": 707,
      "url": "/gas-and-plumbing-training-near-slough/",
      "featuredImageId": 656,
      "publishedAt": "2026-05-21",
      "sourceFile": "content/published-blogs/blog-15-location-slough.md",
      "excerpt": "Looking for gas or plumbing training near Slough? Better Training Solutions runs ACS reassessment, water regulations, G3, Legionella, and heat pump courses from High Wycombe.",
      "reviewUrl": null
    },
    {
      "id": "blog-16-maidenhead",
      "title": "Gas and Plumbing Training Near Maidenhead",
      "type": "location",
      "service": "Multi-trade",
      "batch": "4B",
      "status": "draft",
      "wpId": null,
      "url": null,
      "featuredImageId": null,
      "publishedAt": null,
      "sourceFile": "content/pending-drafts/blog-16-location-maidenhead.md",
      "excerpt": "Looking for gas or plumbing training near Maidenhead? Better Training Solutions runs ACS reassessment, water regulations, G3, and heat pump courses from High Wycombe.",
      "reviewUrl": null
    },
    {
      "id": "news-5-bus-amendments",
      "title": "BUS Grant Amendments 2026",
      "type": "news",
      "service": "Policy",
      "batch": null,
      "status": "held",
      "wpId": null,
      "url": null,
      "featuredImageId": null,
      "publishedAt": null,
      "sourceFile": "content/pending-drafts/news-5-bus-amendments-2026.md",
      "excerpt": "Held pending review of government funding reference rules.",
      "reviewUrl": null
    }
  ]
}
```

**Status values:**
- `draft` — written, not yet approved
- `approved` — Sunny approved, ready to publish
- `published` — live on WordPress
- `held` — parked intentionally (e.g. News 5, About Us page, directory package — items that exist but are not active pipeline work)
- `reference` — informational content that will never be published (e.g. internal strategy docs tracked for completeness)

**No full markdown body in the JSON.** The `sourceFile` field points to the markdown file in the BTS repo. For dashboard readability (Adam/Sunny reviewing drafts), each item includes:
- `sourceFile` — path to the full markdown in BTS repo
- `excerpt` — 1-2 sentence summary (the same excerpt written for WordPress, or a short description for unpublished items)
- `reviewUrl` — optional, set when a draft preview is available (e.g. a WordPress preview link or a rendered HTML path)

This gives the Future Posts tab enough to render a readable card without storing 5K+ chars of markdown inline. If Adam/Sunny need the full body, they open the `sourceFile` or `reviewUrl`.

The dashboard derives everything from this one array:
- **Future Posts tab:** `items.filter(i => !['published', 'held', 'reference'].includes(i.status))`
- **Coverage Matrix tab:** `items.filter(i => i.status === 'published')` grouped by type/service
- **Held items:** `items.filter(i => i.status === 'held')` — shown separately so they don't clutter the pipeline
- **Metrics (blogs live):** `items.filter(i => i.status === 'published' && i.type !== 'news').length`
- **Metrics (news live):** `items.filter(i => i.status === 'published' && i.type === 'news').length`
- **Metrics (pending):** `items.filter(i => ['draft', 'approved'].includes(i.status)).length`
- **Publish ledger:** `items.filter(i => i.publishedAt).sort(byDate)`

One status change updates every view. No manual sync.

### SEO Metrics (seo-metrics.json)

Static scores that only change during weekly SEO checks:

```json
{
  "lastUpdated": "2026-05-21",
  "healthScore": 28,
  "healthScoreTarget": 75,
  "geoReadiness": 5,
  "geoReadinessTarget": 60,
  "pagesLive": 39,
  "coreKeywords": [...],
  "locationKeywords": [...],
  "locationCoverage": {...},
  "crawlerStatus": {...}
}
```

`pagesLive` is the one field that also changes on publish. The publish procedure increments it here.

### Status (status.json)

The thin summary file:

```json
{
  "id": "bts",
  "name": "Better Training Solutions",
  "status": "verify",
  "statusLabel": "GSC/Bing verification P0",
  "lastUpdated": "2026-05-21",
  "summary": "...",
  "blockers": [...],
  "nextActions": [...]
}
```

## Numbered Procedures

### Procedure 1: Publish a Batch

**Trigger:** Sunny approved, Adam says publish.

| Step | What | Where | Scriptable |
|---|---|---|---|
| 1 | Publish posts via WP REST API per PUBLISHING_SPEC.md | WordPress | Yes |
| 2 | Record WP IDs and URLs | — | — |
| 3 | For each published item in BTS `content/content.json`: set `status: "published"`, `wpId`, `url`, `featuredImageId`, `publishedAt`. Update `sourceFile` path from `pending-drafts/` to `published-blogs/`. | BTS repo | Yes |
| 4 | Move source markdown files from `pending-drafts/` to `published-blogs/` | BTS repo | Yes |
| 5 | Update `approvals/approval-log.md` | BTS repo | Yes |
| 6 | Copy `content/content.json` from BTS repo to Command Centre `public/data/bts/content.json` | Command Centre repo | Yes |
| 7 | Update top-level summary/nextActions in `bts-status.json` (until Phase 2 splits this out) | Command Centre repo | Manual |
| 8 | Commit and push both repos | Git | Yes |
| 9 | Visual check on live site and dashboard | Browser | Manual |

Steps 1-6 and 8 can be a single script that takes batch ID and WP IDs as input.

### Procedure 2: Create New Draft Content

**Trigger:** Weekly content cycle or Adam creates a new piece.

| Step | What | Where | Scriptable |
|---|---|---|---|
| 1 | Write markdown file in `content/pending-drafts/` | BTS repo | Manual |
| 2 | Add item to `content/content.json` with `status: "draft"`, `excerpt`, `sourceFile` | BTS repo | Yes |
| 3 | Assign to batch | `content.json` batch field | Yes |
| 4 | Copy `content.json` to Command Centre `public/data/bts/content.json` | Command Centre repo | Yes |
| 5 | Commit and push both repos | Git | Yes |

### Procedure 3: Weekly SEO Check

**Trigger:** Monday weekly cycle.

| Step | What | Where | Scriptable |
|---|---|---|---|
| 1 | Check rankings (manual Brave search or GSC when available) | External | Manual |
| 2 | Update keyword positions in `seo-metrics.json` | `public/data/bts/seo-metrics.json` | Partially |
| 3 | Update `healthScore` if changed | `seo-metrics.json` | Manual |
| 4 | Update `status.json` blockers and nextActions | `public/data/bts/status.json` | Manual |
| 5 | Check competitor activity | External | Manual |
| 6 | Update `competitors.json` if changes found | `public/data/bts/competitors.json` | Manual |
| 7 | Commit and push | Git | Yes |

### Procedure 4: Sunny Approves Content

**Trigger:** Sunny approves via WhatsApp/phone.

| Step | What | Where | Scriptable |
|---|---|---|---|
| 1 | Log approval in `approvals/approval-log.md` | BTS repo | Yes |
| 2 | Update item status to `approved` in BTS `content/content.json` | BTS repo | Yes |
| 3 | Copy `content.json` to Command Centre `public/data/bts/content.json` | Command Centre repo | Yes |
| 4 | Commit and push both repos | Git | Yes |

### Procedure 5: Add FAQ to Page (Future — Sprint 2+)

| Step | What | Where | Scriptable |
|---|---|---|---|
| 1 | Select questions from FAQ question bank | `seo/faq-question-bank.json` | Manual |
| 2 | Draft answers per PLAN_CONTENT_AND_FAQ_OPERATIONS.md | BTS repo | Manual |
| 3 | Sunny approves FAQ block | Approval log | Manual |
| 4 | Publish FAQ via WP REST API | WordPress | Yes |
| 5 | Mark questions as assigned in question bank | `faq-question-bank.json` | Yes |
| 6 | Update `content.json` with FAQ metadata | `public/data/bts/content.json` | Yes |

## Migration Path

### Phase 1: Create content.json (Approved — Do First)

1. Build `content.json` in the BTS repo at `content/content.json`. Extract all content items from current `bts-status.json` sections (`drafts.drafts`, `blogInventory.planned`, `seo.contentPipeline.pending`, `publishLedger.entries`). Deduplicate into single items with correct status, verified against actual WordPress state.
2. Strip inline content bodies. Each item gets: id, title, type, service, batch, status, wpId, url, featuredImageId, publishedAt, sourceFile, excerpt, reviewUrl.
3. Items not in the active pipeline (News 5, About Us, directory package) get `status: "held"`.
4. Copy `content/content.json` to Command Centre at `public/data/bts/content.json`.
5. Update `dashboard-data.js` to read `content.json` for `btsDrafts`, `btsBlogInventory`, and `btsPublishLedger`. The `buildDrafts()` function reads from `content.json` items instead of `bts-status.json` drafts section.
6. **Do not remove old sections from `bts-status.json`.** Mark them as deprecated with a top-level `"_deprecated"` note. The old sections remain as compatibility fallback until the dashboard is verified stable on the new data source.
7. Verify: Future Posts tab shows only `draft`/`approved` items. Coverage Matrix shows `published` items. Held items appear separately or are hidden. Metrics match.
8. After verification passes on the live dashboard, old deprecated sections can be removed in a follow-up commit.

**Result:** Future Posts and Coverage Matrix both derive from one source. Publishing a batch means updating one file in one place.

### Phase 2: Split remaining sections

1. Extract `seo-metrics.json` from `bts-status.json` `seo` section.
2. Extract `competitors.json` from `competitors` and `competitorPages`.
3. Extract `courses.json` from `courseDetails`.
4. Extract `news-bank.json` from `newsBank` and `seoDash.newsBank`.
5. Reduce `bts-status.json` to `status.json` (just summary, blockers, nextActions).
6. Update `dashboard-data.js` to aggregate from domain files.

**Result:** Each domain file is small, focused, and owned by one procedure.

### Phase 3: Script the procedures

1. `scripts/publish-batch.sh` — takes batch items, updates content.json, moves files, increments metrics, commits.
2. `scripts/new-draft.sh` — takes title/type/batch, creates content.json entry.
3. `scripts/weekly-seo-update.sh` — opens seo-metrics.json for editing, validates, commits.

**Result:** Each procedure is a single command. Mistakes are eliminated because the script handles all the sync points.

### Phase 4: Build-time import from BTS repo (Future)

**Goal:** Command Centre becomes a renderer with no manually-copied data files.

**Vercel constraint:** Runtime cannot read local filesystem paths like `/Users/cairr/AI/CAIRR/clients/...`. Data must be available at build time.

**Mechanism options (pick one when ready):**
- **Git submodule:** BTS repo as a submodule in Command Centre. `next.config.mjs` reads BTS files at build time.
- **Pre-build script:** `scripts/sync-bts-data.sh` runs before `npm run build`, copies BTS JSON into `public/data/bts/`.
- **GitHub API fetch:** `getStaticProps` fetches `content.json` from BTS GitHub repo at build time.
- **Monorepo workspace:** If BTS and Command Centre move into the same repo, direct path import.

**Not designed yet.** Phase 4 is a directional target. The mechanism will be chosen when Phases 1-3 prove the data model works.

## Dashboard Code Changes Required

### Phase 1 Changes (content.json)

**`lib/dashboard-data.js`:**
- Add `readJson('bts/content.json', { items: [] })` reader
- `buildDrafts()` → filter `content.items` where `status !== 'published'`
- `normalizeBlogInventory()` → derive counts from `content.items`
- `buildPublishLedger()` → derive from `content.items` where `publishedAt` exists

**`pages/bts-seo.js`:**
- Future Posts tab already filters by status — will work as-is once data source changes
- Coverage Matrix tab needs updating to read from content items grouped by service/location

**`pages/api/bts-drafts.js`:**
- **Read path:** Read from `public/data/bts/content.json` instead of `bts-status.json` drafts section. Return items filtered by status.
- **Write path: DO NOT RELY ON FILESYSTEM WRITES.** On Vercel, the filesystem is ephemeral — writes to JSON files are lost on the next deploy or cold start. For Phase 1, all content lifecycle changes (approve, publish, hold) are made by Claude Code sessions editing `content.json` directly in the repo and committing. The API route becomes read-only. If Sunny-facing approval actions are needed from the dashboard UI, they must commit back to the repo (via GitHub API) or use external storage. This is a Phase 3+ concern.

### No UI Layout Changes Required

The dashboard tabs, layout, and design stay exactly the same (design lock per Command Centre CLAUDE.md). Only the data source behind each view changes.

## Automation Roadmap

| Phase | Manual Steps | Scripted Steps | Target |
|---|---|---|---|
| Now | 10 steps across 5+ files | 0 | Where we are |
| Phase 1 | 6 steps across 2 files | 0 | content.json eliminates sync |
| Phase 2 | 4 steps across domain files | 2 (commit, file move) | Split eliminates confusion |
| Phase 3 | 2 steps (write content, visual check) | Everything else | Scripts handle sync |
| Phase 4 | 1 step (visual check) | Everything else | Dashboard auto-reads from BTS |

## Constraints

- Do not rebuild the dashboard UI (Command Centre CLAUDE.md design lock)
- Do not wire project hooks until manual JSON works (Command Centre CLAUDE.md)
- BTS content changes require Sunny approval before publish (BTS Golden Rule #3)
- No breaking changes to existing dashboard pages during migration
- Each phase must be independently deployable — no big-bang migration

## Decisions (Resolved by Audit)

1. **Phase 1 only.** Do not combine with Phase 2. Content.json first — smallest blast radius, fixes the painful issue.
2. **content.json lives in BTS repo** (`content/content.json`) as source of truth. Command Centre holds a generated copy at `public/data/bts/content.json`. Short-term: manual copy. Long-term: scripted or build-time import.
3. **Clean stale data only where needed for Phase 1.** Mark old duplicate sections as deprecated, do not delete them. Remove only after the live dashboard verifies stable on the new data source.

## Audit Response

**Audit date:** 2026-05-21
**Result:** Partial Pass — six fixes applied.

| Audit Issue | Fix Applied |
|---|---|
| "Dashboard never needs full body" is false | Added `excerpt` and `reviewUrl` fields to content items. Dashboard can render readable cards. Full body stays in sourceFile. |
| Phase 4 not realistic on Vercel | Rewritten. Mechanism options listed (submodule, pre-build script, GitHub API, monorepo). Marked as "not designed yet." |
| content.json location | Resolved: BTS repo is source of truth. Command Centre gets a generated copy. |
| Do not delete old sections too early | Phase 1 step 6 now says "mark deprecated, do not remove." Step 8 added for post-verification cleanup. |
| bts-drafts.js write path on Vercel | API route becomes read-only for Phase 1. Filesystem writes are ephemeral on Vercel. All lifecycle changes via Claude Code sessions committing to repo. |
| Add held/reference status | Status values expanded: draft, approved, published, held, reference. Held items shown separately, not in active pipeline. |
