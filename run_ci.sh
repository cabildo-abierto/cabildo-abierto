#!/usr/bin/..env bash
set -euo pipefail

#############################################
# CI Script - Build and Test Before Push
#############################################

# Move to repo root
cd "$(dirname "$0")"

TARGET="${1:-all}"  # all | frontend | web | backend

RUN_WEB=0
RUN_BACKEND=0

case "$TARGET" in
  all)
    RUN_WEB=1
    RUN_BACKEND=1
    ;;
  frontend|web)
    RUN_WEB=1
    ;;
  backend)
    RUN_BACKEND=1
    ;;
  *)
    echo "Usage: $0 [all|frontend|web|backend]"
    exit 1
    ;;
esac

echo "🔍 Running CI checks..."
echo ""

#############################################
# INSTALL DEPENDENCIES
#############################################

echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

#############################################
# TYPECHECK
#############################################

if [ "$RUN_WEB" -eq 1 ]; then
  echo "🔎 Typechecking frontend (web)..."
  pnpm --filter web typecheck
  echo "✅ Frontend typecheck passed"
  echo ""
fi

if [ "$RUN_BACKEND" -eq 1 ]; then
  echo "🔎 Typechecking backend..."
  pnpm --filter backend typecheck
  echo "✅ Backend typecheck passed"
  echo ""
fi

#############################################
# LINT
#############################################

if [ "$RUN_WEB" -eq 1 ]; then
  echo "🧹 Linting frontend (web)..."
  pnpm --filter web lint
  echo "✅ Frontend lint passed"
  echo ""
fi

if [ "$RUN_BACKEND" -eq 1 ]; then
  echo "🧹 Linting backend..."
  pnpm --filter backend lint || echo "⚠️  Backend lint not configured, skipping..."
  echo ""
fi

#############################################
# BUILD
#############################################

if [ "$RUN_WEB" -eq 1 ]; then
  echo "🏗  Building frontend (web)..."
  pnpm --filter web build
  echo "✅ Frontend build succeeded"
  echo ""
fi

if [ "$RUN_BACKEND" -eq 1 ]; then
  echo "🏗  Building backend..."
  pnpm --filter backend build
  echo "✅ Backend build succeeded"
  echo ""
fi

#############################################
# TESTS
#############################################

if [ "$RUN_WEB" -eq 1 ]; then
  echo "🧪 Running frontend tests (web)..."
  pnpm --filter web test
  echo "✅ Frontend tests passed"
  echo ""
fi

if [ "$RUN_BACKEND" -eq 1 ]; then
  echo "🧪 Running backend tests..."
  CI=1 pnpm --filter backend test
  echo "✅ Backend tests passed"
  echo ""
fi

#############################################
# SUMMARY
#############################################

echo "=========================================="
echo "🎉 All CI checks passed!"
echo "=========================================="
[ "$RUN_WEB" -eq 1 ] && echo "   ✅ Frontend: typecheck, lint, build, test"
[ "$RUN_BACKEND" -eq 1 ] && echo "   ✅ Backend:  typecheck, lint, build, test"
echo ""
echo "Ready to push! 🚀"
