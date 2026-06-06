#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "$REPO_ROOT"

#############################################
# Check main
#############################################
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

BRANCH=$(git branch --show-current 2>/dev/null || echo "")
DIRTY=$(git status --porcelain)

# Check if up to date with origin/main
git fetch origin main >/dev/null 2>&1 || true
LOCAL_SHA=$(git rev-parse HEAD)
ORIGIN_SHA=$(git rev-parse origin/main 2>/dev/null || echo "")

NOT_LATEST=0
[ -n "$ORIGIN_SHA" ] && [ "$LOCAL_SHA" != "$ORIGIN_SHA" ] && NOT_LATEST=1

if [ "$BRANCH" != "main" ] || [ -n "$DIRTY" ] || [ "$NOT_LATEST" -eq 1 ]; then
  echo "⚠️  You are about to deploy from a non-standard git state:"
  [ "$BRANCH" != "main" ] && echo "   - branch: $BRANCH"
  [ -n "$DIRTY" ] && echo "   - uncommitted changes"
  [ "$NOT_LATEST" -eq 1 ] && echo "   - not at origin/main"

  echo ""
  read -rp "Continue anyway? (y/N) " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Deployment aborted."
    exit 1
  fi
fi

#############################################
# CONFIG
#############################################

ENV="${1:-prod}"        # prod | test
TARGET="${2:-all}"      # all | frontend | web | backend
PROFILE="${3:-full}"    # full | min

SERVER="deploy@64.176.19.176"
STACK_NAME="cabildo"
STACK_FILE="/opt/cabildo/infra/stack/docker-stack.full.yml"

REGISTRY="ewr.vultrcr.com/cabildo"
WEB_IMAGE_REPO="${REGISTRY}/web"
BACKEND_IMAGE_REPO="${REGISTRY}/backend"

# Decide what to deploy
DEPLOY_WEB=0
DEPLOY_BACKEND=0

case "$TARGET" in
  all)
    DEPLOY_WEB=1
    DEPLOY_BACKEND=1
    ;;
  frontend|web)
    DEPLOY_WEB=1
    ;;
  backend)
    DEPLOY_BACKEND=1
    ;;
  *)
    echo "Usage: $0 [prod|test] [all|frontend|web|backend] [full|min]"
    exit 1
    ;;
esac

if [ "$PROFILE" != "full" ] && [ "$PROFILE" != "min" ]; then
  echo "Usage: $0 [prod|test] [all|frontend|web|backend] [full|min]"
  exit 1
fi

if [ "$ENV" = "prod" ]; then
  STACK_NAME="cabildo"
  if [ "$PROFILE" = "min" ]; then
    STACK_FILE="/opt/cabildo/infra/stack/docker-stack.min.yml"
  else
    STACK_FILE="/opt/cabildo/infra/stack/docker-stack.full.yml"
  fi
  NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"
else
  STACK_NAME="cabildo-test"
  STACK_FILE="/opt/cabildo/infra/stack/docker-stack-test.full.yml"
  NEXT_PUBLIC_BACKEND_URL="https://test-api.cabildoabierto.ar"
fi

if [ "$PROFILE" = "min" ] && [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "❌ Backend deploy is not available with profile=min."
  exit 1
fi

if [ -z "${VULTR_API_KEY:-}" ]; then
  echo "❌ ERROR: Missing VULTR_API_KEY environment variable"
  exit 1
fi

#############################################
# LOGIN
#############################################

echo "🔐 Logging into Vultr Container Registry…"
echo "$VULTR_API_KEY" | docker login "$REGISTRY" -u 9cb96f39-c470-4144-92ba-24eac8b36a4f --password-stdin

#############################################
# PREP
#############################################

GIT_SHA=$(git rev-parse --short HEAD)

echo "🧹 Cleaning prune output before tests..."
rm -rf out

if [ "$DEPLOY_WEB" -eq 1 ] || [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "📦 Installing workspace dependencies with pnpm..."
  pnpm install
fi

#############################################
# TESTS
#############################################

if [ "$DEPLOY_WEB" -eq 1 ]; then
  echo "🧪 Running frontend tests (web)..."
  pnpm --filter web test
  echo "✅ Frontend tests passed"
fi

if [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "🧪 Running backend tests (backend)..."
  CI=1 pnpm --filter backend test
  echo "✅ Backend tests passed"
fi

#############################################
# BUILD IMAGES
#############################################

WEB_TAG="${ENV}-${GIT_SHA}"
WEB_LATEST="${ENV}-latest"

BACKEND_TAG="${ENV}-${GIT_SHA}"
BACKEND_LATEST="${ENV}-latest"

if [ "$DEPLOY_WEB" -eq 1 ]; then
  echo "🏗  Building image for web…"
  docker build \
    -f apps/web/Dockerfile \
    --build-arg NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
    -t "${WEB_IMAGE_REPO}:${WEB_TAG}" \
    -t "${WEB_IMAGE_REPO}:${WEB_LATEST}" \
    .
fi

if [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "🏗  Building image for backend…"
  docker build \
    -f apps/backend/Dockerfile \
    --build-arg DEPLOY_ENV="$ENV" \
    -t "${BACKEND_IMAGE_REPO}:${BACKEND_TAG}" \
    -t "${BACKEND_IMAGE_REPO}:${BACKEND_LATEST}" \
    .
fi

#############################################
# PUSH IMAGES
#############################################

if [ "$DEPLOY_WEB" -eq 1 ]; then
  echo "⬆️  Pushing web image: ${WEB_IMAGE_REPO}:${WEB_TAG}"
  docker push "${WEB_IMAGE_REPO}:${WEB_TAG}"

  echo "⬆️  Pushing web image: ${WEB_IMAGE_REPO}:${WEB_LATEST}"
  docker push "${WEB_IMAGE_REPO}:${WEB_LATEST}"
fi

if [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "⬆️  Pushing backend image: ${BACKEND_IMAGE_REPO}:${BACKEND_TAG}"
  docker push "${BACKEND_IMAGE_REPO}:${BACKEND_TAG}"

  echo "⬆️  Pushing backend image: ${BACKEND_IMAGE_REPO}:${BACKEND_LATEST}"
  docker push "${BACKEND_IMAGE_REPO}:${BACKEND_LATEST}"
fi

echo ""
echo "🎉 Successfully built & pushed:"
[ "$DEPLOY_WEB" -eq 1 ] && \
  echo "    ${WEB_IMAGE_REPO}:${WEB_TAG}" && \
  echo "    ${WEB_IMAGE_REPO}:${WEB_LATEST}"

[ "$DEPLOY_BACKEND" -eq 1 ] && \
  echo "    ${BACKEND_IMAGE_REPO}:${BACKEND_TAG}" && \
  echo "    ${BACKEND_IMAGE_REPO}:${BACKEND_LATEST}"
echo ""

#############################################
# DEPLOY TO SERVER (SWARM)
#############################################

if [ "$DEPLOY_WEB" -eq 0 ] && [ "$DEPLOY_BACKEND" -eq 0 ]; then
  echo "Nothing selected to deploy. Exiting."
  exit 0
fi

echo "🚀 Deploying (${ENV}/${PROFILE}) target=${TARGET}…"

ssh "$SERVER" bash <<EOF
  set -euo pipefail

  DEPLOY_WEB=${DEPLOY_WEB}
  DEPLOY_BACKEND=${DEPLOY_BACKEND}

  echo "📦 Pulling latest images on server…"

  if [ "\$DEPLOY_WEB" -eq 1 ]; then
    docker pull "${WEB_IMAGE_REPO}:${ENV}-latest"
  fi

  if [ "\$DEPLOY_BACKEND" -eq 1 ]; then
    docker pull "${BACKEND_IMAGE_REPO}:${ENV}-latest"
  fi

  if [ "\$DEPLOY_WEB" -eq 1 ] || [ "\$DEPLOY_BACKEND" -eq 1 ]; then
    echo "🔄 Re-deploying stack: ${STACK_NAME}"
    docker stack deploy --with-registry-auth -c "${STACK_FILE}" "${STACK_NAME}"
  fi

  echo "✅ Deployment on server complete."
EOF

echo ""
echo "🎉 Full deployment finished successfully!"
echo "    Version: ${GIT_SHA}"
echo "    Target:  ${TARGET}"
echo "    Profile: ${PROFILE}"
echo ""
