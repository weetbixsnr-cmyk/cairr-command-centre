---
from: Brain (Ricky-Jnr)
date: 2026-04-12
priority: HIGH — act on changes immediately, architectural issues need preventing
---

# Briefing from Brain — 12 Apr 2026 (Round 2: BTS SEO Dashboard Audit)

## What Changed

### 1. bts-seo.js — Dashboard cleanup
- **Default tab** changed from `seo-plan` to `health`
- **Removed** duplicate Content Published section from Coverage Matrix tab (was double-up with Publish Timeline in Google Safety)
- **Removed** duplicate Competitor Watch section from Competitors tab (was double-up with structured competitor cards)
- **Removed** dead framework tab code (~73 lines, had no TabButton so was unreachable)
- **SEO Plan tab** rebuilt: replaced SeoDashboard dump with compact layout (Content Pipeline capped at 20 lines + Weekly Audit Log at 15 lines)
- **Future Posts tab**: "Visual Check" renamed to "Ready to Sign Off" with green styling

### 2. gbp-posts.js — Ready to Sign Off support
- Added `visual-check-pending` status handling (was invisible before — component didn't know about this status)
- New "Ready to Sign Off" section with green styling + Sign Off button
- Summary strip updated to show Ready to Sign Off count

### 3. bts-draft-action.js — Discord notification fix
- Individual desktop/mobile check now sends Discord notification (blue embed)
- Previously only notified when BOTH were checked

### 4. data.js — CDN cache disabled
- Changed `Cache-Control` from `s-maxage=60, stale-while-revalidate=300` to `no-store, no-cache, must-revalidate`
- This was causing Vercel CDN to serve stale API responses even on new devices

### 5. SEO-DASHBOARD.md — Source data updated
- Fixes #5, #6, #12 marked DONE; #13 marked PARTIAL
- GBP count 3→6, header date updated, next audit date updated
- Fix priority section updated (5/15 fixed)
- Added 3 missing published GBP posts
- Appendix A: rewritten with baseline vs estimated scores
- Appendix D: all 12 schema statuses ❌→✅

### 6. bts-drafts.json — Correct draft statuses
- Cleared 18 stale signed-off items
- Rebuilt with 18 correct items:
  - 8 Batch 2 posts → `visual-check-pending` (published 11 Apr, Sunny hasn't signed off)
  - 3 GBP posts → `visual-check-pending` (published 1 Apr)
  - 4 Batch 3 drafts → `draft` (Reading, Oxford, ACS Initial, Plumbing Apprenticeship)
  - 3 GBP drafts → `draft` (Career Change, Skills Shortage, Stack Qualifications)

### 7. Full snapshot rebuilt via push-snapshot.js
- Previous manual snapshot patches only updated btsDrafts, leaving SEO sections stale
- Full rebuild now includes updated SEO-DASHBOARD.md data

## What You Need To Do

### A. Sync dev/ pages if they're stale
Your `dev/pages/` may not have the latest `bts-seo.js` or `gbp-posts.js`. Copy from `dashboard-secure/pages/` if needed.

### B. Verify snapshot freshness
After any data source change, always run `push-snapshot.js` — never manually patch snapshot.json.

### C. Verify all tabs render correctly
- Health tab: Plan Status + Critical Fixes + gauges
- SEO Plan: compact Content Pipeline + Audit Log
- Coverage Matrix: execution waves
- Future Posts: Ready to Sign Off (11) + Pending (4)
- GBP Posts: Ready to Sign Off (3) + Drafts (3)
