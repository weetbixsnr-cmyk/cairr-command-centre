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

## Vercel Deployment

Deploy from this repository after Adam approves production deployment.

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
