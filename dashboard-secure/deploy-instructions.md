# Secure Command Centre Dashboard - Deployment Instructions

## Option 1: Local Network Access (Quick & Secure)

### Start Local Secure Server:
```bash
cd /Users/cairr/.openclaw/workspace/dashboard-secure
npm run dev
# Accessible on local network at: http://192.168.0.70:3000
```

**Security:** Password protected (adam / CommandCentre2026!)
**Access:** Any device on your home network
**Mobile:** Perfect responsive design

## Option 2: Vercel Cloud Deployment (Global Access)

### Deploy to Vercel:
```bash
cd /Users/cairr/.openclaw/workspace/dashboard-secure
npx vercel --prod
```

**Required Environment Variables in Vercel:**
- DASHBOARD_USER=adam
- DASHBOARD_PASS=CommandCentre2026!  
- DASHBOARD_SESSION_TOKEN=cc-auth-token-secure-2026-cairr

### Set Environment Variables:
```bash
vercel env add DASHBOARD_USER production
# Enter: adam

vercel env add DASHBOARD_PASS production  
# Enter: CommandCentre2026!

vercel env add DASHBOARD_SESSION_TOKEN production
# Enter: cc-auth-token-secure-2026-cairr

# Redeploy after adding env vars
npx vercel --prod
```

## Security Features

✅ **Password Protection:** HTTP Basic Auth on every request
✅ **Session Cookies:** 7-day secure authentication  
✅ **No Search Engine Indexing:** Robots blocked, noindex headers
✅ **HTTPS Only:** Encrypted connections
✅ **Environment Variables:** Secure credential storage

## Mobile Access

📱 **Responsive Design:** Perfect on all screen sizes
📱 **Touch Optimized:** Easy finger navigation
📱 **Real-time Data:** Live system status
📱 **Quick Overview:** Essential info at a glance

## Usage

1. Open URL in mobile browser
2. Enter credentials: adam / CommandCentre2026!
3. Stay logged in for 7 days
4. View real-time system status, property scan progress, project health

**The dashboard shows current status of all projects, active scans, overdue items, and system health - perfect for mobile monitoring!**