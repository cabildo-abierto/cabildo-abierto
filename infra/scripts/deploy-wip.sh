#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "$REPO_ROOT"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-${REPO_ROOT}/infra/env/deploy.env}"
if [ -f "$DEPLOY_ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
  set +a
fi

: "${DEPLOY_SERVER:?Missing DEPLOY_SERVER}"
: "${CONTAINER_REGISTRY:?Missing CONTAINER_REGISTRY}"
: "${CONTAINER_REGISTRY_USER:?Missing CONTAINER_REGISTRY_USER}"
CONTAINER_REGISTRY_PASSWORD="${CONTAINER_REGISTRY_PASSWORD:-${VULTR_API_KEY:-}}"
: "${CONTAINER_REGISTRY_PASSWORD:?Missing CONTAINER_REGISTRY_PASSWORD}"

# This app is intentionally deployable from the current working tree on v2.
# A unique tag also distinguishes builds made without a new commit.
BUILD_ID="$(git rev-parse --short HEAD)-$(date -u +%Y%m%d%H%M%S)-${RANDOM}"
IMAGE_REPO="${CONTAINER_REGISTRY}/wip"
IMAGE="${IMAGE_REPO}:${BUILD_ID}"
REMOTE_WIP_ROOT="${REMOTE_STACK_ROOT:-/opt/cabildo}/wip"
if [[ ! "$REMOTE_WIP_ROOT" =~ ^/[a-zA-Z0-9_./-]+$ ]] || [[ ! "$IMAGE" =~ ^[a-zA-Z0-9_./:-]+$ ]] || [[ ! "$CONTAINER_REGISTRY_USER" =~ ^[a-zA-Z0-9_.@-]+$ ]]; then
  echo "Invalid WIP deployment path or image reference." >&2
  exit 1
fi

printf '%s' "$CONTAINER_REGISTRY_PASSWORD" | docker login "$CONTAINER_REGISTRY" -u "$CONTAINER_REGISTRY_USER" --password-stdin
docker build -f apps/wip/Dockerfile -t "$IMAGE" -t "${IMAGE_REPO}:latest" .
docker push "$IMAGE"
docker push "${IMAGE_REPO}:latest"

# Transfer only this manifest. Never sync or prune the application's infra.
ssh "$DEPLOY_SERVER" "mkdir -p '${REMOTE_WIP_ROOT}'"
scp infra/stack/docker-stack.wip.yml "${DEPLOY_SERVER}:${REMOTE_WIP_ROOT}/docker-stack.yml"
# Authenticate remotely without writing credentials into the manifest or output.
printf '%s' "$CONTAINER_REGISTRY_PASSWORD" | ssh "$DEPLOY_SERVER" \
  "docker login '${CONTAINER_REGISTRY}' -u '${CONTAINER_REGISTRY_USER}' --password-stdin"

ssh "$DEPLOY_SERVER" bash -s -- "$IMAGE" "$REMOTE_WIP_ROOT" <<'REMOTE'
set -euo pipefail
image="$1"
root="$2"
docker pull "$image"
# Resolve the pushed artifact, rather than asking Swarm to resolve a mutable tag.
export WIP_IMAGE
WIP_IMAGE=$(docker image inspect "$image" --format '{{index .RepoDigests 0}}')
if [ -z "$WIP_IMAGE" ]; then
  echo "Cannot resolve the WIP image digest." >&2
  exit 1
fi
if docker service inspect cabildo_web >/dev/null 2>&1; then
  docker service inspect cabildo_web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' > "$root/previous-image"
fi
# No --prune: Docmost and other services in the existing stack remain intact.
docker stack deploy --with-registry-auth --resolve-image never -c "$root/docker-stack.yml" cabildo
for ((attempt=0; attempt<90; attempt++)); do
  deployed=$(docker service inspect cabildo_web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}')
  state=$(docker service inspect cabildo_web --format '{{if .UpdateStatus}}{{.UpdateStatus.State}}{{end}}')
  if [[ "$state" = *rollback* || "$state" = "paused" ]]; then
    echo "WIP rollout failed: $state" >&2
    docker service ps cabildo_web --no-trunc
    exit 1
  fi
  replicas=$(docker service ls --filter name=cabildo_web --format '{{.Replicas}}')
  if [ "$deployed" = "$WIP_IMAGE" ] && [ "$replicas" = "1/1" ] && { [ "$state" = "completed" ] || [ -z "$state" ]; }; then
    if curl --fail --silent --max-time 5 http://127.0.0.1:3000/health | grep -qx ok; then
      printf '%s\n' "$WIP_IMAGE" > "$root/current-image"
      echo "WIP healthy: $WIP_IMAGE"
      exit 0
    fi
  fi
  sleep 2
done
echo "WIP did not become healthy within 180 seconds." >&2
docker service ps cabildo_web --no-trunc
exit 1
REMOTE

# WIP images are kept outside the web/backend retention policy. No global prune.
printf '\nWIP deployed successfully: %s\n' "$IMAGE"
