#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root: sudo bash infra/scripts/setup-dev-node.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

export DEBIAN_FRONTEND=noninteractive

echo "==> Installing system packages"
apt-get update
apt-get install -y ca-certificates curl gnupg nginx ufw

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker Engine and Compose"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

systemctl enable --now docker

echo "==> Configuring firewall"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

if [ ! -f /swapfile ]; then
  echo "==> Creating 2G swap"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

mkdir -p /opt/cabildo-dev/infra/compose /etc/cabildo

echo "==> Installing the isolated Nginx site"
cp "${REPO_ROOT}/infra/nginx/sites-available/cabildo-dev" /etc/nginx/sites-available/cabildo-dev
ln -sfn /etc/nginx/sites-available/cabildo-dev /etc/nginx/sites-enabled/cabildo-dev

CERT_FILE="/etc/ssl/certs/cabildo-dev-origin.pem"
KEY_FILE="/etc/ssl/private/cabildo-dev-origin.key"
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx
else
  echo "WARN: Nginx was installed but not reloaded because its TLS files are missing:"
  echo "  $CERT_FILE"
  echo "  $KEY_FILE"
fi

echo "Node setup complete. Copy the TLS and environment files, then run deploy-dev.sh locally."
