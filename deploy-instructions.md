# Command Centre Dashboard - Deployment Notes

## Local Development

```bash
npm run dev
```

The dashboard is password protected by `middleware.js`.

## Production Build

```bash
npm run build
```

## Vercel Deployment — push-to-deploy (active)

**Production deploys are automatic on every push to `main`.** The Vercel project
`command-centre` is connected to `github.com/weetbixsnr-cmyk/cairr-command-centre`
(production branch = `main`). When a commit lands on `main`, GitHub notifies Vercel
and a production build runs within ~1 minute, then the production alias
`command-centre-nine.vercel.app` is repointed to the new deployment.

You do **not** need to run `vercel --prod` by hand. A manual `vercel --prod` still
works as a fallback (e.g. to redeploy without a new commit), but the normal path is:
commit → push `main` → Vercel auto-deploys.

Verify a deploy is git-triggered and tied to a commit:

```bash
# lists recent prod deploys with their source + commit SHA
npx vercel ls command-centre
```

(Note: `vercel inspect <url>` does **not** print git source metadata in its text
output even when the deploy IS git-triggered — check the Vercel dashboard or the
deployments API `meta.githubCommitSha` to confirm the SHA.)

Required environment variables:

- `DASHBOARD_USER`
- `DASHBOARD_PASS`
- `DASHBOARD_SESSION_TOKEN`
- `BTS_SESSION_TOKEN` if BTS client login is enabled
- `BTS_DRAFT_API_KEY` if API draft writes are enabled
- `NBHW_DRAFT_API_KEY` if API draft writes are enabled
- `BTS_DISCORD_WEBHOOK` only if BTS notifications should be sent

Do not use the old `.openclaw/workspace/dashboard-secure` path.

## Data Updates

Manual status files are the current source of truth:

- `public/data/bts-status.json`
- `public/data/nbhw-status.json`
- `public/data/dashboard-status.json`

Update those files, build, and verify `/api/data` before deploying.

Hooks are intentionally not wired yet.

## Publishing pipeline

The end-to-end flow for getting fresh BTS data onto the live dashboard:

```
BTS weekly.py sync  →  writes public/data/bts/*.json
   →  commit         →  push main
   →  Vercel auto-deploy (git-triggered)
   →  live on command-centre-nine.vercel.app (~1 min)
```

No manual deploy step is required. The only gate is the push approval (Adam
approves pushes to `main`); once pushed, deployment is hands-free.

### Aliases (healthy)

Both production aliases track the latest `main` deploy automatically:

- `command-centre-nine.vercel.app` — primary production URL (bookmark this)
- `command-centre-git-main-…vercel.app` — Vercel's per-branch alias for `main`

The other long per-deploy URLs (`command-centre-<hash>-…`) are pinned to a single
build — do not bookmark those; they go stale.

### Cleanup candidates (needs Adam's approval — destructive)

- **`command-centre-git-agent-…vercel.app`** — per-branch preview alias for the
  `agent/command-centre` branch. Stale (last updated 2026-03-12, ~78 days).
- **`agent/command-centre` branch** (`origin`) — leftover from the pre-de-agenting
  era; the dashboard is now de-agented (see CLAUDE.md). The branch and its preview
  alias can be removed once Adam confirms nothing still references them. Deleting a
  branch/alias is destructive, so it is flagged here rather than actioned.
