#!/usr/bin/env bash
set -euo pipefail

# One-time setup for a fresh Ubuntu VPS running:
# - Docker Swarm
# - Host nginx reverse proxy
# - Minimal Cabildo stack (web + docmost)
#
# Run from repo root (or anywhere) with sudo:
#   sudo bash infra/scripts/setup-new-node.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

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
mkdir -p /opt/cabildo
mkdir -p /etc/cabildo

echo "==> Installing nginx site config"
cp "${REPO_ROOT}/infra/nginx/sites-available/cabildo" /etc/nginx/sites-available/cabildo
ln -sf /etc/nginx/sites-available/cabildo /etc/nginx/sites-enabled/cabildo
rm -f /etc/nginx/sites-enabled/default

echo "==> Copying environment files"
if [ -f "${REPO_ROOT}/infra/env/web.env.prod" ]; then
  cp "${REPO_ROOT}/infra/env/web.env.prod" /etc/cabildo/web.env
else
  echo "WARN: Missing infra/env/web.env.prod (required)."
fi

if [ -f "${REPO_ROOT}/infra/env/docmost.env.prod" ]; then
  cp "${REPO_ROOT}/infra/env/docmost.env.prod" /etc/cabildo/docmost.env
else
  echo "WARN: Missing infra/env/docmost.env.prod (required for minimal stack)."
fi

chmod 600 /etc/cabildo/*.env 2>/dev/null || true

echo "==> Validating nginx"
CERT_FILE="/etc/ssl/certs/cabildo-origin.pem"
KEY_FILE="/etc/ssl/private/cabildo-origin.key"
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
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
echo "   - /etc/ssl/certs/cabildo-origin.pem"
echo "   - /etc/ssl/private/cabildo-origin.key"
echo "2) Login Docker registry on this node:"
echo "   echo \"\$VULTR_API_KEY\" | docker login ewr.vultrcr.com/cabildo -u 9cb96f39-c470-4144-92ba-24eac8b36a4f --password-stdin"
echo "3) Deploy minimal stack:"
echo "   docker stack deploy -c /opt/cabildo/infra/stack/docker-stack.min.yml cabildo"
