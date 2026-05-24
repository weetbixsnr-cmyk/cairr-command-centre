#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3100}"
BUILD_FIRST="${BUILD_FIRST:-0}"
PASS=0
FAIL=0
PID=

cleanup() { [ -n "$PID" ] && kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; }
trap cleanup EXIT

if [ "$BUILD_FIRST" = "1" ]; then npm run build; fi

npm run start -- -p "$PORT" &
PID=$!

for i in $(seq 1 30); do
  curl -s -o /dev/null "http://localhost:$PORT/" 2>/dev/null && break
  sleep 0.5
done

for route in / /bts-seo /nbhw-seo /api/data; do
  code=$(curl -s -o /tmp/smoke-body -w "%{http_code}" "http://localhost:$PORT$route")
  if [ "$code" = "200" ]; then
    echo "PASS  $route (200)"
    PASS=$((PASS + 1))
    if [ "$route" = "/api/data" ]; then
      if python3 -c "
import json, sys
d = json.load(open('/tmp/smoke-body'))
need = {'btsContent', 'btsSeo', 'btsStatus', 'projects'}
miss = need - set(d.keys())
if miss:
    print('FAIL  /api/data keys missing:', miss)
    sys.exit(1)
print('PASS  /api/data keys present')
"; then
        PASS=$((PASS + 1))
      else
        FAIL=$((FAIL + 1))
      fi
    fi
  elif [ "$code" = "401" ]; then
    if [ "$route" = "/api/data" ]; then
      echo "PASS  $route (401 auth protected, JSON skipped)"
    else
      echo "PASS  $route (401 auth working)"
    fi
    PASS=$((PASS + 1))
  else
    echo "FAIL  $route ($code)"
    FAIL=$((FAIL + 1))
  fi
done

rm -f /tmp/smoke-body
echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
