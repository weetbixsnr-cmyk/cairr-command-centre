# MEMORY.md — Command Centre Agent

## Role
Single pane of glass for Adam. Aggregate all agent activity into a live dashboard.
Now owns dashboard deploys end-to-end (exec: full, Vercel auth inherited from system).

## Agent Fleet (accurate as of 2026-03-19)
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
| raec | Opus 4.6 | RA Electrical quoting (CAIRR client) | ✅ enabled |

## Deploy Gate (2026-03-19)
- Git hooks on NBHW, CC, BTS repos — every commit auto-posts to #audit
- Audit agent reviews → deploys if PASS (only Audit runs `vercel --prod`)
- CC exec is allowlisted: git, npm, npx, node, cat, ls, find, grep, head, tail, wc, echo, mkdir, cp, mv, rm, chmod, curl, jq, python3, sed, awk, sort, uniq, diff, touch
- No `vercel` command available to CC

## Comms Rule (FRAMEWORK §8, 2026-03-19)
- All agent-to-agent work posts in TARGET channel first (visible to Adam)
- No invisible sessions_send without a channel post

## Budget Thresholds
- BTS: <$52/mo
- NBHW: <$30/mo
- Property: <$20/mo
- Command Centre: <$15/mo
- V3DN: uncapped (live money)

## Dashboard
- **App:** `dashboard-secure/` (Next.js 14, deployed to Vercel)
- **Deploy:** `node dev/scripts/push-snapshot.js` (generates snapshot + copies pages + deploys to Vercel)
- **Data:** Snapshot JSON at `dev/snapshots/latest.json` bundled into `public/snapshot.json` at deploy time
- **Architecture:** `push-snapshot.js` → git push `data/snapshot.json` → API fetches from GitHub raw (5-min cache, fallback to bundled file)
- **Old architecture (pre 2026-03-19):** Mac Mini cron → bundle snapshot into static build → vercel deploy (REMOVED — burned deploy quota)
- **Cron:** "Dashboard Snapshot Push" every 5m via Haiku (isolated session, light context, timeout 180s)
- **Auth:** Basic auth via middleware.js, creds in `.env.local` (NOT committed to git)
- **URL:** <https://dashboard-secure-one.vercel.app>
- **Pages:** Dashboard (scorecards), Fleet (office floor), System (pipeline flow), Ricky (Brain ops), NBHW SEO (via NBHW panel)
- **Snapshot size:** ~78KB (includes agent workspaces, Vercel projects, crons, CodexBar cost)
- **Status:** LIVE — Blob REMOVED 2026-03-17, deploy-time snapshots only.

## NBHW Publish Ledger (Google Safety)
- **Owner:** Command Centre (me) — NOT NBHW agent
- **File:** `dev/dashboard/nbhw-publish-ledger.json`
- **Purpose:** Track every page/blog first-publish timestamp to stay safe with Google
- **Limits:** 3 suburb pages/week, 1 blog/week
- **Rule:** When NBHW deploys a new page/blog, I must add an entry with the exact `firstPublished` timestamp
- **Snapshot key:** `nbhwPublishLedger` — includes computed stats (last7d, last30d, status, pagesRemaining)
- **Created:** 2026-03-19

## Key Facts
- All heartbeats currently DISABLED across fleet (by design — §12 FRAMEWORK.md)
- Don't access other agent workspaces — ask Brain for cross-agent data
- Adam = weetbix on Discord. Not a coder. Practical. One change at a time.
- Brain = Ricky-Jnr (named after Adam's son Ricky)
- FRAMEWORK.md is the law — dev-first workflow, audit gates, secrets to Bitwarden
- 2026-03-15: Brain fixed JSX nesting bug in Row 4/5/Reminders (was outside grid container)
- 2026-03-15: Exec upgraded from allowlist → full. CC now deploys its own dashboard.
- 2026-03-19: Exec DOWNGRADED back to allowlist. CC no longer deploys — Audit deploys on PASS.
- 2026-03-19: RAEC agent (RA Electrical) wired up — Opus 4.6, channel #raec, GitHub sparkquote-raec, Vercel sparkquote-raec
- 2026-03-19: Deploy gate operational — git hooks on NBHW/CC/BTS repos, Audit is only deployer

## What Has Worked
- Snapshot-bundled architecture (no KV dependency for basic viewing)
- deploy-prep.sh → vercel --prod workflow
- Deploy gate via Audit agent — commit → push → #audit review → Audit deploys (2026-03-19)
- Fleet page additions (RAEC card, deploy pipeline section) — clean first-time deploy through audit gate (2026-03-19)
- Data-driven agent cards — model/status auto-populated from snapshot, no hardcoding needed
- sessions_send to Audit for deploy requests — worked on first attempt (2026-03-19)
- Following existing JSX patterns for new components — zero build failures (2026-03-19)

- 2026-03-19: GitHub raw snapshot architecture approved — data decoupled from deploys. GITHUB_TOKEN needed on Vercel.
- 2026-03-19: Vercel rate limit hit 3x (100/day). 9 deploys + data refreshes burned quota. Architecture fix eliminates this.
- 2026-03-19: Always run `push-snapshot.js` before audit requests to ensure fresh data.

## What Has NOT Worked
- JSX placed outside grid container caused SWC build failure (2026-03-15)
- Vercel Blob store suspended (billing inactive) — removed entirely 2026-03-17
- Vercel KV approach abandoned — too complex
- Vercel CLI interactive prompts can't be automated — used vercel api instead
- Deploy-time bundled snapshots are simpler and more reliable than any live store — BUT burn deploy quota for data refreshes
- Vercel 100 deploy/day limit — hit 3x on 2026-03-19. Solution: GitHub raw serving for data, deploys only for UI
- CC exec allowlist is more restricted than documented — git, node, cp, echo, diff all denied despite being listed (2026-03-19). Only cat, ls, grep, wc, head, tail confirmed working. Can't build-test locally.
- Gateway draining during sessions_send — audit request lost, had to retry (2026-03-19)
- Model confusion (RAEC): Brain first said Sonnet 4, Adam said Opus, Brain corrected to Opus. Lesson: Brain's correction is authoritative, don't flip-flop on first message.
