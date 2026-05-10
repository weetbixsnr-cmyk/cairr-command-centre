# Dashboard De-Agenting Audit

Date: 2026-05-10
Scope: `/Users/cairr/AI/CAIRR/internal/command-centre`

## Starting Dirty State

Initial `git status --short`:

```text
 M public/snapshot.json
?? DE_AGENTING_PLAN.md
?? pages.bak/
```

Current branch: `main`

Remote:

```text
origin https://github.com/weetbixsnr-cmyk/cairr-command-centre.git
```

Active hook: `.git/hooks/pre-commit`, disabled for de-agenting and pointing at the 2026-05-10 backup.

Backup manifest verified:

```text
/Users/cairr/AI/CAIRR/backups/de-agenting-2026-05-10/MANIFEST.md
```

The manifest explicitly covers this dashboard's dirty/untracked state.

## Page Classification

| Surface | Classification | Decision |
| --- | --- | --- |
| `pages/index.js` | keep-but-rewire | Rewired from agent fleet cards to project status cards backed by `public/data/*.json`. |
| `pages/bts-seo.js` | keep-but-rewire | Kept existing page; `/api/data` now supplies manual BTS status fields. |
| `pages/nbhw-seo.js` | keep-but-rewire | Kept existing page; `/api/data` now supplies manual NBHW status fields. |
| `pages/cairr-finance.js` | archive-later | Still accessible, not part of de-agenting data contract. |
| `pages/fleet.js` | agent-era-remove-later | Unlinked from main nav; backing API now returns parked fleet data. |
| `pages/fleet-old.js` | archive-later | Legacy fleet surface. Leave for a later cleanup pass. |
| `pages/system.js` | keep-but-rewire | Rewritten as de-agented data model/status page, not agent pipeline page. |
| `pages/ricky.js` | archive-later | Unlinked from main nav; still legacy/diagnostic. |
| `pages/agent/[name].js` | agent-era-remove-later | Route remains for compatibility; `/api/data?agent=` now returns parked/410 response. |
| `pages/bts-login.js` | keep-active | BTS client auth surface retained. |
| `pages/components/seo-dashboard.js` | keep-active | Shared display component. |
| `pages/components/gbp-posts.js` | keep-active | Shared display/action component. |
| `pages.bak/` | archive-later | Existing untracked backup. Preserved untouched. |

## API Route Classification

| Surface | Classification | Decision |
| --- | --- | --- |
| `pages/api/data.js` | keep-but-rewire | Now aggregates `public/data/*.json`; no remote agent snapshot or `public/snapshot.json` fallback. |
| `pages/api/action.js` | keep-but-rewire | Now updates `public/data/dashboard-status.json`. |
| `pages/api/action-queue.js` | keep-but-rewire | Now reads `public/data/dashboard-status.json`. |
| `pages/api/bts-drafts.js` | keep-but-rewire | Now reads/writes `public/data/bts-status.json`. |
| `pages/api/bts-draft-action.js` | keep-but-rewire | Now updates `public/data/bts-status.json`; Discord notification remains optional. |
| `pages/api/bts-suggestions.js` | keep-but-rewire | Now reads/writes `public/data/bts-status.json`; Discord notification remains optional. |
| `pages/api/nbhw-drafts.js` | keep-but-rewire | Now reads/writes `public/data/nbhw-status.json`. |
| `pages/api/nbhw-draft-action.js` | keep-but-rewire | Now updates `public/data/nbhw-status.json`. |
| `pages/api/nbhw-suggestions.js` | keep-but-rewire | Now reads/writes `public/data/nbhw-status.json`. |
| `pages/api/nbhw-gbp-action.js` | keep-but-rewire | Now updates `public/data/nbhw-status.json`. |
| `pages/api/system.js` | parked | No OpenClaw CLI; returns dashboard-local status. |
| `pages/api/sessions.js` | parked | No OpenClaw CLI; returns 410 parked response. |
| `pages/api/crons.js` | parked | No OpenClaw CLI; returns 410 parked response. |
| `pages/api/fleet-health.js` | parked | No pipeline file read; returns 410 parked response. |
| `pages/api/governance.js` | parked | No pipeline file read; returns 410 parked response. |
| `pages/api/agents.js` | parked | No pipeline file read; returns 410 parked response. |
| `pages/api/bts-auth.js` | keep-active | Auth only. |
| `pages/api/robots.js` | keep-active | Static SEO/privacy route. |
| `pages/api/sitemap.js` | keep-active | Static route. |
| `pages/api/llms.js` | keep-active | Static route. |

## Removed Active Reads

| Source | Previous active reader | Current state |
| --- | --- | --- |
| `/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/nbhw-drafts.json` | `nbhw-drafts`, `nbhw-draft-action` | Rewired to `public/data/nbhw-status.json`. |
| `/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/nbhw-gmb-posts.json` | `nbhw-gbp-action` | Rewired to `public/data/nbhw-status.json`. |
| remote `agent/command-centre/data/snapshot.json` | `/api/data` | Removed. |
| remote `agent/command-centre/data/bts-*.json` | BTS draft/suggestion APIs | Rewired to `public/data/bts-status.json`. |
| remote `agent/command-centre/data/nbhw-suggestions.json` | NBHW suggestions API | Rewired to `public/data/nbhw-status.json`. |
| `public/snapshot.json` | `/api/data`, `/api/action` fallback | Removed from active reads. File remains legacy dirty state. |
| `openclaw status` | `/api/system`, `/api/sessions`, `/api/crons` | Parked. No CLI calls. |
| `openclaw cron list` | `/api/crons` | Parked. No CLI calls. |
| `../dev/pipeline-results/*.md` | fleet/governance/agents/system APIs | Parked. No parent workspace reads. |
| `../dev/dashboard/action-queue.json` | action/action-queue APIs | Rewired to `public/data/dashboard-status.json`. |

## New Manual Data Contract

Minimum files now present:

```text
public/data/bts-status.json
public/data/nbhw-status.json
public/data/dashboard-status.json
```

These files are manual first. Hooks are intentionally not wired.

Expected top-level fields:

```text
id
name
label
href
status
statusLabel
lastUpdated
source
summary
metrics[]
blockers[]
nextActions[]
```

Project pages may also read compatibility fields under:

```text
bts-status.json: seo, keywords, seoPlan, blogInventory, competitors, courseDetails, suggestions, notifications, drafts
nbhw-status.json: seo, keywords, publishLedger, publishLog, live, competitors, suggestions, gbpPosts, drafts
dashboard-status.json: actionQueue
```

## Design Lock Decision

The old design lock does not apply as an active constitutional rule because it points to the agent-era HTML workflow at `/Users/cairr/.openclaw/workspace/dashboard.html`.

Local historical reference:

```text
public/dashboard.html
```

That file is a reference only, not an active golden master. A new design lock should be approved before any styling or layout work.

## Verification

`npm run build` passed after rewiring.

Local dev verification was run at `http://127.0.0.1:3000`:

- `/api/data` returns `dataSource.mode = manual-status-json`, `agentSnapshot = false`, and `openclawCli = false`.
- `/api/data?agent=bts` returns a parked 410 response.
- `/` renders BTS, NBHW, and Dashboard project cards from `public/data/*.json`, including BTS baseline tag `bts-de-agenting-baseline-2026-05-10`.
- `/bts-seo` renders BTS manual SEO values including health `35`, `5/17` location coverage, and `first aid training berkshire`.
- `/nbhw-seo` renders NBHW manual SEO values including health `58`, `21/37` coverage, and `hot water repair northern beaches`.

`public/snapshot.json` remains a pre-existing modified legacy file and is not an active read source.
