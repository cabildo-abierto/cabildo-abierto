#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "$REPO_ROOT"

DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-${REPO_ROOT}/infra/env/deploy.dev.env}"
if [ ! -f "$DEPLOY_ENV_FILE" ]; then
  echo "Missing $DEPLOY_ENV_FILE. Copy infra/env/deploy.dev.env.example and fill it in."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV_FILE"
set +a

DEPLOY_SERVER="${DEPLOY_SERVER:-}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-}"
CONTAINER_REGISTRY_USER="${CONTAINER_REGISTRY_USER:-}"
CONTAINER_REGISTRY_PASSWORD="${CONTAINER_REGISTRY_PASSWORD:-${VULTR_API_KEY:-}}"
REMOTE_STACK_ROOT="${REMOTE_STACK_ROOT:-/opt/cabildo-dev}"
DEV_PUBLIC_URL="${DEV_PUBLIC_URL:-https://dev.cabildoabierto.ar}"

for variable_name in DEPLOY_SERVER CONTAINER_REGISTRY CONTAINER_REGISTRY_USER CONTAINER_REGISTRY_PASSWORD; do
  if [ -z "${!variable_name:-}" ]; then
    echo "Missing required variable: ${variable_name}"
    exit 1
  fi
done

if [ ! -f infra/env/web.dev.env ] || [ ! -f infra/env/backend.dev.env ]; then
  echo "Create infra/env/web.dev.env and infra/env/backend.dev.env from their .example files first."
  exit 1
fi

DIRTY="$(git status --porcelain)"
if [ -n "$DIRTY" ]; then
  echo "WARNING: deploying with uncommitted changes."
  read -rp "Continue? (y/N) " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

GIT_SHA="$(git rev-parse --short HEAD)"
WEB_IMAGE="${CONTAINER_REGISTRY}/web"
BACKEND_IMAGE="${CONTAINER_REGISTRY}/backend"

echo "==> Logging into the container registry"
echo "$CONTAINER_REGISTRY_PASSWORD" | docker login "$CONTAINER_REGISTRY" -u "$CONTAINER_REGISTRY_USER" --password-stdin

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

if [ "${SKIP_TESTS:-0}" != "1" ]; then
  echo "==> Running web and backend tests"
  pnpm --filter web test
  CI=1 pnpm --filter backend test
fi

echo "==> Building images"
docker build \
  -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_BACKEND_URL="${DEV_PUBLIC_URL}/api" \
  --build-arg NEXT_PUBLIC_WEB_VIEW=app \
  -t "${WEB_IMAGE}:dev-${GIT_SHA}" \
  -t "${WEB_IMAGE}:dev-latest" \
  .

docker build \
  -f apps/backend/Dockerfile \
  --build-arg DEPLOY_ENV=dev \
  -t "${BACKEND_IMAGE}:dev-${GIT_SHA}" \
  -t "${BACKEND_IMAGE}:dev-latest" \
  .

echo "==> Pushing images"
docker push "${WEB_IMAGE}:dev-${GIT_SHA}"
docker push "${WEB_IMAGE}:dev-latest"
docker push "${BACKEND_IMAGE}:dev-${GIT_SHA}"
docker push "${BACKEND_IMAGE}:dev-latest"

echo "==> Copying isolated development infrastructure"
ssh "$DEPLOY_SERVER" "mkdir -p '${REMOTE_STACK_ROOT}/infra/compose' /etc/cabildo"
rsync -az infra/compose/docker-compose.dev.yml "${DEPLOY_SERVER}:${REMOTE_STACK_ROOT}/infra/compose/"
rsync -az infra/env/web.dev.env infra/env/backend.dev.env "${DEPLOY_SERVER}:/etc/cabildo/"
ssh "$DEPLOY_SERVER" "chmod 600 /etc/cabildo/web.dev.env /etc/cabildo/backend.dev.env"

echo "==> Deploying development services"
ssh "$DEPLOY_SERVER" \
  "CONTAINER_REGISTRY='${CONTAINER_REGISTRY}' docker compose -f '${REMOTE_STACK_ROOT}/infra/compose/docker-compose.dev.yml' pull && CONTAINER_REGISTRY='${CONTAINER_REGISTRY}' docker compose -f '${REMOTE_STACK_ROOT}/infra/compose/docker-compose.dev.yml' up -d --remove-orphans"

echo "Deployed ${GIT_SHA} to ${DEV_PUBLIC_URL}"
