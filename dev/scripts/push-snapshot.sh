#!/bin/bash
# push-snapshot.sh — Wrapper for push-snapshot.js
# Run via OpenClaw cron every 5 minutes
# Usage: bash dev/scripts/push-snapshot.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/push-snapshot.js"
