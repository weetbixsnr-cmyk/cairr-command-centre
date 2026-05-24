# Protected Files — Command Centre

> Files that must NOT be edited from outside this project's session.
> Last verified: 2026-05-24

## Core Data Files

| File | Reason |
|------|--------|
| `public/data/bts/content.json` | Imported from BTS repo; only update via BTS copy procedure |
| `public/data/bts-status.json` | Live backing store for 10 BTS tabs + 3 write-path API routes |
| `public/data/nbhw-status.json` | Live backing store for NBHW dashboard + 4 API routes |
| `public/data/dashboard-status.json` | Live backing store for action queue + system diagnostics |

## Core Code Files

| File | Reason |
|------|--------|
| `lib/dashboard-data.js` | Core data aggregation; all pages depend on it |
| `middleware.js` | Authentication; breaking this exposes the dashboard |
| `CLAUDE.md` | Project governance; data ownership and workflow rules |

## External/Protected (Not In This Repo)

| Item | Reason |
|------|--------|
| Vercel deployment | Auto-deploys from GitHub push; Adam approves |
| GitHub repository | `cairr-command-centre`; do not force-push |
| Environment variables (Vercel) | 9 auth/config vars; do not expose in code |

## Rules

- Only CC session or Adam edits CC files
- BTS content.json updates come via copy from BTS repo — never edit the CC copy directly
- Root orchestrator may read for audits but never edit
- Do not push to GitHub without Adam's approval
- Do not modify Vercel configuration without Adam's approval
