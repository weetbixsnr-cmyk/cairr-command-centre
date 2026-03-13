# Dashboard Architecture

## Overview
The dashboard has two independent layers that never block each other:

1. **Site code** — the Next.js app (layout, cards, pages, styles)
2. **Live data** — agent health, reports, action queue, sessions

## How It Works

```
┌─────────────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Mac Mini (local)  │  push   │  Vercel KV   │  read   │  Vercel Site    │
│                     │ ──────► │  (data store) │ ──────► │  (Next.js app)  │
│  - pipeline-results │  every  │              │         │                 │
│  - action-queue.json│  5 min  │  Single JSON │         │  dashboard.     │
│  - openclaw status  │         │  snapshot    │         │  openclaw.ai    │
│  - fleet health     │         │              │         │  (password      │
│  - governance drift │         │              │         │   protected)    │
└─────────────────────┘         └──────────────┘         └─────────────────┘
```

## Data Flow

### Live Data (updates automatically, no deployment needed)
- **Source:** Mac Mini cron runs `dev/scripts/push-snapshot.sh` every 5 minutes
- **What it pushes:** One JSON object containing:
  - Fleet health (agent status, health %)
  - Governance drift (locked/unlocked)
  - Action queue (pending items, overdue flags)
  - Agent reports (latest + full reports)
  - Session data (context %, tokens, models, heartbeat status)
  - Infrastructure status (gateway, channels)
  - Token spend report
- **Destination:** Vercel KV (free tier, built into Vercel project)
- **API routes read from KV** instead of local files

### Site Code (changes rarely, goes through dev → deploy)
- Changes built in `dev/` first
- Self-review → audit agent → Adam approval
- Deploy to Vercel via `vercel --prod` or git push
- If broken: one-click rollback on Vercel dashboard
- Old version stays live until new one is explicitly deployed

## Components

### Mac Mini Side
| Component | Location | Purpose |
|-----------|----------|---------|
| `dev/scripts/push-snapshot.sh` | workspace | Bundles all data into JSON, pushes to KV |
| OpenClaw cron | cron config | Runs push-snapshot every 5 min |
| Pipeline scripts | existing | Write to dev/pipeline-results/ (unchanged) |

### Vercel Side
| Component | Location | Purpose |
|-----------|----------|---------|
| `pages/index.js` | dashboard-secure | Main dashboard |
| `pages/fleet.js` | dashboard-secure | Office floor view |
| `pages/agent/[name].js` | dashboard-secure | Agent drill-down |
| `pages/api/data.js` | dashboard-secure | Single API route — reads from KV |
| `middleware.js` | dashboard-secure | Auth (HTTP Basic + session cookie) |

### Data Store
- **Vercel KV** (Redis-based, free tier: 256MB, 30k requests/day)
- Single key: `dashboard:snapshot`
- Updated every 5 min by Mac Mini cron
- Read by API route on each page load + 30s auto-refresh

## Auth
- HTTP Basic auth via middleware.js (existing, works)
- Credentials in Bitwarden → OpenClaw/Dashboard (never hardcoded)
- Session cookie: 7-day expiry, httpOnly, secure
- API routes behind same auth middleware

## Environments
| Environment | URL | Purpose |
|-------------|-----|---------|
| Local dev | localhost:3333 | Testing code changes before deploy |
| Production | dashboard.openclaw.ai (TBD) | Live site, always-on |

## Key Principles
- Data updates are **independent** of code deployments
- Code changes are **rare** and go through dev → audit → deploy
- If site code breaks: **rollback on Vercel** (one click, instant)
- If data stops updating: **Mac Mini cron issue** — site still works, just shows stale timestamp
- Dashboard always shows **when data was last updated** so staleness is visible

## What's Needed to Set Up
1. Create Vercel KV store (via Vercel dashboard or CLI)
2. Write `push-snapshot.sh` script
3. Set up OpenClaw cron to run it every 5 min
4. Refactor API routes to read from KV instead of local files
5. Deploy to Vercel
6. Set up custom domain (optional)
