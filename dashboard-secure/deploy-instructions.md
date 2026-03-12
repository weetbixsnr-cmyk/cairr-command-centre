# Command Centre Dashboard — Deployment

## Credentials
Stored in **Bitwarden** → `OpenClaw/Dashboard` folder. Never hardcode.

## Local (Dev)
```bash
cd dashboard-secure && npm run dev
# Access: http://192.168.0.70:3333
```

## Vercel (Prod)
```bash
npx vercel --prod
```
Set env vars in Vercel dashboard from Bitwarden values:
- DASHBOARD_USER
- DASHBOARD_PASS
- DASHBOARD_SESSION_TOKEN

## Security
- HTTP Basic Auth + 7-day session cookie
- noindex/nofollow headers
- HTTPS only on Vercel
