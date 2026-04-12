---
from: Brain (Ricky-Jnr)
date: 2026-04-12
priority: HIGH — act on this immediately
---

# Briefing from Brain — 12 Apr 2026

## What I Changed Today (in your dashboard-secure code)

### 1. Suggestions endpoint switched from Vercel Blob to GitHub API
**File:** `pages/api/bts-suggestions.js`
- Vercel Blob store is SUSPENDED — all writes were failing
- Rewrote to use GitHub Contents API (same pattern as bts-draft-action.js)
- Uses `GITHUB_TOKEN` env var (updated in Vercel with repo write access)

### 2. Discord webhook notifications added
**Files:** `pages/api/bts-suggestions.js`, `pages/api/bts-draft-action.js`
- New env var: `BTS_DISCORD_WEBHOOK` (set in Vercel production)
- Webhook URL posts to #bts Discord channel
- ALL actions now send Discord notifications:
  - Suggestion submitted → blue embed
  - Approve → green embed
  - Reject → red embed with feedback
  - Edit → yellow embed with content preview
  - Publish → blue embed
  - Sign-off → purple embed
  - Visual check complete → purple embed

### 3. Future Posts tab — no more page reload
**File:** `pages/bts-seo.js`
- Replaced `window.location.reload()` with optimistic state updates
- Page stays on the Future Posts tab after any action
- Inline confirmation messages: "Approved! Adam has been notified.", "Changes saved!", etc.
- Buttons disabled during save to prevent double-clicks
- Added `draftResults` and `localDrafts` state variables

### 4. Vercel env vars updated
- `BTS_DISCORD_WEBHOOK` — added (Discord webhook for #bts channel)
- `GITHUB_TOKEN` — replaced with token that has repo write access (was read-only, causing 403 on writes)

### 5. OpenClaw config change
- `openclaw.json` → BTS account `allowBots` changed from `true` to `false`
- This prevents the BTS agent from responding to webhook messages in #bts
- Webhook messages are for Adam to read and relay to BTS agent manually

## What You Need To Do Now

### A. Update all BTS draft statuses
Adam has completed the following TODAY:
- **All Future Posts** (8 draft blogs/news/partnerships) — published and live on bettertrainingsolutions.co.uk
- **All GBP posts** (6 posts) — published on Google Business Profile or scheduled within the next week
- Update `data/bts-drafts.json` via GitHub API — mark all posts as `signed-off` with today's date
- Push a fresh snapshot reflecting the new statuses

### B. Verify suggestion box works end-to-end
- Submit a test suggestion via the BTS dashboard
- Confirm it saves to `data/bts-suggestions.json` on GitHub
- Confirm Discord notification appears in #bts

### C. Verify all buttons work
- Test each button type on any remaining draft post
- Confirm Discord notifications fire for each action type
- Confirm inline confirmation messages appear

### D. Update snapshot data
- Run `push-snapshot.js` to refresh dashboard data
- Ensure btsDrafts reflects current reality (all signed off)
- Ensure btsSuggestions shows any test submissions

### E. Check your dev/ pages are in sync
The `deploy-prep.sh` script copies dev pages but doesn't include `bts-seo.js`, `bts-login.js`, or the BTS/NBHW API endpoints. Your `dev/pages/` may be stale compared to `dashboard-secure/pages/`. Sync if needed.
