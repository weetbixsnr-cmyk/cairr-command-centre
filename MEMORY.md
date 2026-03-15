# MEMORY.md — Command Centre Agent

## Role
Single pane of glass for Adam. Aggregate all agent activity into a live dashboard.
Now owns dashboard deploys end-to-end (exec: full, Vercel auth inherited from system).

## Agent Fleet (accurate as of 2026-03-15)
| Agent | Model | Domain | Status |
|-------|-------|--------|--------|
| bts | Opus 4.6 | BTS SEO/content | ✅ enabled |
| nbhw | Opus 4.6 | NBHW website/SEO/email | ✅ enabled |
| v3dn | Opus 4.6 | Trading analysis | ❌ disabled |
| property | Sonnet 4 | Property scanning | ❌ disabled |
| command-centre | Opus 4.6 | Dashboard/monitoring | ✅ enabled |
| gridpilot | Opus 4.6 | Energy platform R&D | ❌ disabled |
| alpha | Sonnet 4 | Property dashboard | ❌ disabled |
| overdue-office | Sonnet 4 | Overdue Office website | ❌ disabled |
| audit | Sonnet 4 | Quality gate | ✅ enabled |
| nbhw-accounts | Sonnet 4 | NBHW invoicing | ❌ disabled |

## Budget Thresholds
- BTS: <$52/mo
- NBHW: <$30/mo
- Property: <$20/mo
- Command Centre: <$15/mo
- V3DN: uncapped (live money)

## Dashboard
- **App:** `dashboard-secure/` (Next.js 14, deployed to Vercel)
- **Deploy:** `bash dev/scripts/deploy-prep.sh` then `cd dashboard-secure && npx vercel --prod`
- **Data:** Snapshot JSON at `dev/snapshots/latest.json` + pushed to Vercel Blob every 5 min
- **Architecture:** Mac Mini cron → `push-snapshot.js` → Vercel Blob → API route reads Blob → site shows live data
- **Blob Store:** `dashboard-final` (store_53Nq4Uvhd3nTkg2q) — linked to dashboard-secure project
- **Cron:** "Dashboard Snapshot Push" every 5m via Haiku (isolated session, light context)
- **Auth:** Basic auth via middleware.js, creds in `.env.local` (NOT committed to git)
- **URL:** <https://dashboard-secure-one.vercel.app>
- **Status:** LIVE — confirmed working 2026-03-15. No longer shows bundled/stale data.

## Key Facts
- All heartbeats currently DISABLED across fleet (by design — §12 FRAMEWORK.md)
- Don't access other agent workspaces — ask Brain for cross-agent data
- Adam = weetbix on Discord. Not a coder. Practical. One change at a time.
- Brain = Ricky-Jnr (named after Adam's son Ricky)
- FRAMEWORK.md is the law — dev-first workflow, audit gates, secrets to Bitwarden
- 2026-03-15: Brain fixed JSX nesting bug in Row 4/5/Reminders (was outside grid container)
- 2026-03-15: Exec upgraded from allowlist → full. CC now deploys its own dashboard.

## What Has Worked
- Snapshot-bundled architecture (no KV dependency for basic viewing)
- deploy-prep.sh → vercel --prod workflow

## What Has NOT Worked
- JSX placed outside grid container caused SWC build failure (2026-03-15)
- Dynamic import of @vercel/blob failed silently on Vercel — had to use static import + explicit token param
- Vercel KV approach abandoned — Blob storage simpler, no Redis needed
- Vercel CLI interactive prompts (blob store add) can't be automated easily — used vercel api instead
