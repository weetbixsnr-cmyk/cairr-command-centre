# MEMORY.md — Command Centre Agent

## Role
Single pane of glass for Adam. Aggregate all agent activity into a live dashboard.

## Agent Fleet
| Agent | Model | Domain | Heartbeat |
|-------|-------|--------|-----------|
| bts | Sonnet 4 | BTS SEO/content | Mon-Fri daily |
| nbhw | Sonnet 4 | NBHW website/SEO | Daily |
| v3dn | Opus 4 | Trading analysis | Every 4hrs |
| property | Kimi K2.5 | Property scanning | Daily 7am |
| gridpilot | Sonnet 4 | Energy platform R&D | Weekly |
| alpha | Sonnet 4 | Property dashboard | Weekly |

## Budget Thresholds
- BTS: <$52/mo
- NBHW: <$30/mo
- Property: <$20/mo
- Command Centre: <$15/mo
- V3DN: uncapped (live money)

## Dashboard Location
- output/dashboard.md (text version)
- output/dashboard.html (visual version)

## Key Facts
- Dashboard app: dashboard-secure/ (Next.js 14, port 3333, auth via middleware.js)
- Dashboard is 100% hardcoded from 27 Feb — needs live data wiring
- Data sources: dev/pipeline-results/*.md, dev/dashboard/action-queue.json, openclaw status
- All heartbeats currently DISABLED across fleet
- Don't access other agent workspaces — ask Brain for cross-agent data
- Adam = weetbix on Discord. Not a coder. Practical. One change at a time.
- Brain = Ricky-Jnr (named after Adam's son Ricky)

## What Has Worked
- (Update as patterns emerge)

## What Has NOT Worked
- (Log dashboard failures, missed alerts)
