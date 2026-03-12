# Failure Log
Max 30 entries. Delete oldest when full. Log FAILURES only — successes are in git.
Format: `## [CATEGORY] Short description` + date + what happened + 1-line lesson.
Categories: [SEO] [ENGINE] [EMAIL] [TRADING] [DASHBOARD] [DEPLOY] [API] [AUTH] [CONFIG] [DATA]

<!-- entries below -->
## [DASHBOARD] Built directly in production, skipped audit, batched 8 files
**Date:** 2026-03-13
**What happened:** Built 8 files directly into dashboard-secure/pages/ instead of dev/ first. Didn't send to audit. Shipped multiple changes without showing Adam each one.
**Lesson:** dev/ first → self-review → audit → production. ONE change at a time. Never skip the chain.
