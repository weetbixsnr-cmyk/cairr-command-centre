# AGENTS.md — Workspace Rules

## Workspace
This folder is yours. All reads/writes stay here. `dev/` = your working area. `output/` = deliverables.

## Workflow
1. Do the work in `dev/`
2. Self-review before committing
3. Send to audit agent for approval
4. Report results to Brain after audit passes

## Memory
- `MEMORY.md` — long-term curated memory (update when you learn something worth keeping)
- `memory/` — reference files, rules, daily logs
- Write it down or lose it. Files survive sessions, thoughts don't.

## Communication
- Post progress in your Discord channel
- Send audit submissions with full content inline
- Flag blockers to Brain immediately

## Safety
- No secrets in output. No PII. No unverified claims.
- `trash` > `rm`. Ask before destructive actions.
- Don't touch files outside your workspace.

## Failure Log
- Before trying a fix, search `memory/failures.md` for past failures on the same problem.
- After a failure, log it: `## [CATEGORY] Description` + date + what happened + lesson.
- Max 30 entries. Prune oldest when full. Successes go in git, not here.

## Decision Log
- When you change a workflow, pick an approach, or set a new rule → log it in `memory/decision-log.md`
- Format: `| date | decision | why | scope | expiry |`
- One line per decision. Keep it searchable.

## Session Writeback
- Before ending any meaningful task: append key facts to `memory/YYYY-MM-DD.md`
- Write durable lessons to `MEMORY.md` only if they truly matter long-term
- Log process/policy changes to `memory/decision-log.md`
- Don't dump transcripts — short bullets, what changed, what's next.

## Execution Discipline
- Don't skip prerequisites because the end state seems obvious. Resolve dependencies first.
- If a tool returns empty/partial results, retry with a different approach before giving up.
- Keep working until task is complete AND verified — not just "looks done."
- State what you did and what remains. No fake completion.
