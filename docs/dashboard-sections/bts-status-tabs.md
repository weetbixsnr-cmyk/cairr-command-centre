# Render Contract: BTS Status Tabs

> How bts-status.json feeds 10 BTS dashboard tabs.
> bts-status.json is currently CC-owned (temporary). Phase 2 will create BTS-owned domain files.
> See BTS `docs/dashboard-sections/future-seo-data.md` for Phase 2 migration plan.
> Last verified: 2026-05-24

## Data File

`public/data/bts-status.json` (174 KB)

This file is the remaining monolith from the pre-Phase-1 data model. Content lifecycle sections (drafts, blogInventory, publishLedger, contentPipeline) are deprecated — replaced by `content.json`. All other sections remain active.

---

## Tab 1: SEO Health

### Dashboard Tab
`health` (tab 1 of 13 on `/bts-seo`)

### Reader Functions
- `lib/dashboard-data.js` → `buildSeoAudit()` → `snapshot.btsSeoAudit`
- `lib/dashboard-data.js` → `buildSeoDash()` → `snapshot.btsSeoDash`

### bts-status.json Sections
- `.seo` (healthScore, geoReadiness, blogsPublished, pagesLive, pendingDraftAssets)
- `.seoDash` or `.seoAudit` (health breakdown, geo breakdown, action plan)

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

### Reader Functions
- `buildPublishLedgerFromContent()` → `snapshot.btsPublishLedger` (from content.json)
- `buildSeoDash()` → `snapshot.btsSeoDash` (from bts-status.json)

### bts-status.json Sections
- `.seoDash` sections: plan-overview, critical-fixes, content-pipeline, publish-history, coverage-matrix

### Notes
This tab reads from both content.json (publish safety strip) and bts-status.json (SEO plan sections). Mixed data source.

---

## Tab 3: Rankings

### Dashboard Tab
`rankings` (tab 3 of 13 on `/bts-seo`)

### Reader Function
`lib/dashboard-data.js` → `normalizeKeywords()` → `snapshot.btsKeywords`

### bts-status.json Sections
- `.seo.coreKeywords` (service-based keywords)
- `.seo.locationKeywords` (location-based keywords)

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

### Reader Functions
- `buildBlogInventoryFromContent()` → `snapshot.btsBlogInventory` (from content.json)
- `buildSeoPlan()` → `snapshot.btsSeoplan` (from bts-status.json)

### bts-status.json Sections
- `.seo.locationCoverage` (tier 1-4 locations, content gaps)

### Notes
Mixed data source: blog inventory from content.json, location tiers from bts-status.json.

---

## Tab 5: Competitors

### Dashboard Tab
`competitors` (tab 5 of 13 on `/bts-seo`)

### Reader Functions
- `buildCompetitors()` → `snapshot.btsCompetitors`
- `buildCompetitorPages()` → `snapshot.btsCompetitorPages`

### bts-status.json Sections
- `.seo.competitors` (competitor profiles, threat levels)
- `.competitors` (alternative competitor structure)

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `competitors` | array | Competitor name, site, threat level, notes |
| `keyGaps` | array | Keywords competitors rank for that BTS doesn't |

---

## Tab 6: News Bank

### Dashboard Tab
`news-bank` (tab 7 of 13 on `/bts-seo`)

### Reader Function
`lib/dashboard-data.js` → `newsBankFromStatus()` (helper, feeds into `btsSeoDash`)

### bts-status.json Sections
- `.newsBank` (curated news stories)
- `.seoDash` newsBank section

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `stories` | array | News items with title, source, date, status (available/drafted/published) |

---

## Tab 7: Suggestions

### Dashboard Tab
`suggestions` (tab 8 of 13 on `/bts-seo`)

### Reader Function
API route: `/api/bts-suggestions` (direct read/write, not via dashboard-data.js snapshot)

### bts-status.json Section
- `.suggestions` (array of submitted ideas)

### Notes
This tab uses a direct API call rather than the snapshot pattern. Suggestions can be submitted by both Adam and Sunny (via BTS client login).

---

## Tab 8: Traffic

### Dashboard Tab
`traffic` (tab 11 of 13 on `/bts-seo`)

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

### Reader Functions
- `buildCourseDetails()` → `snapshot.btsCourseDetails`
- `buildCourses()` → `snapshot.btsCourses`

### bts-status.json Sections
- `.seo.assets.trainingServices` (course inventory)
- `.blockers` (course-related issues)

### Key Fields
| Field | Type | Description |
|-------|------|-------------|
| `courses` | array | Course name, duration, price, page URL, status |
| `issues` | array | Course-related blockers (e.g. missing pages) |

---

## Phase 2 Migration

When Phase 2 is approved, these 10 tabs will migrate from bts-status.json to BTS-owned domain files:
- `seo-metrics.json` → SEO Health, Rankings, Coverage Matrix
- `competitors.json` → Competitors
- `courses.json` → Courses
- `news-bank.json` → News Bank
- `status.json` → Dashboard home (blockers, next actions)

See BTS `docs/dashboard-sections/future-seo-data.md` for the full migration plan.

Phase 2 is NOT approved. This documents the intended direction only.
