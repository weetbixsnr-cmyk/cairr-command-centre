# MEMORY.md — Command Centre Agent

## Role
Single pane of glass for Adam. Aggregate all agent activity into a live dashboard.
Owns dashboard deploys end-to-end (exec allowlisted, Vercel auth inherited).

## Agent Fleet (as of 2026-03-19)
| Agent | Model | Status |
|-------|-------|--------|
| bts | Opus 4.6 | ✅ |
| nbhw | Opus 4.6 | ✅ |
| command-centre | Opus 4.6 | ✅ |
| audit | Sonnet 4 | ✅ |
| raec | Opus 4.6 | ✅ |
| v3dn | Opus 4.6 | ❌ |
| property | Sonnet 4 | ❌ |
| gridpilot | Opus 4.6 | ❌ |
| alpha | Sonnet 4 | ❌ |
| overdue-office | Sonnet 4 | ❌ |

## Deploy Gate
- Git hooks on NBHW, CC, BTS repos — commits auto-post to #audit
- Only Audit runs `vercel --prod`. CC has no vercel command.
- All agent-to-agent work posts in TARGET channel first (visible to Adam)

## Dashboard
- **App:** `dashboard-secure/` (Next.js 14, Vercel)
- **Deploy:** `node dev/scripts/push-snapshot.js` → git push snapshot → API fetches from GitHub raw
- **Cron:** Snapshot push every 5m (Haiku, isolated session)
- **Auth:** Basic auth via middleware.js, creds in `.env.local`
- **URL:** <https://dashboard-secure-one.vercel.app>
- **Pages:** Dashboard, Fleet, System, Ricky, NBHW SEO

## NBHW Publish Ledger
- **File:** `dev/dashboard/nbhw-publish-ledger.json`
- **Limits:** 3 suburb pages/week, 1 blog/week
- When NBHW deploys new page/blog → add entry with firstPublished timestamp

## Key Facts
- All heartbeats currently DISABLED across fleet
- Adam = weetbix on Discord. Not a coder. One change at a time.
- FRAMEWORK.md is the law

## Lessons
- Snapshot-bundled architecture works (no KV dependency)
- Vercel 100 deploy/day limit — hit 3x. GitHub raw serving for data, deploys only for UI
- CC exec allowlist restricted: git/node/cp/echo/diff denied. Only cat/ls/grep/wc/head/tail confirmed
- Gateway draining can lose sessions_send — retry if needed
- JSX outside grid container = SWC build failure
- Vercel Blob/KV abandoned — too complex
- Always run push-snapshot.js before audit requests for fresh data
