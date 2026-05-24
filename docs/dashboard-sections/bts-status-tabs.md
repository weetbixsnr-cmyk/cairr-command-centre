# Render Contract: BTS Status Tabs

> How bts-status.json and bts/seo.json feed 10 BTS dashboard tabs.
> Phase 2 Slice B (2026-05-24): SEO data extracted to BTS-owned `seo.json`.
> Content lifecycle extracted to BTS-owned `content.json` in Phase 1.
> Last verified: 2026-05-24

## Data Files

| File | Owner | Purpose |
|------|-------|---------|
| `public/data/bts-status.json` | CC (temporary) | Metadata, operational status, competitors, courses, seoDash, traffic stub |
| `public/data/bts/content.json` | BTS (Phase 1) | Content lifecycle — drafts, published items, publish ledger |
| `public/data/bts/seo.json` | BTS (Phase 2 Slice B) | SEO health, keywords, rankings, audit, plan |

`dashboard-data.js` merges seo.json onto bts-status.json via `readSeoJson()` + spread overlay before passing to builder functions.

---

## Tab 1: SEO Health

### Dashboard Tab
`health` (tab 1 of 13 on `/bts-seo`)

### Data Source
**`bts/seo.json`** (Phase 2 Slice B) — `.seo`, `.seoAudit`

### Reader Functions
- `lib/dashboard-data.js` → `buildSeoAudit()` → `snapshot.btsSeoAudit`
- `lib/dashboard-data.js` → `buildSeoDash()` → `snapshot.btsSeoDash`

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `healthScore` | number | SEO health score (currently 28/100, target 75) |
| `geoReadiness` | number | Geographic SEO readiness (currently 5/100) |
| `healthBreakdown` | object | Category scores (technical, content, authority, local) |
| `actions` | array | Priority action items |

### Fallback
Shows 0/100 gauges if seoAudit is missing.

---

## Tab 2: SEO Plan

### Dashboard Tab
`seo-plan` (tab 2 of 13 on `/bts-seo`)

### Data Source
**Mixed:** `bts/seo.json` (SEO data via merge) + `bts-status.json` (blockers, nextActions, seoDash) + `bts/content.json` (publish ledger)

### Reader Functions
- `buildPublishLedgerFromContent()` → `snapshot.btsPublishLedger` (from content.json)
- `buildSeoDash()` → `snapshot.btsSeoDash` (from merged btsWithSeo)

### Notes
This tab reads from three sources: content.json (publish safety strip), seo.json (SEO coverage data via merge), and bts-status.json (blockers, nextActions, seoDash rendering artifact).

---

## Tab 3: Rankings

### Dashboard Tab
`rankings` (tab 3 of 13 on `/bts-seo`)

### Data Source
**`bts/seo.json`** (Phase 2 Slice B) — `.seo.coreKeywords`, `.seo.locationKeywords`, `.keywords`

### Reader Function
`lib/dashboard-data.js` → `normalizeKeywords()` → `snapshot.btsKeywords`

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `keywords` | array | All tracked keywords with position, change, URL |
| `top10` | array | Keywords currently ranking in top 10 (target: 35) |
| `campaigns` | array | Keyword groupings |

### Fallback
Empty keyword table with "0/35 in top 10" message.

---

## Tab 4: Coverage Matrix

### Dashboard Tab
`matrix` (tab 4 of 13 on `/bts-seo`)

### Data Source
**Mixed:** `bts/seo.json` (location coverage via merge) + `bts/content.json` (blog inventory)

### Reader Functions
- `buildBlogInventoryFromContent()` → `snapshot.btsBlogInventory` (from content.json)
- `buildSeoPlan()` → `snapshot.btsSeoplan` (from merged btsWithSeo)

### Notes
Blog inventory from content.json, location tiers from seo.json (`.seo.locationCoverage`).

---

## Tab 5: Competitors

### Dashboard Tab
`competitors` (tab 5 of 13 on `/bts-seo`)

### Data Source
**`bts-status.json`** (temporary) — `.competitors`, `.competitorPages`

### Reader Functions
- `buildCompetitors()` → `snapshot.btsCompetitors`
- `buildCompetitorPages()` → `snapshot.btsCompetitorPages`

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `competitors` | array | Competitor name, site, threat level, notes |
| `keyGaps` | array | Keywords competitors rank for that BTS doesn't |

### Notes
Deferred to separate `competitors.json` in a future Phase 2 slice.

---

## Tab 6: News Bank

### Dashboard Tab
`news-bank` (tab 7 of 13 on `/bts-seo`)

### Data Source
**Mixed:** `bts/seo.json` (summary counts via `.seo.newsBank`) + `bts-status.json` (seoDash newsBank stories)

### Reader Function
`lib/dashboard-data.js` → `newsBankFromStatus()` (helper, feeds into `btsSeoDash`)

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `stories` | array | News items with title, source, date, status (available/drafted/published) |

### Notes
Summary counts (total/available/drafted/published) come from seo.json. Full story list comes from seoDash in bts-status.json. Deferred to separate `news-bank.json` in a future Phase 2 slice.

---

## Tab 7: Suggestions

### Dashboard Tab
`suggestions` (tab 8 of 13 on `/bts-seo`)

### Data Source
**`bts-status.json`** — `.suggestions`

### Reader Function
API route: `/api/bts-suggestions` (direct read/write, not via dashboard-data.js snapshot)

### Notes
This tab uses a direct API call rather than the snapshot pattern. Suggestions can be submitted by both Adam and Sunny (via BTS client login).

---

## Tab 8: Traffic

### Dashboard Tab
`traffic` (tab 11 of 13 on `/bts-seo`)

### Data Source
**`bts-status.json`** — `.traffic`

### Reader Function
`lib/dashboard-data.js` → `buildTraffic()` → `snapshot.btsTraffic`

### Current Status
**Stub — no real data source.** Returns hardcoded `gaPropertyId: 'BTS-GA4-NOT-CONNECTED'`. Requires GA4 integration to populate.

---

## Tab 9: Conversions

### Dashboard Tab
`conversions` (tab 12 of 13 on `/bts-seo`)

### Reader Function
Same as Traffic: `snapshot.btsTraffic`

### Current Status
**Stub — no implementation.** Tab button exists but no dedicated rendering code. Shares the Traffic data stub.

---

## Tab 10: Courses

### Dashboard Tab
`courses` (tab 13 of 13 on `/bts-seo`)

### Data Source
**Mixed:** `bts/seo.json` (training services count via `.seo.assets.trainingServices`) + `bts-status.json` (courseDetails, blockers)

### Reader Functions
- `buildCourseDetails()` → `snapshot.btsCourseDetails`
- `buildCourses()` → `snapshot.btsCourses`

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `courses` | array | Course name, duration, price, page URL, status |
| `issues` | array | Course-related blockers (e.g. missing pages) |

### Notes
Training services count comes from seo.json via merge. Course details and blockers remain in bts-status.json. Deferred to separate `courses.json` in a future Phase 2 slice.

---

## Remaining Phase 2 Migration

These tabs still read from bts-status.json (temporary CC-owned):
- **Competitors** → planned `competitors.json`
- **Courses** → planned `courses.json`
- **News Bank** (full story list) → planned `news-bank.json`
- **Suggestions, Traffic, Conversions** → no migration planned yet

Phase 2 slices beyond Slice B are NOT approved.
