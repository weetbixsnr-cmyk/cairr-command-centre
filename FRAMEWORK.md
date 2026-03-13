# FRAMEWORK.md — Global Operating Framework
_Owner: Brain (Ricky-Jnr) | Enforced across all agents | v1.0 — 13 Mar 2026_

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
- Log every workflow/process/policy change
- One line per decision, searchable
- Brain cross-references all agent logs

## 3. Failure Logging
Every agent maintains `memory/failures.md` in their workspace.
- Max 30 entries, delete oldest when full
- Format: `## [CATEGORY] Short description` + date + what happened + lesson
- Categories: `[SEO] [ENGINE] [EMAIL] [TRADING] [DASHBOARD] [DEPLOY] [API] [AUTH] [CONFIG] [DATA] [OPS]`
- Search YOUR failures first before trying something new
- Brain is the cross-reference layer across all agents

## 4. Session Writeback
Before ending any task, agents MUST save key context to their workspace:
- Decisions → `memory/decision-log.md`
- Failures → `memory/failures.md`
- Progress → relevant task file or daily note
- Context dies on compaction. Files survive. Write it down.

## 5. Dev-First Workflow
All new work goes through the pipeline:
```
dev/ → self-review → audit → staging/ → Brain review → Adam approves → live/
```
- NEVER build directly in production directories
- ONE change at a time → show Adam → wait for response
- No batching 8 files. Ship one, get approval, ship next.

## 6. Audit Gate
Protected branches (`main`, `staging`, `live`) require audit approval before push.
- `audit-gate-hook.sh` blocks unauthorized pushes
- Approval files live in `output/audit-approvals/`
- No shortcutting the gate. Ever.

## 7. File Hygiene
- SOUL.md and RULES.md are read-only (chmod 444)
- staging/ and live/ are read-only (chmod 555) — only Brain deploys
- File size limits enforced (SOUL 60, MEMORY 80, HEARTBEAT 20 lines)
- Hit the limit → overflow to `memory/archive/` or `memory/reference-*.md`
- No orphan files. Every file referenced by at least one other.

## 8. Communication
- Agents post to their own Discord channel only
- Brain is the relay between agents — agents don't talk to each other
- Failures worth sharing → Brain pulls from one agent's log to another
- No WhatsApp automation alerts

## 9. Agent Boundaries
- Agents work in THEIR workspace only
- Need info from another agent? Ask Brain.
- Need a credential? Bitwarden via Brain.
- Need a config change? Request through Brain.

## 10. Secrets & Credentials — CONSTITUTIONAL
**Every secret goes to Bitwarden. No exceptions. No "I'll add it later."**

### Rules
- ALL API keys, tokens, passwords, client secrets → Bitwarden vault immediately
- Workspace files NEVER contain real secrets — use `bw get password <name>` or env vars that reference Bitwarden
- `.env` files contain Bitwarden item names/IDs, not actual values. Lock to `chmod 400` after writing.
- Deploy docs, READMEs, onboarding briefs say "see Bitwarden" — never include actual credentials
- New service/integration? First action = store creds in Bitwarden. Second action = use them.
- Rotating a key? Update Bitwarden FIRST, then update the service.

### Vault Structure (OpenClaw account)
```
OpenClaw/
├── AI Providers/      # Anthropic, OpenAI, OpenRouter, etc.
├── Discord Bots/      # Bot tokens, app IDs
├── Integrations/      # GitHub PATs, Google Workspace, Xero, etc.
├── Crypto/            # Exchange APIs, wallet-related
├── Dashboard/         # Dashboard auth, ports, keys
└── Infrastructure/    # Server creds, DNS, domain logins
```

### Access
- Brain retrieves secrets via `bw` CLI when agents need them
- Agents NEVER store or access Bitwarden directly — they request through Brain
- Adam has a SEPARATE personal Bitwarden account for non-business credentials
- If a credential is needed in both places, Brain provides it explicitly

### Heartbeat Integration
- Heartbeat checks should flag any secrets found in workspace files (plaintext key patterns)
- New agent onboarding: verify zero hardcoded secrets before going live

## 11. Lenses — Highest Authority Review
A lens is task-specific. Every task has a different subject matter. The lens asks:
**"Who is the highest authority in the world for THIS specific task — and what would THEY say?"**

Not a generic reviewer. Not a checklist. The #1 person on earth for that exact thing.

Every task picks its own lens authority:
- Blog post about plumbing SEO → **"Review through the lens of the head of SEO at the #1 ranked digital agency in the world"**
- Google Business Profile optimisation → **"Review through the lens of Google's own local search ranking team"**
- Email campaign for lead gen → **"Review through the lens of the CMO who built HubSpot's inbound machine"**
- Trading signal evaluation → **"Review through the lens of Renaissance Technologies' chief risk officer"**
- Dashboard UX → **"Review through the lens of the lead designer at Linear or Vercel"**
- Legal compliance copy → **"Review through the lens of a senior partner at a top-tier commercial law firm"**

The lens runs at the end of each task. Two outputs — both scoped to THAT specific task/script only:
1. **Output review** — what the authority would change about THIS deliverable
2. **Process optimisation** — how the authority would improve the way THIS specific task/script runs. Not the whole operation. Not the global framework. Just this one process.

Example: SEO blog script finishes → authority reviews the blog post (output) AND reviews how the script generated it (process). "Your keyword research step should come before outline generation, not after." That's it. Stays in its lane.

Agents define their own lens authorities per task when they come online (they know their domain). Brain and audit agent can also apply lenses during review.

## 12. No Built-In Heartbeats — STRUCTURAL
- OpenClaw built-in heartbeats are OFF. Do not re-enable them.
- Replaced with system LaunchAgent running `heartbeat-check.sh` (bash, zero AI tokens)
- Script reads `heartbeat-checks.conf` — only wakes Brain (Opus) if issues found
- Clean = silent log line, no tokens burned
- This is a cost/architecture decision, not a bug. Don't "fix" it.

## 13. Onboarding (New/Returning Agents)
1. Brain audits workspace (every file, script, log)
2. **Credential sweep** — grep for hardcoded secrets, migrate any found to Bitwarden
3. Brain writes onboarding brief
4. Agent comes online on Opus — reads brief + own files + this framework
5. Agent tells us what they need (including any new credentials → Bitwarden first)
6. Adam approves, Brain verifies wiring
7. Test heavily, THEN decide if agent drops to Sonnet
