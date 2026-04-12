# Layout Lock — Dashboard Page Protection

> **Authority:** Brain (Ricky-Jnr)
> **Effective:** 13 Apr 2026
> **Status:** ENFORCED (pre-commit hook + chmod 444)

## Rule

All dashboard layout files are LOCKED. Only Brain (Ricky-Jnr) can modify them.

## Protected Files

### Pages (layout/UI)
```
dashboard-secure/pages/index.js
dashboard-secure/pages/bts-seo.js
dashboard-secure/pages/nbhw-seo.js
dashboard-secure/pages/bts-login.js
dashboard-secure/pages/cairr-finance.js
dashboard-secure/pages/fleet.js
dashboard-secure/pages/fleet-old.js
dashboard-secure/pages/ricky.js
dashboard-secure/pages/system.js
dashboard-secure/pages/_app.js
dashboard-secure/pages/agent/*.js
```

### Components (shared UI)
```
dashboard-secure/pages/components/gbp-posts.js
dashboard-secure/pages/components/seo-dashboard.js
```

### Middleware / Config
```
dashboard-secure/middleware.js
dashboard-secure/next.config.js
dashboard-secure/package.json
```

## What CC Agent CAN Modify

### Data files (no restriction)
```
data/*.json
dev/snapshots/*.json
dev/dashboard/*.json
dev/pipeline-results/*.json
dashboard-secure/public/snapshot.json
```

### API logic (bug fixes only)
```
dashboard-secure/pages/api/*.js — bug fixes only, no new endpoints
```
New API endpoints require Brain approval first.

## Enforcement Mechanisms

1. **chmod 444** — All protected page files are read-only on disk. CC agent cannot write to them even if it tries.
2. **Pre-commit hook** — `layout-lock-hook.sh` blocks commits that include changes to protected files. The commit is rejected with a clear error message.
3. **Audit gate** — Post-commit hook sends all commits to Audit agent. Layout changes from non-Brain sources will be caught and rejected.
4. **Governance rule** — MEMORY.md Constitutional Rule #1 (LAYOUT LOCK) explicitly states this policy.

## How Brain Unlocks a File

When Brain needs to modify a layout file:
1. Brain runs: `chmod 644 <file>` to unlock
2. Brain makes the change
3. Brain runs: `chmod 444 <file>` to re-lock
4. Brain commits with message prefix: `ui:` or `layout:`
5. The pre-commit hook recognises Brain's unlock and allows the commit

## Escalation Path

If CC agent needs a layout change:
1. Post in #command-centre: "LAYOUT CHANGE REQUEST: [what and why]"
2. Brain reviews the request
3. If approved, Brain makes the change or unlocks the file with instructions
4. CC agent does NOT attempt to chmod or modify locked files

## Why This Exists

On 12 Apr 2026, Brain audit found that layout files had been modified without coordination, causing deployment drift between the CC workspace and the Vercel project. Layout changes require holistic review (mobile responsiveness, component dependencies, build verification) that only Brain performs.

Data changes are frequent and safe. Layout changes are rare and risky. This separation protects the dashboard from accidental breakage.
