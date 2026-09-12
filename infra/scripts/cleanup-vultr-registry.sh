#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-${REPO_ROOT}/infra/env/deploy.env}"

if [ -f "$DEPLOY_ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV_FILE"
  set +a
fi

API_BASE="https://api.vultr.com/v2"
PAGE_SIZE=100
KEEP_ARTIFACTS="${REGISTRY_KEEP_ARTIFACTS:-5}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-}"
REGISTRY_NAME="${CONTAINER_REGISTRY##*/}"
DELETE_ALL=0

usage() {
  echo "Usage: $0 [--all]"
  echo "  --all  Delete every artifact from every repository in the configured registry."
}

case "${1:-}" in
  "") ;;
  --all) DELETE_ALL=1 ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

if [ "$#" -gt 1 ]; then
  usage >&2
  exit 2
fi

if [ -z "$REGISTRY_NAME" ]; then
  echo "Registry cleanup failed: CONTAINER_REGISTRY is not configured." >&2
  exit 1
fi

if [ -z "${VULTR_ACCOUNT_API_KEY:-}" ]; then
  echo "⚠️  Registry cleanup skipped: VULTR_ACCOUNT_API_KEY is not configured."
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "⚠️  Registry cleanup skipped: jq is not installed."
  exit 0
fi

if ! [[ "$KEEP_ARTIFACTS" =~ ^[1-9][0-9]*$ ]]; then
  echo "⚠️  Registry cleanup skipped: REGISTRY_KEEP_ARTIFACTS must be a positive integer."
  exit 0
fi

api_get() {
  local response
  local status


  response=$(curl --silent --show-error \
    --write-out $'\n%{http_code}' \
    -H "Authorization: Bearer ${VULTR_ACCOUNT_API_KEY}" \
    "$1")
  status="${response##*$'\n'}"
  response="${response%$'\n'*}"

  if [ "$status" = "401" ]; then
    echo "❌ Vultr API authentication failed (401)." >&2
    echo "   VULTR_ACCOUNT_API_KEY must be an account API key, not the registry login token." >&2
    echo "   Also verify that this computer's public IP is allowed in Vultr API Access Control." >&2
    return 1
  fi

  if [[ ! "$status" =~ ^2 ]]; then
    echo "❌ Vultr API request failed with HTTP ${status}: ${response}" >&2
    return 1
  fi

  printf '%s' "$response"
}

urlencode() {
  jq -nr --arg value "$1" '$value | @uri'
}

registries_json=$(api_get "${API_BASE}/registries?per_page=${PAGE_SIZE}")
registry_id=$(jq -r --arg name "$REGISTRY_NAME" \
  '[.registries[] | select(.name == $name)][0].id // empty' <<<"$registries_json")

if [ -z "$registry_id" ]; then
  echo "⚠️  Registry cleanup skipped: registry '${REGISTRY_NAME}' was not found."
  exit 0
fi

repositories_json=$(api_get "${API_BASE}/registry/${registry_id}/repositories?per_page=${PAGE_SIZE}")
deleted=0

if [ "$DELETE_ALL" -eq 1 ]; then
  echo "⚠️  This will permanently delete EVERY artifact from registry '${REGISTRY_NAME}'."
  echo "   This includes prod, test, dev, latest, SHA and manually tagged images."
  read -rp "Type '${REGISTRY_NAME}' to continue: " confirmation
  if [ "$confirmation" != "$REGISTRY_NAME" ]; then
    echo "Cleanup aborted."
    exit 1
  fi
  mapfile -t repository_images < <(jq -r '.repositories[].image' <<<"$repositories_json")
else
  mapfile -t repository_images < <(jq -r '
    [.repositories[] | select(
      .image == "web" or .image == "backend" or
      (.image | endswith("/web")) or (.image | endswith("/backend"))
    ) | .image] | unique[]
  ' <<<"$repositories_json")
fi

for repository_image in "${repository_images[@]}"; do

  if [ -z "$repository_image" ]; then
    continue
  fi

  encoded_image=$(urlencode "$repository_image")

  while true; do
    artifacts_json=$(api_get "${API_BASE}/registry/${registry_id}/repository/${encoded_image}/artifacts?per_page=${PAGE_SIZE}")

    if [ "$DELETE_ALL" -eq 1 ]; then
      mapfile -t stale_digests < <(jq -r '.artifacts[].digest' <<<"$artifacts_json")
    else
      # Only SHA-tagged deployment artifacts are candidates. Artifacts carrying
      # a latest tag or any unrecognized tag are deliberately preserved.
      mapfile -t stale_digests < <(jq -r --argjson keep "$KEEP_ARTIFACTS" '
        [.artifacts[]
          | .tag_names = [(.tags // [])[].name]
          | select((.tag_names | length) > 0)
          | select(all(.tag_names[]; test("^(dev|test|prod)-[0-9a-f]+$")))
          | .environment = (.tag_names[0] | capture("^(?<environment>dev|test|prod)-").environment)
        ]
        | group_by(.environment)[]
        | sort_by(.push_time) | reverse | .[$keep:][]?.digest
      ' <<<"$artifacts_json")
    fi

    if [ "${#stale_digests[@]}" -eq 0 ]; then
      break
    fi

    for digest in "${stale_digests[@]}"; do
      encoded_digest=$(urlencode "$digest")
      curl --fail --silent --show-error \
        -X DELETE \
        -H "Authorization: Bearer ${VULTR_ACCOUNT_API_KEY}" \
        "${API_BASE}/registry/${registry_id}/repository/${encoded_image}/artifact/${encoded_digest}"
      deleted=$((deleted + 1))
      echo "🗑️  Removed ${repository_image} artifact ${digest:0:19}…"
    done

    [ "$DELETE_ALL" -eq 1 ] || break
  done
done

echo "✅ Registry cleanup complete: ${deleted} old artifact(s) removed."
