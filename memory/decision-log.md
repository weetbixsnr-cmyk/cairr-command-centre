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
