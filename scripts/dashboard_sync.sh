#!/usr/bin/env bash
set -euo pipefail
BASE="/Users/cairr/.openclaw/workspace"
ARCHIVE="$BASE/archive"
CURRENT_DATE=$(date +%F)
CURRENT_NIGHTLY="$ARCHIVE/dashboard-nightly-$CURRENT_DATE.html"
LIVE="$BASE/dashboard.html"
ADAMS="$BASE/Adams-Command-Centre.html"

if [ -f "$ARCHIVE/auto_sync_paused" ]; then echo "Dashboard sync paused"; exit 0; fi

mkdir -p "$ARCHIVE"
cp -f "$LIVE" "$CURRENT_NIGHTLY"
ln -sf "$CURRENT_NIGHTLY" "$ARCHIVE/dashboard-nightly-current.html"
ln -sf "$ARCHIVE/dashboard-nightly-current.html" "$ADAMS"
echo "$(date): Dashboard synced -> $CURRENT_NIGHTLY"
