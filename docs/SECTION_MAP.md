# Section Map — Command Centre

> Every logical section inside the Command Centre, its key files, and update frequency.
> Last verified: 2026-05-24

## Sections

| Section | Purpose | Key Files | Update Frequency | Owner |
|---------|---------|-----------|-----------------|-------|
| Data Layer | Aggregates all project data into dashboard snapshot | `lib/dashboard-data.js` | On code change | CC session |
| BTS Content Data | Imported BTS content lifecycle (38 items) | `public/data/bts/content.json` | On BTS publish (manual copy from BTS repo) | BTS (source), CC (copy) |
| BTS Status Data | BTS SEO, keywords, competitors, courses, news, suggestions | `public/data/bts-status.json` | Manual update | CC session (temporary owner) |
| NBHW Status Data | NBHW SEO, keywords, suburbs, competitors | `public/data/nbhw-status.json` | Manual update | CC session (temporary, pending NBHW audit) |
| Dashboard Health | De-agenting status, action queue | `public/data/dashboard-status.json` | Manual update | CC session |
| BTS Dashboard | 13-tab BTS SEO command page | `pages/bts-seo.js` | On code change | CC session |
| NBHW Dashboard | NBHW SEO command page | `pages/nbhw-seo.js` | On code change | CC session |
| Home Dashboard | Project cards, blockers, action queue | `pages/index.js` | On code change | CC session |
| Auth | HTTP Basic Auth + BTS client login | `middleware.js`, `pages/api/bts-auth.js` | On credential change | CC session |
| API Routes | 20 routes (12 active, 5 parked, 3 utility) | `pages/api/` | On code change | CC session |
| Components | Reusable dashboard components | `pages/components/` | On code change | CC session |

## Data Files Consumed (Imported From Other Projects)

| Source Project | Source File | CC Destination | Sync Method | Current Status |
|----------------|------------|----------------|-------------|----------------|
| BTS | `content/content.json` | `public/data/bts/content.json` | Manual copy | Working (Phase 1) |

## Data Files Owned (Dashboard-Local)

| File | Purpose | Size | Status |
|------|---------|------|--------|
| `public/data/bts-status.json` | BTS non-content dashboard data | 174 KB | Active (temporary CC-owned, feeds 10 tabs + 3 write-path API routes) |
| `public/data/nbhw-status.json` | NBHW project status | 3.3 KB | Active (pending NBHW audit) |
| `public/data/dashboard-status.json` | Dashboard health + action queue | 1.5 KB | Active |

## Orphaned Files (Candidates for Deprecation)

| File | Status | Notes |
|------|--------|-------|
| `public/bts-drafts.json` | Candidate for deprecation pending Adam approval | Zero code references |
| `public/snapshot.json` | Candidate for deprecation pending Adam approval | Explicitly not read by /api/data |
| `public/dashboard.html` | Historical reference | Design lock reference; no code reads it |

## API Route Summary

- **12 active:** data, bts-auth, bts-drafts, bts-draft-action, bts-suggestions, nbhw-drafts, nbhw-draft-action, nbhw-gbp-action, nbhw-suggestions, action-queue, action, system
- **5 parked (410):** agents, crons, fleet-health, governance, sessions
- **3 utility:** robots, sitemap, llms
