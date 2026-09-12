#!/usr/bin/env bash
set -euo pipefail

DEPLOY_STARTED_AT=$SECONDS
SSH_CONTROL_PATH="${TMPDIR:-/tmp}/cabildo-deploy-%C"
SSH_OPTS=(-o ControlMaster=auto -o ControlPersist=10m -o "ControlPath=${SSH_CONTROL_PATH}")

print_deploy_duration() {
  local elapsed=$((SECONDS - DEPLOY_STARTED_AT))
  printf '\n⏱  Total deploy time: %dm %ds\n' "$((elapsed / 60))" "$((elapsed % 60))"
}

trap print_deploy_duration EXIT

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "$REPO_ROOT"

#############################################
# LOAD LOCAL DEPLOY ENV
#############################################

DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-${REPO_ROOT}/infra/env/deploy.env}"

if [ -f "$DEPLOY_ENV_FILE" ]; then
  echo "📄 Loading deploy env: ${DEPLOY_ENV_FILE}"
  set -a
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
  set +a
fi

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

ENV="${1:-prod}"        # prod | test | dev
TARGET="${2:-all}"      # all | frontend | web | backend
PROFILE="${3:-full}"    # full | min
WEB_VIEW="${WEB_VIEW:-${4:-app}}" # app | wip

STACK_NAME="cabildo"
REMOTE_STACK_ROOT="${REMOTE_STACK_ROOT:-/opt/cabildo}"
STACK_FILE="${REMOTE_STACK_ROOT}/infra/stack/docker-stack.full.yml"

DEPLOY_SERVER="${DEPLOY_SERVER:-}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-}"
CONTAINER_REGISTRY_USER="${CONTAINER_REGISTRY_USER:-}"
CONTAINER_REGISTRY_PASSWORD="${CONTAINER_REGISTRY_PASSWORD:-${VULTR_API_KEY:-}}"

PROD_BACKEND_URL="${PROD_BACKEND_URL:-}"
TEST_BACKEND_URL="${TEST_BACKEND_URL:-}"
DEV_BACKEND_URL="${DEV_BACKEND_URL:-https://test.cabildoabierto.ar/api}"
PROD_FRONTEND_URL="${PROD_FRONTEND_URL:-https://cabildoabierto.ar}"
TEST_FRONTEND_URL="${TEST_FRONTEND_URL:-https://test.cabildoabierto.ar}"
DEV_FRONTEND_URL="${DEV_FRONTEND_URL:-https://test.cabildoabierto.ar}"

REGISTRY="$CONTAINER_REGISTRY"
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
    echo "Usage: $0 [prod|test|dev] [all|frontend|web|backend] [full|min] [app|wip]"
    exit 1
    ;;
esac

if [ "$PROFILE" != "full" ] && [ "$PROFILE" != "min" ]; then
  echo "Usage: $0 [prod|test|dev] [all|frontend|web|backend] [full|min] [app|wip]"
  exit 1
fi

if [ "$WEB_VIEW" != "app" ] && [ "$WEB_VIEW" != "wip" ]; then
  echo "Usage: $0 [prod|test|dev] [all|frontend|web|backend] [full|min] [app|wip]"
  exit 1
fi

if [ "$WEB_VIEW" = "wip" ]; then
  echo "ℹ️  WEB_VIEW=wip: forcing target=web and profile=min so backend is not deployed."
  TARGET="web"
  PROFILE="min"
  DEPLOY_WEB=1
  DEPLOY_BACKEND=0
fi

case "$ENV" in
  prod)
    STACK_NAME="cabildo"
    if [ "$PROFILE" = "min" ]; then
      STACK_FILE="${REMOTE_STACK_ROOT}/infra/stack/docker-stack.min.yml"
    else
      STACK_FILE="${REMOTE_STACK_ROOT}/infra/stack/docker-stack.full.yml"
    fi
    NEXT_PUBLIC_BACKEND_URL="$PROD_BACKEND_URL"
    NEXT_PUBLIC_FRONTEND_URL="$PROD_FRONTEND_URL"
    ;;
  test)
    STACK_NAME="cabildo-test"
    STACK_FILE="${REMOTE_STACK_ROOT}/infra/stack/docker-stack-test.full.yml"
    NEXT_PUBLIC_BACKEND_URL="$TEST_BACKEND_URL"
    NEXT_PUBLIC_FRONTEND_URL="$TEST_FRONTEND_URL"
    ;;
  dev)
    STACK_NAME="cabildo-dev"
    REMOTE_STACK_ROOT="${DEV_REMOTE_STACK_ROOT:-/opt/cabildo-dev}"
    STACK_FILE="${REMOTE_STACK_ROOT}/infra/compose/docker-compose.dev.yml"
    NEXT_PUBLIC_BACKEND_URL="$DEV_BACKEND_URL"
    NEXT_PUBLIC_FRONTEND_URL="$DEV_FRONTEND_URL"
    ;;
  *)
    echo "Usage: $0 [prod|test|dev] [all|frontend|web|backend] [full|min] [app|wip]"
    exit 1
    ;;
esac

if [ "$ENV" = "prod" ] && [ "$PROFILE" = "min" ] && [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "❌ Backend deploy is not available with profile=min."
  exit 1
fi

if [ -z "$DEPLOY_SERVER" ]; then
  echo "❌ ERROR: Missing DEPLOY_SERVER environment variable"
  exit 1
fi

if [ -z "$CONTAINER_REGISTRY" ]; then
  echo "❌ ERROR: Missing CONTAINER_REGISTRY environment variable"
  exit 1
fi

if [ -z "$CONTAINER_REGISTRY_USER" ]; then
  echo "❌ ERROR: Missing CONTAINER_REGISTRY_USER environment variable"
  exit 1
fi

if [ -z "$CONTAINER_REGISTRY_PASSWORD" ]; then
  echo "❌ ERROR: Missing CONTAINER_REGISTRY_PASSWORD environment variable"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_BACKEND_URL" ]; then
  if [ "$ENV" = "prod" ]; then
    echo "❌ ERROR: Missing PROD_BACKEND_URL environment variable"
  elif [ "$ENV" = "dev" ]; then
    echo "❌ ERROR: Missing DEV_BACKEND_URL environment variable"
  else
    echo "❌ ERROR: Missing TEST_BACKEND_URL environment variable"
  fi
  exit 1
fi

#############################################
# LOGIN
#############################################

echo "🔐 Logging into Vultr Container Registry…"
echo "$CONTAINER_REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$CONTAINER_REGISTRY_USER" --password-stdin

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

if [ "${SKIP_TESTS:-0}" = "1" ]; then
  echo "⚠️  Skipping tests because SKIP_TESTS=1"
else
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
    --build-arg NEXT_PUBLIC_FRONTEND_URL="$NEXT_PUBLIC_FRONTEND_URL" \
    --build-arg NEXT_PUBLIC_WEB_VIEW="$WEB_VIEW" \
    -t "${WEB_IMAGE_REPO}:${WEB_TAG}" \
    -t "${WEB_IMAGE_REPO}:${WEB_LATEST}" \
    .
fi

if [ "$DEPLOY_BACKEND" -eq 1 ]; then
  echo "🏗  Building image for backend…"
  docker build \
    -f apps/backend/Dockerfile \
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

if ! ssh "${SSH_OPTS[@]}" -O check "$DEPLOY_SERVER" >/dev/null 2>&1; then
  echo "🔐 Opening SSH connection…"
  ssh "${SSH_OPTS[@]}" -MNf "$DEPLOY_SERVER"
fi

echo "📤 Syncing infra files to server…"
ssh "${SSH_OPTS[@]}" "$DEPLOY_SERVER" "mkdir -p '${REMOTE_STACK_ROOT}/infra'"
rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude 'env/deploy.env' \
  --exclude 'env/*.env' \
  infra/ "${DEPLOY_SERVER}:${REMOTE_STACK_ROOT}/infra/"

if [ "$ENV" = "dev" ]; then
  if [ ! -f infra/env/web.dev.env ] || [ ! -f infra/env/backend.dev.env ]; then
    echo "❌ Missing infra/env/web.dev.env or infra/env/backend.dev.env"
    exit 1
  fi
  ssh "${SSH_OPTS[@]}" "$DEPLOY_SERVER" "mkdir -p '${REMOTE_STACK_ROOT}/env'"
  rsync -az -e "ssh ${SSH_OPTS[*]}" infra/env/web.dev.env infra/env/backend.dev.env "${DEPLOY_SERVER}:${REMOTE_STACK_ROOT}/env/"
  ssh "${SSH_OPTS[@]}" "$DEPLOY_SERVER" "chmod 600 '${REMOTE_STACK_ROOT}/env/web.dev.env' '${REMOTE_STACK_ROOT}/env/backend.dev.env'"
fi

ssh "${SSH_OPTS[@]}" "$DEPLOY_SERVER" bash <<EOF
  set -euo pipefail

  DEPLOY_WEB=${DEPLOY_WEB}
  DEPLOY_BACKEND=${DEPLOY_BACKEND}
  export CONTAINER_REGISTRY="${CONTAINER_REGISTRY}"

  if [ "${ENV}" = "dev" ]; then
    echo "📦 Pulling development images on server…"
    if [ "\$DEPLOY_WEB" -eq 1 ]; then
      CONTAINER_REGISTRY="${CONTAINER_REGISTRY}" REMOTE_STACK_ROOT="${REMOTE_STACK_ROOT}" docker compose -f "${STACK_FILE}" pull web
    fi
    if [ "\$DEPLOY_BACKEND" -eq 1 ]; then
      CONTAINER_REGISTRY="${CONTAINER_REGISTRY}" REMOTE_STACK_ROOT="${REMOTE_STACK_ROOT}" docker compose -f "${STACK_FILE}" pull backend
    fi
    CONTAINER_REGISTRY="${CONTAINER_REGISTRY}" REMOTE_STACK_ROOT="${REMOTE_STACK_ROOT}" docker compose -f "${STACK_FILE}" up -d --remove-orphans
    echo "✅ Development deployment on server complete."
  else
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
  fi

  if [ "${SKIP_NODE_CLEANUP:-0}" != "1" ]; then
    echo "🧹 Removing unused Docker data older than ${DOCKER_PRUNE_UNTIL:-168h} from the node…"
    docker image prune -af --filter "until=${DOCKER_PRUNE_UNTIL:-168h}" || true
    docker builder prune -af --filter "until=${DOCKER_PRUNE_UNTIL:-168h}" || true
  fi
EOF

ssh "${SSH_OPTS[@]}" -O exit "$DEPLOY_SERVER" >/dev/null 2>&1 || true

if [ "${SKIP_REGISTRY_CLEANUP:-0}" = "1" ]; then
  echo "⚠️  Skipping registry cleanup because SKIP_REGISTRY_CLEANUP=1"
elif ! "${SCRIPT_DIR}/cleanup-vultr-registry.sh"; then
  echo "⚠️  Registry cleanup failed; the deployment itself succeeded."
fi

echo ""
echo "🎉 Full deployment finished successfully!"
echo "    Version: ${GIT_SHA}"
echo "    Target:  ${TARGET}"
echo "    Profile: ${PROFILE}"
echo "    Web view: ${WEB_VIEW}"
echo ""
