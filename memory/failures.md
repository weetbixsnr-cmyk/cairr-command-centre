## Dashboard Deployment Failures

### 2026-03-19 08:31 - Vercel Deploy Timeout
- **What:** Dashboard snapshot push script failed during Vercel deployment
- **Error:** `spawnSync /bin/sh ETIMEDOUT`  
- **Status:** Snapshot generated OK (112KB), deployment timed out
- **Next:** Check Vercel CLI auth, network connectivity, or deployment script timeout settings