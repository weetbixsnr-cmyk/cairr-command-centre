# Data Ownership — Command Centre

> Declares what Command Centre owns, what it imports, and who updates what.
> Last verified: 2026-05-25

## This Project Owns (Rendering + Dashboard-Local Data)

| File | Role | Notes |
|------|------|-------|
| `lib/dashboard-data.js` | Core data aggregation layer | Single entry point for all dashboard data |
| `pages/bts-seo.js` | BTS 13-tab dashboard | Renders all BTS tabs |
| `pages/nbhw-seo.js` | NBHW dashboard | Renders NBHW tabs |
| `pages/index.js` | Home dashboard | Project cards, blockers, action queue |
| `middleware.js` | Authentication | HTTP Basic Auth + session cookies |
| `public/data/bts-status.json` | BTS non-content data (temporary) | Feeds 10 BTS tabs + 3 write-path API routes |
| `public/data/nbhw-status.json` | NBHW status data (temporary) | Pending NBHW project-owned export |
| `public/data/dashboard-status.json` | Dashboard health | Action queue, de-agenting status |

## This Project Imports (From Other Projects)

| Source | File | Destination | Sync Method |
|--------|------|-------------|-------------|
| BTS repo | `content/content.json` | `public/data/bts/content.json` | Manual copy after every BTS content change |
| BTS repo | `seo/news-bank.json` | `public/data/bts/news-bank.json` | Manual copy after BTS news-bank updates |

## Temporary Ownership (Will Transfer in Phase 2)

`public/data/bts-status.json` is currently CC-owned because BTS has no project-side equivalent for SEO metrics, competitors, courses, etc. Completed Phase 2 slices:
- `bts/seo.json` — SEO health, keywords, rankings, audit, plan (Slice B, 2026-05-24)
- `bts/news-bank.json` — news story bank (2026-05-25)

Remaining Phase 2 candidates (not approved):
- `competitors.json`, `courses.json`, `status.json`

## Who Updates What

| Action | Who | How |
|--------|-----|-----|
| BTS content lifecycle changes | BTS session → manual copy to CC | Update BTS content.json, copy to CC |
| BTS SEO metrics, keywords, competitors | CC session (temporary) | Direct edit of bts-status.json |
| BTS drafts/suggestions via dashboard | Dashboard API routes | Write to bts-status.json automatically |
| NBHW status updates | CC session (temporary) | Direct edit of nbhw-status.json |
| Dashboard health/action queue | CC session | Direct edit of dashboard-status.json |
| Code changes | CC session | Edit, build, deploy via Vercel |

## Rules

- CC owns rendering logic and dashboard-local data files
- CC does NOT own BTS content truth — that belongs to BTS repo
- CC receives copies, never edits BTS originals
- Root orchestrator coordinates but never edits CC files
- Adam approves all production deployments
- No code or data changes without Adam's instruction
