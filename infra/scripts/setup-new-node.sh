#!/usr/bin/env bash
set -euo pipefail

# One-time setup for a fresh Ubuntu VPS running:
# - Docker Swarm
# - Host nginx reverse proxy
# - Cabildo production stack by default, or the isolated development stack
#
# Run from repo root (or anywhere) with sudo:
#   sudo bash infra/scripts/setup-new-node.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
NODE_PROFILE="${NODE_PROFILE:-prod}"
if [ "$NODE_PROFILE" = "dev" ]; then
  DEFAULT_STACK_ROOT="/opt/cabildo-dev"
else
  DEFAULT_STACK_ROOT="/opt/cabildo"
fi
REMOTE_STACK_ROOT="${REMOTE_STACK_ROOT:-$DEFAULT_STACK_ROOT}"
STACK_NAME="${STACK_NAME:-cabildo}"
CONTAINER_REGISTRY="${CONTAINER_REGISTRY:-}"
CONTAINER_REGISTRY_USER="${CONTAINER_REGISTRY_USER:-}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo bash infra/scripts/setup-new-node.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Installing system packages"
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release ufw nginx

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker Engine"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "==> Enabling Docker service"
systemctl enable docker
systemctl start docker

if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
  echo "==> Initializing Docker Swarm"
  docker swarm init
fi

echo "==> Configuring firewall"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

if [ ! -f /swapfile ]; then
  echo "==> Creating 2G swap file"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Creating runtime directories"
mkdir -p "$REMOTE_STACK_ROOT"
if [ "$NODE_PROFILE" = "dev" ]; then
  mkdir -p "${REMOTE_STACK_ROOT}/env" "${REMOTE_STACK_ROOT}/infra/compose"
else
  mkdir -p /etc/cabildo
fi

echo "==> Installing nginx site config"
if [ "$NODE_PROFILE" = "dev" ]; then
  cp "${REPO_ROOT}/infra/nginx/sites-available/cabildo-dev" /etc/nginx/sites-available/cabildo-dev
  ln -sf /etc/nginx/sites-available/cabildo-dev /etc/nginx/sites-enabled/cabildo-dev
else
  cp "${REPO_ROOT}/infra/nginx/sites-available/cabildo" /etc/nginx/sites-available/cabildo
  ln -sf /etc/nginx/sites-available/cabildo /etc/nginx/sites-enabled/cabildo
  rm -f /etc/nginx/sites-enabled/default
fi

echo "==> Copying environment files"
if [ "$NODE_PROFILE" = "dev" ] && [ -f "${REPO_ROOT}/infra/env/web.dev.env" ] && [ -f "${REPO_ROOT}/infra/env/backend.dev.env" ]; then
  cp "${REPO_ROOT}/infra/env/web.dev.env" "${REMOTE_STACK_ROOT}/env/web.dev.env"
  cp "${REPO_ROOT}/infra/env/backend.dev.env" "${REMOTE_STACK_ROOT}/env/backend.dev.env"
  chmod 600 "${REMOTE_STACK_ROOT}/env/web.dev.env" "${REMOTE_STACK_ROOT}/env/backend.dev.env"
elif [ "$NODE_PROFILE" = "dev" ]; then
  echo "WARN: Missing infra/env/web.dev.env or infra/env/backend.dev.env. The deploy script can copy them later."
elif [ -f "${REPO_ROOT}/infra/env/web.env.prod" ]; then
  cp "${REPO_ROOT}/infra/env/web.env.prod" /etc/cabildo/web.env
else
  echo "WARN: Missing infra/env/web.env.prod (required)."
fi

if [ "$NODE_PROFILE" != "dev" ] && [ -f "${REPO_ROOT}/infra/env/docmost.env.prod" ]; then
  cp "${REPO_ROOT}/infra/env/docmost.env.prod" /etc/cabildo/docmost.env
elif [ "$NODE_PROFILE" != "dev" ]; then
  echo "WARN: Missing infra/env/docmost.env.prod (required for minimal stack)."
fi

if [ "$NODE_PROFILE" != "dev" ]; then
  chmod 600 /etc/cabildo/*.env 2>/dev/null || true
fi

echo "==> Validating nginx"
if [ "$NODE_PROFILE" = "dev" ]; then
  CERT_FILE="/etc/ssl/certs/cabildo-dev-origin.pem"
  KEY_FILE="/etc/ssl/private/cabildo-dev-origin.key"
else
  CERT_FILE="/etc/ssl/certs/cabildo-origin.pem"
  KEY_FILE="/etc/ssl/private/cabildo-origin.key"
fi
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  nginx -t
  systemctl enable nginx
  if [ "$NODE_PROFILE" = "dev" ]; then
    systemctl reload nginx
  else
    systemctl restart nginx
  fi
else
  echo "WARN: TLS cert/key not found yet, skipping nginx restart."
  echo "      Expected:"
  echo "      - $CERT_FILE"
  echo "      - $KEY_FILE"
fi

echo ""
echo "Node setup complete."
echo "Next steps:"
echo "1) Copy Cloudflare origin cert/key to:"
echo "   - $CERT_FILE"
echo "   - $KEY_FILE"
echo "2) Login Docker registry on this node:"
if [ -n "$CONTAINER_REGISTRY" ] && [ -n "$CONTAINER_REGISTRY_USER" ]; then
  echo "   echo \"\$CONTAINER_REGISTRY_PASSWORD\" | docker login ${CONTAINER_REGISTRY} -u ${CONTAINER_REGISTRY_USER} --password-stdin"
else
  echo "   echo \"\$CONTAINER_REGISTRY_PASSWORD\" | docker login \"\$CONTAINER_REGISTRY\" -u \"\$CONTAINER_REGISTRY_USER\" --password-stdin"
fi
if [ "$NODE_PROFILE" = "dev" ]; then
  echo "3) Deploy from your local checkout:"
  echo "   ./infra/scripts/deploy.sh dev all"
else
  echo "3) Deploy minimal stack:"
  echo "   CONTAINER_REGISTRY=\"\$CONTAINER_REGISTRY\" docker stack deploy -c ${REMOTE_STACK_ROOT}/infra/stack/docker-stack.min.yml ${STACK_NAME}"
fi
