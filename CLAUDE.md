# CLAUDE.md - Command Centre Dashboard

## Governance Chain
~/.claude/CLAUDE.md -> /Users/cairr/AI/cairr/CLAUDE.md -> THIS FILE

## Purpose
Adam's executive dashboard. The dashboard reports project-owned decisions, blockers, and status.

It must not depend on the Command Centre agent, agent fleet status, OpenClaw snapshots, or agent workspace output as live truth.

## Top Rules
1. Dashboard is for decisions. Every item on screen should help Adam decide or act.
2. No completed items in the active queue. Done means removed from active view and retained only in source history.
3. Mobile-first. Adam checks this on his phone.
4. Keep the dashboard focused on project status, blockers, and next actions.
5. Do not rebuild the dashboard UI from scratch without explicit approval.
6. Do not wire automation hooks until manual status JSON works and the project-owned status contracts are agreed.

## Tech Stack
- Next.js 14, React 18
- Deployed: Vercel
- Auth: HTTP Basic Auth via `middleware.js`

## Data Sources
Active data lives in dashboard-owned manual JSON files:

- `public/data/bts-status.json`
- `public/data/nbhw-status.json`
- `public/data/dashboard-status.json`

`/api/data` aggregates those files for the existing pages.

Inactive/parked sources:

- `/Users/cairr/.openclaw/agents/...`
- `public/snapshot.json`
- remote `agent/command-centre` snapshot data
- OpenClaw CLI status, session, cron, governance, and fleet calls

## Dashboard Sections
- Project status cards
- Blockers and next actions
- Manual action queue
- BTS SEO status
- NBHW SEO status
- Parked diagnostics where legacy routes still exist

## Ownership
- This repo owns dashboard rendering and dashboard-local manual status files.
- BTS and NBHW own their project truth. The dashboard may read agreed status exports once those contracts exist.
- Adam approves production deployments.

## Dev Workflow
- Edit this repo directly.
- Use `npm run build` before handoff when feasible.
- Do not modify BTS or NBHW project files from this dashboard task unless explicitly asked.
- Manual status JSON is updated first; hooks are a later phase.

## Security
- Password protected, no search engine indexing.
- Do not commit credentials, tokens, or copied agent workspace secrets.

## Design Lock Decision
The old constitutional design lock pointed at `/Users/cairr/.openclaw/workspace/dashboard.html` and assumed the agent-era HTML dashboard workflow. That lock no longer applies as an active workflow rule.

The historical local reference is `public/dashboard.html`. Treat it as a reference only until Adam approves a new design lock. Do not make styling/layout changes as part of de-agenting unless explicitly approved.

## Manual Status Workflow
1. Update the relevant file in `public/data/`.
2. Run `npm run build`.
3. Verify `/api/data` includes the updated project.
4. Verify `/`, `/bts-seo`, and `/nbhw-seo` render actual values from the manual JSON.
