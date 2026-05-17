# Command Centre Dashboard De-Agenting Plan

Created: 2026-05-10
Open Codex in: `/Users/cairr/AI/CAIRR/internal/command-centre`
Scope: Command Centre dashboard only
Status: Active migration checklist; baseline committed 2026-05-11, follow-up cleanup in progress 2026-05-15

## Purpose

Clean the dashboard so it reports project-owned truth without requiring the Command Centre agent, agent fleet status, OpenClaw snapshots, or agent workspace data.

Do not rebuild the dashboard from scratch unless explicitly approved.

## Working Rules

- [ ] Stay inside this folder unless explicitly checking project status data.
- [ ] Do not inspect or modify NBHW/BTS project files unless integration requires reading agreed status files.
- [ ] Do not delete old pages on first pass.
- [ ] Classify before removing.
- [ ] Preserve user changes and dirty git state.
- [ ] Keep dashboard focused on decisions and status, not agent monitoring.

## Phase 0: Local Snapshot

- [ ] Run and record `git status --short`.
- [ ] List current branch and remotes.
- [ ] List current git hooks.
- [ ] Read `CLAUDE.md`.
- [ ] Read `package.json`.
- [ ] List `pages/`.
- [ ] List `pages/api/`.
- [ ] List `public/`.
- [ ] Note dirty/untracked files before edits.

Known findings from prior audit:

- `CLAUDE.md` still describes agent-owned dashboard workflow.
- Specific `CLAUDE.md` sections to rewrite:
  - `Purpose` says the dashboard shows what agents are doing.
  - `Data Sources` points to agent workspace output, CC agent heartbeat, master task list, and fleet status.
  - `Dashboard Sections` includes Fleet Status.
  - `Ownership` assigns the codebase and data to CC agent and Brain.
  - `Dev Workflow` says CC agent writes changes and Brain deploys.
  - `Brain Does NOT Touch Dashboard Data` assigns dashboard data to CC agent.
- `public/snapshot.json` is modified.
- `pages.bak/` is untracked.
- `pages/index.js`, `fleet.js`, `system.js`, `ricky.js`, and `agent/[name].js` are agent-era surfaces.
- Several API routes read OpenClaw or agent workspace data.
- NBHW API routes currently read `/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/...`.
- Current design lock references `/Users/cairr/.openclaw/workspace/dashboard.html` as golden master; decide whether to migrate that golden master or retire the lock.

## Phase 1: Backup Check

Do not proceed unless the root backup exists.

- [ ] Confirm root backup manifest exists.
- [ ] Confirm this folder was included in backup.
- [ ] Confirm current git state was recorded.
- [ ] If backup is missing, stop and return to root master plan.

## Phase 2: Classify Dashboard Surfaces

Classify before editing.

- [ ] Classify `pages/index.js`.
- [ ] Classify `pages/bts-seo.js`.
- [ ] Classify `pages/nbhw-seo.js`.
- [ ] Classify `pages/cairr-finance.js`.
- [ ] Classify `pages/fleet.js`.
- [ ] Classify `pages/fleet-old.js`.
- [ ] Classify `pages/system.js`.
- [ ] Classify `pages/ricky.js`.
- [ ] Classify `pages/agent/[name].js`.
- [ ] Classify all API routes.
- [ ] Classify `public/snapshot.json`.
- [ ] Classify `public/bts-drafts.json`.
- [ ] Classify `pages.bak/`.

## Phase 2A: Audit Command Centre Agent Workspace Content

This is required before archiving the Command Centre agent workspace. Do not copy everything blindly. Classify each file and migrate only content that should become dashboard-owned truth.

Agent workspace:

```text
/Users/cairr/.openclaw/agents/command-centre/workspace/
```

Critical known files to review:

- [ ] `dashboard-secure/`.
- [ ] `data/snapshot.json`.
- [ ] `data/bts-drafts.json`.
- [ ] `data/bts-notifications.json`.
- [ ] `data/bts-suggestions.json`.
- [ ] `data/nbhw-suggestions.json`.
- [ ] `dev/dashboard/*.json`.
- [ ] `dev/dashboard/snapshot.json`.
- [ ] `dev/dashboard-architecture.md`.
- [ ] `dev/scripts/` or snapshot push scripts if present.
- [ ] `archive/dashboard.html` and related dashboard golden-master files.
- [ ] Any `.env`, tokens, credentials, or secret files - classify as `secret-risk`, do not migrate into repo.

For each useful file:

- [ ] Decide target location inside this dashboard folder.
- [ ] Check whether an equivalent file already exists locally.
- [ ] Preserve newer/more accurate source of truth.
- [ ] Record duplicates and conflicts.
- [ ] Migrate only after backup and classification.

Use these labels:

- `keep-active`
- `keep-but-rewire`
- `archive-later`
- `duplicate`
- `agent-era-remove-later`
- `needs-user-decision`

## Phase 3: Data Contract

Do this before page rewiring.

- [ ] Confirm project status JSON fields from root master plan.
- [ ] Create or plan `public/data/`.
- [ ] Decide whether dashboard reads static JSON from `public/data/` or API route wrappers.
- [ ] Decide how BTS/NBHW draft approvals are stored.
- [ ] Decide what can remain manual initially.
- [ ] Decide whether dashboard status updates are manual files first, before hooks are introduced.

Minimum target files:

```text
public/data/bts-status.json
public/data/nbhw-status.json
public/data/dashboard-status.json
```

## Phase 4: Remove Agent Data Dependency

- [ ] Rewire `/api/data` away from remote `agent/command-centre` snapshot.
- [ ] Remove active reads from `/Users/cairr/.openclaw/agents/...`.
- [ ] Remove active OpenClaw CLI calls from dashboard APIs unless explicitly kept as dormant diagnostics.
- [ ] Rewire NBHW draft/API data to dashboard-local or project-owned files.
- [ ] Rewire BTS draft/API data to dashboard-local or project-owned files.
- [ ] Make missing data fail visibly but safely.

## Phase 5: Page Cleanup

- [ ] Update main dashboard to show project status instead of agent fleet status.
- [ ] Keep BTS SEO page if useful, but remove language saying BTS agent adds drafts.
- [ ] Keep NBHW SEO page if useful, but remove language saying NBHW agent adds drafts.
- [ ] Remove, hide, or repurpose fleet page.
- [ ] Update system page to service health only, not agent pipeline.
- [ ] Park Ricky page unless it has an active non-agent use.
- [ ] Remove navigation links to agent-only pages or mark them parked.

## Phase 5A: Dashboard Design Lock Decision

The current `CLAUDE.md` says `dashboard.html` is the locked design and points to `/Users/cairr/.openclaw/workspace/dashboard.html`.

- [x] Decide whether the design lock still applies.
- [x] Decision: keep the existing dashboard layout and page sequence intact.
- [x] Do not change structure, navigation order, or visual layout during de-agenting.
- [x] Update data flowing into the existing UI shell from manual/project-owned status data.
- [x] Update `CLAUDE.md` to record this rule.
- [ ] Any future styling/layout change requires explicit approval.

## Phase 6: Docs Cleanup

- [ ] Update `CLAUDE.md`.
- [ ] Replace CC agent ownership with project-owned dashboard maintenance.
- [ ] Document local dev command.
- [ ] Document deploy process.
- [ ] Document data file locations.
- [ ] Document what dashboard does not own.
- [ ] Review project `.claude/settings.json` or `.claude/settings.local.json` for direct Claude Code workflow.
- [ ] Configure only dashboard-local routine operations Adam wants auto-approved, such as reads, local edits, git status/diff, npm build/dev, and safe search/list commands.
- [ ] Do not auto-approve production deploys, credential edits, destructive deletes, or cross-project writes.
- [ ] Review `.gitignore` to confirm it covers any newly migrated files that should not be committed, especially data files containing client details or credentials from the agent workspace.

## Phase 7: Verification

- [ ] Run install check if needed.
- [ ] Run lint if available.
- [ ] Run build.
- [ ] Start local dashboard if needed.
- [ ] Verify main page loads.
- [ ] Verify at least one project status card renders real data from the rewired status source.
- [ ] Verify BTS page loads.
- [ ] Verify BTS page renders real BTS data from the rewired source, not stale snapshot fallback.
- [ ] Verify NBHW page loads.
- [ ] Verify NBHW page renders real NBHW data from the rewired source, not stale snapshot fallback.
- [ ] Verify empty/missing data states are visible and understandable.
- [ ] Verify auth still works or document if not tested.
- [ ] Verify no active API reads OpenClaw agent workspace paths.
- [ ] Verify no page depends on `fleetHealth` as core status.

## Phase 8: Integration Notes

- [ ] Record exact status files dashboard expects.
- [ ] Record exact manual update process.
- [ ] Record future hook/script requirements.
- [ ] Send integration notes back to root plan.

## 2026-05-15 Cleanup Notes

- Baseline tag: `dashboard-de-agenting-baseline-2026-05-11` at `d719949`.
- Post-baseline BTS status update: `70bf439`.
- Active manual data files:
  - `public/data/bts-status.json`
  - `public/data/nbhw-status.json`
  - `public/data/dashboard-status.json`
- `public/snapshot.json` is legacy-disabled and must not be used as an active source.
- `pages.bak/` has been archived to `docs/archive/pages-bak-2026-05-15/`.
- Hooks remain deferred. Manual status JSON must stay stable for a cycle before automation.

## Phase 9: Post-De-Agenting Operating Workflow

This cleanup only removes Command Centre agent dependency. It does not complete dashboard automation.

- [ ] Establish manual status update workflow for BTS and NBHW.
- [ ] Confirm dashboard can be updated without agent snapshots.
- [ ] Later roadmap: manual status JSON -> project scripts -> hooks after commit -> approval workflow integration -> semi-automatic reporting.

## Done Criteria

- [ ] Dashboard works without Command Centre agent.
- [ ] Main dashboard reports project-owned status.
- [ ] No active API reads `/Users/cairr/.openclaw/agents/...`.
- [ ] Agent fleet page is removed, hidden, or clearly parked.
- [ ] System page no longer describes old agent build pipeline as active.
- [ ] BTS/NBHW pages do not depend on agent snapshots.
- [ ] Dashboard design lock is migrated or explicitly retired.
- [ ] Claude Code dashboard permissions have been reviewed.
- [ ] Manual dashboard status workflow is documented as the next operating step.
- [ ] Build passes or failure is documented.
- [ ] Cleanup is committed and ready for baseline tag.
