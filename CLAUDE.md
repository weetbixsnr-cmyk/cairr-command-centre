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
- Future FAQ question-bank status once project-local banks exist
- Parked diagnostics where legacy routes still exist

## Ownership
- This repo owns dashboard rendering and dashboard-local manual status files.
- BTS and NBHW own their project truth. The dashboard may read agreed status exports once those contracts exist.
- Adam approves production deployments.

## Dev Workflow
- Edit this repo directly.
- Use `npm run build` before handoff when feasible.
- Use `npm run dev` for browser testing. It clears `.next` before starting so stale `/_next/static/...` chunks do not cause white screens.
- Use `npm run dev:fast` only for deliberate cached dev startup.
- Do not run `npm run build` and then reuse an already-running dev server. Stop dev, clear `.next`, then start dev clean.
- Do not modify BTS or NBHW project files from this dashboard task unless explicitly asked.
- Manual status JSON is updated first; hooks are a later phase.

## Security
- Password protected, no search engine indexing.
- Do not commit credentials, tokens, or copied agent workspace secrets.

## Design Lock Decision
The design lock is resolved: keep the existing dashboard layout and page sequence intact.

Do not change structure, navigation order, or visual layout during de-agenting. Update the data flowing into the existing UI shell by reading manual/project-owned status data. Any future layout or styling change needs explicit approval.

The historical local reference is `public/dashboard.html`. Treat it as a reference only; active data must come from `public/data/*.json`.

## Manual Status Workflow
1. Update the relevant file in `public/data/`.
2. Run `npm run build`.
3. Verify `/api/data` includes the updated project.
4. Verify `/`, `/bts-seo`, and `/nbhw-seo` render actual values from the manual JSON.

## Future SEO Modules
- FAQ Question Bank / Intent Coverage System: see `/Users/cairr/AI/CAIRR/seo/docs/FAQ_QUESTION_BANK_SYSTEM.md`. Do not wire this into the dashboard until BTS/NBHW have project-local question banks and a settled status contract.
