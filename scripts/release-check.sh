#!/usr/bin/env bash
set -euo pipefail

echo "=== Release Check ==="
echo ""

echo "Step 1/3: Input validation"
python3 scripts/check-inputs.py
echo ""

echo "Step 2/3: Production build"
npm run build
echo ""

echo "Step 3/3: Dashboard smoke check"
bash scripts/smoke-check.sh
echo ""

echo "=== All checks passed. Safe to push. ==="
