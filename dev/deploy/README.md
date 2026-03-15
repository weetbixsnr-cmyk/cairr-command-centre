# Deployment Guide — Command Centre Dashboard

## Pre-requisites
1. Vercel account with project created
2. Vercel KV store created (free tier: 256MB, 30k req/day)
3. Credentials in Bitwarden → `OpenClaw/Dashboard`

## Vercel Environment Variables
Set these in Vercel project settings (or via `vercel env add`):

| Variable | Source | Notes |
|----------|--------|-------|
| `DASHBOARD_USER` | Bitwarden → Dashboard | Basic auth username |
| `DASHBOARD_PASS` | Bitwarden → Dashboard | Basic auth password |
| `DASHBOARD_SESSION_TOKEN` | Bitwarden → Dashboard | Session cookie value |
| `KV_REST_API_URL` | Vercel KV → REST API URL | Auto-set if KV linked to project |
| `KV_REST_API_TOKEN` | Vercel KV → REST API Token | Auto-set if KV linked to project |

## Deploy Steps

### 1. Set up Vercel KV
```bash
# In Vercel dashboard: Storage → Create → KV → Link to project
# This auto-sets KV_REST_API_URL and KV_REST_API_TOKEN
```

### 2. Set auth secrets
```bash
vercel env add DASHBOARD_USER        # from Bitwarden
vercel env add DASHBOARD_PASS        # from Bitwarden
vercel env add DASHBOARD_SESSION_TOKEN  # from Bitwarden
```

### 3. Copy dev pages to dashboard-secure
```bash
# After audit approval:
cp dev/pages/api/data.js dashboard-secure/pages/api/data.js
cp dev/pages/api/action.js dashboard-secure/pages/api/action.js
cp dev/pages/index.js dashboard-secure/pages/index.js
cp dev/pages/fleet.js dashboard-secure/pages/fleet.js
cp dev/pages/system.js dashboard-secure/pages/system.js
mkdir -p dashboard-secure/pages/agent
cp dev/pages/agent/\[name\].js dashboard-secure/pages/agent/\[name\].js
cp dev/deploy/vercel.json dashboard-secure/vercel.json
```

### 4. Deploy
```bash
cd dashboard-secure
vercel --prod
```

### 5. Set up Mac Mini cron for data push
```bash
# Add KV credentials to Mac Mini environment
export KV_REST_API_URL="..."   # from Vercel KV
export KV_REST_API_TOKEN="..." # from Vercel KV

# Test push
node dev/scripts/push-snapshot.js

# Add to OpenClaw cron (every 5 min)
# Brain sets this up via openclaw cron add
```

## Rollback
Vercel keeps all deployments. To rollback:
1. Go to Vercel dashboard → Deployments
2. Click the last working deployment → Promote to Production

## Architecture
See `dev/dashboard-architecture.md` for full data flow diagram.
