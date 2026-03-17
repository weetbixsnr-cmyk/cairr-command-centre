## [DEPLOY] Vercel deployment failure
**Date:** 2026-03-18 00:04 AEDT
**What happened:** Dashboard snapshot generated successfully (91KB) but Vercel deploy failed with "Command failed: npx vercel --prod --yes 2>&1"
**Context:** Cron job d1a8036e-d3d5-4358-94a4-2e280d923107 - routine dashboard push
**Lesson:** Snapshot generation is working, deployment pipeline needs investigation
**Status:** Snapshot ready but not deployed to live dashboard
