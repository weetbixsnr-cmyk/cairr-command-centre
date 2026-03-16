# Decision Log
One line per workflow/process/policy decision. Searchable reference for "why did we do this?"

| Date | Decision | Why | Scope | Expiry |
|------|----------|-----|-------|--------|
<!-- entries below -->
| 2026-03-12 | Named self "Overwatch" | Fits NOC operator role, sharp/terse | identity | – |
| 2026-03-12 | Dashboard plan: API routes → live data → overdue detection | Approved approach from onboarding brief | dashboard | – |
| 2026-03-13 | All new work goes in dev/ first, never direct to dashboard-secure/ | Brain correction — broke workflow | all | permanent |
| 2026-03-13 | ONE change at a time, show Adam, wait for approval | Brain correction — batched 8 files without approval | all | permanent |
| 2026-03-13 | Dashboard arch: Mac Mini pushes JSON snapshot → Vercel KV → Vercel site reads | Adam wants access from multiple computers, needs password-gated Vercel site | dashboard | permanent |
| 2026-03-15 | I own dashboard deploy end-to-end (build, test, deploy) | Adam's decision — wants me to control it all, no waiting on Brain | dashboard | permanent |
| 2026-03-15 | Vercel Blob replaces KV for live data | Simpler than Redis, no extra service, free tier sufficient | dashboard | permanent |
| 2026-03-15 | Cron pushes snapshot every 5 min via Haiku (light context) | Keeps data fresh without full agent spin-up | dashboard | permanent |
| 2026-03-15 | Removed Quick Status / Key Dates / Reminders sections | Adam flagged as duplicates of action queue + scorecards | dashboard | permanent |
| 2026-03-16 | Source of truth for pages is dev/pages/ — NEVER edit dashboard-secure/pages/ directly | deploy-prep copies dev/ → dashboard-secure/, direct edits get overwritten | all | permanent |
