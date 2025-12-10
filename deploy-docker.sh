#!/usr/bin/env bash
set -euo pipefail

#############################################
# CONFIG
#############################################

ENV=prod
TARGET="${1:-all}"   # all | frontend/web | backend

SERVER="deploy@64.176.19.176"
STACK_NAME="cabildo"
STACK_FILE="/opt/cabildo/docker-stack.yml"

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
    echo "Usage: $0 [all|frontend|web|backend]"
    exit 1
    ;;
esac

if [ "$ENV" = "prod" ]; then
  NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"
else
  NEXT_PUBLIC_BACKEND_URL="https://test-api.cabildoabierto.ar"
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

# Move to repo root (this script should be in repo root already,
# but this makes it robust if called from elsewhere)
cd "$(dirname "$0")"

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

if [ "$DEPLOY_WEB" -eq 1 ]; then
  echo "🏗  Building image for web…"
  docker build \
    -f apps/web/Dockerfile \
    --build-arg NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
    -t "${WEB_IMAGE_REPO}:prod-${GIT_SHA}" \
    -t "${WEB_IMAGE_REPO}:prod-latest" \
    .
fi

if [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "🏗  Building image for backend…"
  docker build \
    -f apps/backend/Dockerfile \
    --build-arg DEPLOY_ENV="$ENV" \
    -t "${BACKEND_IMAGE_REPO}:prod-${GIT_SHA}" \
    -t "${BACKEND_IMAGE_REPO}:prod-latest" \
    .
fi

#############################################
# PUSH IMAGES
#############################################

if [ "$DEPLOY_WEB" -eq 1 ]; then
  echo "⬆️  Pushing web image: ${WEB_IMAGE_REPO}:prod-${GIT_SHA}"
  docker push "${WEB_IMAGE_REPO}:prod-${GIT_SHA}"

  echo "⬆️  Pushing web image: ${WEB_IMAGE_REPO}:prod-latest"
  docker push "${WEB_IMAGE_REPO}:prod-latest"
fi

if [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "⬆️  Pushing backend image: ${BACKEND_IMAGE_REPO}:prod-${GIT_SHA}"
  docker push "${BACKEND_IMAGE_REPO}:prod-${GIT_SHA}"

  echo "⬆️  Pushing backend image: ${BACKEND_IMAGE_REPO}:prod-latest"
  docker push "${BACKEND_IMAGE_REPO}:prod-latest"
fi

echo ""
echo "🎉 Successfully built & pushed:"
[ "$DEPLOY_WEB" -eq 1 ] && echo "    ${WEB_IMAGE_REPO}:prod-${GIT_SHA}" && echo "    ${WEB_IMAGE_REPO}:prod-latest"
[ "$DEPLOY_BACKEND" -eq 1 ] && echo "    ${BACKEND_IMAGE_REPO}:prod-${GIT_SHA}" && echo "    ${BACKEND_IMAGE_REPO}:prod-latest"
echo ""

#############################################
# DEPLOY TO SERVER (SWARM)
#############################################

if [ "$DEPLOY_WEB" -eq 0 ] && [ "$DEPLOY_BACKEND" -eq 0 ]; then
  echo "Nothing selected to deploy. Exiting."
  exit 0
fi

echo "🚀 Deploying to production (${TARGET})…"

ssh "$SERVER" bash <<EOF
  set -euo pipefail

  DEPLOY_WEB=${DEPLOY_WEB}
  DEPLOY_BACKEND=${DEPLOY_BACKEND}

  echo "📦 Pulling latest images on server…"

  if [ "\$DEPLOY_WEB" -eq 1 ]; then
    docker pull "${WEB_IMAGE_REPO}:prod-latest"
  fi

  if [ "\$DEPLOY_BACKEND" -eq 1 ]; then
    docker pull "${BACKEND_IMAGE_REPO}:prod-latest"
  fi

  if [ "\$DEPLOY_WEB" -eq 1 ] || [ "\$DEPLOY_BACKEND" -eq 1 ]; then
    echo "🔄 Re-deploying stack: ${STACK_NAME}"
    docker stack deploy -c "${STACK_FILE}" "${STACK_NAME}"
  fi

  if [ "\$DEPLOY_WEB" -eq 1 ]; then
    echo "♻️ Updating service: ${STACK_NAME}_web"
    docker service update --force "${STACK_NAME}_web"
  fi

  if [ "\$DEPLOY_BACKEND" -eq 1 ]; then
    echo "♻️ Updating backend services: backend, worker, mirror"
    docker service update --force "${STACK_NAME}_backend"
    docker service update --force "${STACK_NAME}_worker"
    docker service update --force "${STACK_NAME}_mirror"
    # Uncomment if you add worker_mirror service:
    # docker service update --force "${STACK_NAME}_worker_mirror"
  fi

  echo "✅ Deployment on server complete."
EOF

echo ""
echo "🎉 Full deployment finished successfully!"
echo "    Version: ${GIT_SHA}"
echo "    Target:  ${TARGET}"
echo ""
