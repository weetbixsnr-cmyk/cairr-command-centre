# FRAMEWORK.md — Global Operating Framework
_Owner: Brain (Ricky-Jnr) | Enforced across all agents | v1.1 — 14 Mar 2026_

## Purpose
This is the single source of truth for how every agent operates. Brain enforces it. Agents follow it. No exceptions.

## 1. Isolated Lanes
Every agent works in **their own branch** on their project's GitHub repo.
- Branch name: `agent/<agent-name>` (e.g. `agent/command-centre`, `agent/nbhw`)
- Agents NEVER push to `main`, `staging`, or `live`
- Brain reviews agent branches → merges to `main` after audit
- `main` = reviewed code. Agent branches = work in progress.

## 2. Decision Logging
Every agent maintains `memory/decision-log.md` in their workspace.
```
| Date | Decision | Why | Scope | Expiry |
```
- Log every workflow/process/policy change. One line per decision, searchable.
- Brain cross-references all agent logs.

## 3. Failure Logging
Every agent maintains `memory/failures.md` in their workspace.
- Max 30 entries, delete oldest when full
- Format: `## [CATEGORY] Short description` + date + what happened + lesson
- Categories: `[SEO] [ENGINE] [EMAIL] [TRADING] [DASHBOARD] [DEPLOY] [API] [AUTH] [CONFIG] [DATA] [OPS]`
- Search YOUR failures first before trying something new. Brain cross-references.

## 4. Session Writeback + Git Commit
Before ending any task, agents MUST save key context to their workspace:
- Decisions → `memory/decision-log.md` | Failures → `memory/failures.md` | Progress → daily note
- Context dies on compaction. Files survive. Write it down.
- **Git commit after EVERY completed task.** Not end of session — after EACH piece of work. Push to your agent branch immediately. No uncommitted work sitting around.

## 5. Dev-First Workflow
```
dev/ → self-review → audit → staging/ → Brain review → Adam approves → live/
```
- NEVER build directly in production directories
- ONE change at a time → show Adam → wait for response

## 6. Audit Gate
Protected branches (`main`, `staging`, `live`) require audit approval before push.
- `audit-gate-hook.sh` blocks unauthorized pushes. No shortcutting the gate. Ever.

## 7. File Hygiene
- SOUL.md and RULES.md are read-only (chmod 444). staging/ and live/ (chmod 555) — only Brain deploys.
- File size limits enforced (SOUL 60, MEMORY 80, HEARTBEAT 20 lines). Hit limit → overflow to `memory/archive/` or `memory/reference-*.md`.
- No orphan files. Every file referenced by at least one other.

## 8. Communication
- Agents post to their own Discord channel only. Brain relays between agents.
- Failures worth sharing → Brain pulls from one agent's log to another.

## 9. Agent Boundaries
- Agents work in THEIR workspace only.
- Need info from another agent? Ask Brain. Need a credential? Bitwarden via Brain. Need a config change? Request through Brain.

## 10. Secrets & Credentials — CONSTITUTIONAL
**Every secret goes to Bitwarden. No exceptions. No "I'll add it later."**
- Workspace files NEVER contain real secrets. `.env` files contain Bitwarden item names, not values (chmod 400).
- Agents NEVER access Bitwarden directly — request through Brain.
- Full vault structure + access rules → `memory/reference-tools.md`

## 11. Lenses — Highest Authority Review
**"Who is the #1 authority in the world for THIS specific task — and what would THEY say?"**
- Every task picks its own lens authority. Not a generic reviewer — the best person alive for that exact thing.
- Lens runs at end of task. Two outputs: (1) what the authority would change about the deliverable, (2) how they'd improve the process that created it. Scoped to THAT task only.
- Agents define their own lens authorities per task. Examples → `memory/reference-agents.md`

## 12. Change Discipline — CONSTITUTIONAL
Before ANY ops/auth/config change, Brain MUST:
1. **Read `memory/failures.md`** + **`memory/ops/lessons-learned.md`** — known landmines?
2. **Run `sessions_history`** on last active main session — what did previous me set up?
3. **State the change, the reason, and what could break** — before touching anything.
4. **Use the script.** Auth → `auth-update.sh`. Config → `config-safe-write.sh`. No manual edits.
5. **ONE change, ONE restart.** Never chain restarts.
6. **Verify after.** Run health check. Post-restart: wait 30s, confirm gateway alive, check `gateway.err.log` for crash loops. Don't end session until verified.
7. **Before creating anything new:** check if something already handles it, find where it bolts in, check for orphans, justify.

## 13. Onboarding
Onboarding checklist + details → `memory/reference-agents.md`
