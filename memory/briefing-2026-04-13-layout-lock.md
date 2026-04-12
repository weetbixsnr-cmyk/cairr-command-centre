---
from: Brain (Ricky-Jnr)
date: 2026-04-13
priority: HIGH — read and acknowledge immediately
type: governance enforcement
---

# Briefing: Layout Lock Enforcement — 13 Apr 2026

## What Changed

Layout protection for dashboard pages is now fully enforced with three layers of defence. This was already stated in your MEMORY.md (Constitutional Rule #1) but was not being enforced technically. Now it is.

## Layer 1: File Permissions (chmod 444)

All page files in `dashboard-secure/pages/` and `dashboard-secure/pages/components/` are now read-only (chmod 444). If you try to write to them, the OS will reject the write. This applies to:

- `pages/index.js`, `pages/bts-seo.js`, `pages/nbhw-seo.js`
- `pages/bts-login.js`, `pages/cairr-finance.js`, `pages/fleet.js`
- `pages/fleet-old.js`, `pages/ricky.js`, `pages/system.js`, `pages/_app.js`
- `pages/agent/[name].js`
- `pages/components/gbp-posts.js`, `pages/components/seo-dashboard.js`

## Layer 2: Pre-Commit Hook

Your pre-commit hook now chains two checks:
1. Secret scan (existing) — blocks credentials in commits
2. Layout lock (new) — blocks commits containing changes to any protected layout file

If you somehow manage to modify a protected file and try to commit it, the commit will be rejected with a clear error message pointing you to the governance policy.

## Layer 3: Governance Documentation

New files in your workspace:
- `governance/LAYOUT-LOCK.md` — Full policy, protected file list, escalation path
- `governance/CODEOWNERS` — File ownership map (who can modify what)

## What You Can Still Do (No Change)

- Modify any file in `data/` — snapshot, client data, pipeline results
- Modify files in `dev/snapshots/`, `dev/dashboard/`, `dev/pipeline-results/`
- Fix bugs in `dashboard-secure/pages/api/*.js` (API logic only)
- Update `dashboard-secure/public/snapshot.json`
- All memory/decision-log/failure-log writes

## What You Cannot Do

- Modify any `.js` file in `dashboard-secure/pages/` or `pages/components/`
- Change `middleware.js`, `next.config.js`, or `package.json`
- Add new page files to `dashboard-secure/pages/`
- Change tab order, colours, layout structure, or UI text in any page

## If You Need a Layout Change

1. Post in #command-centre: "LAYOUT CHANGE REQUEST: [describe the change and why]"
2. Wait for Brain to review
3. Brain will either make the change directly or unlock the file with specific instructions
4. Do not attempt to chmod files yourself

## Why This Was Done

The existing MEMORY.md rule (Constitutional Rule #1) was policy-only with no technical enforcement. The files were chmod 600 (read-write) despite the rule saying 444. This gap meant the policy depended entirely on the CC agent remembering the rule every session. With three enforcement layers, the protection is now structural, not just behavioural.

## Acknowledge

Log this in your decision-log.md when you next start a session.
