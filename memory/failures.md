# Failure Log
Max 30 entries. Delete oldest when full. Log FAILURES only.
Format: `## [CATEGORY] Short description` + date + what happened + 1-line lesson.

<!-- entries below -->

## [INFRA] Blob store suspended — 99+ consecutive cron failures over 23 hours
2026-03-16 to 2026-03-17 | Vercel Blob store hit `store_suspended`. Snapshot push cron (every 5min) kept hammering dead endpoint. 99+ identical failures logged, 1119 lines of duplicate entries, ~800K Haiku tokens burned. Brain didn't catch it for 23 hours. Cron disabled by Brain 2026-03-17 17:31 AEST. Lesson: Crons MUST have consecutive-failure circuit breakers. If same error 3x in a row → auto-disable and alert Brain.
