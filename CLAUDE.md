# CLAUDE.md — Command Centre Dashboard

## Governance Chain
~/.claude/CLAUDE.md → /Users/cairr/AI/cairr/CLAUDE.md → THIS FILE

## Purpose
Adam's executive dashboard. The single pane of glass for all CAIRR operations.
Shows what needs his attention, what's in progress, what agents are doing.

## Top Rules
1. **Dashboard is for DECISIONS.** Every item on screen needs Adam to do something.
2. **No completed items.** Done = removed + logged. No clutter.
3. **Item lifecycle:** New (unread) → Opened (tick) → Actioned (removed)
4. **One screen.** If it doesn't fit on a phone screen, cut it.
5. **No green ticks on things Adam hasn't opened.**
6. **Mobile-first.** Adam checks this on his phone.

## Tech Stack
- Next.js 14, React 18
- Deployed: Vercel (Adam's account)
- Auth: HTTP Basic Auth (middleware.js)
- Login: adam / CommandCentre2026!

## Data Sources
- Agent workspace output/ dirs (via CC agent heartbeat)
- Nightly research reports (cairr/internal/self-improvement/reports/)
- Master task list (workspace/adam-master-task-list.md)
- Agent fleet status (heartbeat results)

## Dashboard Sections
- NEEDS ADAM NOW — requires his decision
- OVERDUE / ALERTS — past deadline or failing
- IN PROGRESS — active work
- FLEET STATUS — agent health (no ticks)
- UPCOMING — next 7 days only, past dates auto-remove

## Ownership
- CC Agent owns the codebase and updates data
- Brain audits changes before deployment
- Adam approves deployments to production

## Dev Workflow
- CC agent writes changes to its workspace dev/dashboard/
- Brain reviews and copies to cairr/internal/command-centre/
- Brain deploys to Vercel after Adam's approval

## Security
- Password protected (Basic Auth), no search engine indexing
- No caching, session cookies (7-day), HTTPS only (Vercel)

## 🔒 DESIGN LOCK — CONSTITUTIONAL
- **dashboard.html is the LOCKED design. NEVER change its layout, style, or structure.**
- Data updates ONLY — swap text/numbers inside existing elements.
- NO new sections. NO removing sections. NO changing colors, fonts, spacing, borders.
- The file at `/Users/cairr/.openclaw/workspace/dashboard.html` (Feb 27 2026) is the golden master.
- ANY layout change requires Adam's explicit approval with a screenshot of the proposed change.
- File is chmod 444 (read-only). Must be unlocked before any edit.
