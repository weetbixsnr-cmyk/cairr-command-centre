#!/bin/bash
# deploy-prep.sh — Copy dev pages to dashboard-secure and bundle snapshot for deploy
# Run this before `vercel --prod`
set -euo pipefail

WORKSPACE="/Users/cairr/.openclaw/agents/command-centre/workspace"
DASH="$WORKSPACE/dashboard-secure"
DEV="$WORKSPACE/dev"

echo "=== Deploy Prep ==="

# 1. Generate fresh snapshot
echo "Building snapshot..."
node "$DEV/scripts/push-snapshot.js"

# 2. Bundle snapshot into public/ for static fallback
mkdir -p "$DASH/public"
cp "$DEV/snapshots/latest.json" "$DASH/public/snapshot.json"
echo "Bundled snapshot into public/ ($(wc -c < "$DASH/public/snapshot.json" | tr -d ' ') bytes)"

# 3. Copy dev pages to dashboard-secure
echo "Copying pages..."
cp "$DEV/pages/api/data.js" "$DASH/pages/api/data.js"
cp "$DEV/pages/api/action.js" "$DASH/pages/api/action.js"
cp "$DEV/pages/index.js" "$DASH/pages/index.js"
cp "$DEV/pages/fleet.js" "$DASH/pages/fleet.js"
cp "$DEV/pages/system.js" "$DASH/pages/system.js"
cp "$DEV/pages/nbhw-seo.js" "$DASH/pages/nbhw-seo.js"
cp "$DEV/pages/_app.js" "$DASH/pages/_app.js"
mkdir -p "$DASH/pages/agent"
cp "$DEV/pages/agent/[name].js" "$DASH/pages/agent/[name].js"

echo "=== Ready to deploy ==="
echo "Run: cd $DASH && npx vercel --prod"
