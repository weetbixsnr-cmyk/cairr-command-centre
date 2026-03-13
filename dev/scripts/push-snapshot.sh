#!/bin/bash
# push-snapshot.sh — Bundle all dashboard data into JSON and push to Vercel KV
# Run via OpenClaw cron every 5 minutes
# Usage: bash dev/scripts/push-snapshot.sh

set -euo pipefail

WORKSPACE="/Users/cairr/.openclaw/agents/command-centre/workspace"
PIPELINE="$WORKSPACE/dev/pipeline-results"
DASHBOARD_DATA="$WORKSPACE/dev/dashboard"
SNAPSHOT_FILE="$WORKSPACE/dev/dashboard/snapshot.json"

# ── Collect data ──────────────────────────────────────────────

# Fleet health
FLEET_HEALTH=""
if [ -f "$PIPELINE/fleet-health-latest.md" ]; then
  FLEET_HEALTH=$(cat "$PIPELINE/fleet-health-latest.md")
fi

# Governance drift
GOVERNANCE=""
if [ -f "$PIPELINE/governance-drift-latest.md" ]; then
  GOVERNANCE=$(cat "$PIPELINE/governance-drift-latest.md")
fi

# Action queue
ACTION_QUEUE="[]"
if [ -f "$DASHBOARD_DATA/action-queue.json" ]; then
  ACTION_QUEUE=$(cat "$DASHBOARD_DATA/action-queue.json")
fi

# Infrastructure status
INFRA=""
if [ -f "$PIPELINE/infra-status-latest.md" ]; then
  INFRA=$(cat "$PIPELINE/infra-status-latest.md")
fi

# Token spend
TOKEN_SPEND=""
if [ -f "$PIPELINE/token-spend-latest.md" ]; then
  TOKEN_SPEND=$(cat "$PIPELINE/token-spend-latest.md")
fi

# All agent latest reports
AGENT_REPORTS="{}"
for f in "$PIPELINE"/*-latest.md; do
  [ -f "$f" ] || continue
  basename=$(basename "$f" -latest.md)
  # Skip meta reports
  case "$basename" in
    fleet-health|governance-drift|infra-status|token-spend|email-cleanup) continue ;;
  esac
  content=$(cat "$f")
  stat_time=$(stat -f "%m" "$f" 2>/dev/null || stat -c "%Y" "$f" 2>/dev/null || echo "0")
  AGENT_REPORTS=$(echo "$AGENT_REPORTS" | node -e "
    const fs=require('fs');
    let d=JSON.parse(fs.readFileSync('/dev/stdin','utf8'));
    d['$basename']={content:$(node -e "console.log(JSON.stringify(fs.readFileSync('$f','utf8')))"),mtime:$stat_time};
    console.log(JSON.stringify(d));
  ")
done

# All full reports
FULL_REPORTS="{}"
for f in "$PIPELINE"/*-full-report.md; do
  [ -f "$f" ] || continue
  basename=$(basename "$f" -full-report.md)
  FULL_REPORTS=$(echo "$FULL_REPORTS" | node -e "
    const fs=require('fs');
    let d=JSON.parse(fs.readFileSync('/dev/stdin','utf8'));
    d['$basename']={content:$(node -e "console.log(JSON.stringify(fs.readFileSync('$f','utf8')))")};
    console.log(JSON.stringify(d));
  ")
done

# OpenClaw status (sessions, heartbeats, agents)
OPENCLAW_STATUS=""
if command -v openclaw &>/dev/null; then
  OPENCLAW_STATUS=$(openclaw status 2>&1 || echo "unavailable")
fi

# ── Build snapshot JSON ──────────────────────────────────────

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

node -e "
const fs = require('fs');

const snapshot = {
  timestamp: '$TIMESTAMP',
  fleetHealth: $(node -e "console.log(JSON.stringify(fs.readFileSync('$PIPELINE/fleet-health-latest.md','utf8').toString()))") || null,
  governance: $(node -e "console.log(JSON.stringify(fs.readFileSync('$PIPELINE/governance-drift-latest.md','utf8').toString()))") || null,
  actionQueue: $ACTION_QUEUE,
  infra: $(node -e "console.log(JSON.stringify(fs.readFileSync('$PIPELINE/infra-status-latest.md','utf8').toString()))") || null,
  tokenSpend: $([ -f "$PIPELINE/token-spend-latest.md" ] && node -e "console.log(JSON.stringify(require('fs').readFileSync('$PIPELINE/token-spend-latest.md','utf8')))" || echo 'null'),
  agentReports: $AGENT_REPORTS,
  fullReports: $FULL_REPORTS,
  openclawStatus: $(node -e "console.log(JSON.stringify('$OPENCLAW_STATUS'.substring(0,10000)))"),
};

fs.writeFileSync('$SNAPSHOT_FILE', JSON.stringify(snapshot, null, 2));
console.log('Snapshot written: ' + '$SNAPSHOT_FILE');
console.log('Size: ' + Math.round(fs.statSync('$SNAPSHOT_FILE').size/1024) + 'KB');
"

# ── Push to Vercel KV ────────────────────────────────────────
# Requires: KV_REST_API_URL and KV_REST_API_TOKEN env vars
# These come from Vercel KV setup and should be in .env.local

if [ -n "${KV_REST_API_URL:-}" ] && [ -n "${KV_REST_API_TOKEN:-}" ]; then
  curl -s -X PUT \
    "$KV_REST_API_URL/set/dashboard:snapshot" \
    -H "Authorization: Bearer $KV_REST_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$SNAPSHOT_FILE" \
    && echo "Pushed to Vercel KV" \
    || echo "ERROR: Failed to push to Vercel KV"
else
  echo "KV credentials not set — snapshot saved locally only"
  echo "Set KV_REST_API_URL and KV_REST_API_TOKEN to enable push"
fi
