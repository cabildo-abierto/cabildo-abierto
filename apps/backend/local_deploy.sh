#!/bin/bash
set -e

SERVER_USER="root"
SERVER_IP="216.238.122.145"
ENV="${1:-prod}"

if [ "$ENV" = "prod" ]; then
  SYMLINK_PATH="/var/www/backend"
  RELEASES_PATH="/var/www/releases/backend"
  RELEASES_TO_KEEP=10
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.prod.cjs"
else
  SYMLINK_PATH="/var/www/backend-test"
  RELEASES_PATH="/var/www/releases/backend-test"
  RELEASES_TO_KEEP=4
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.test.cjs"
fi

echo_blue() { echo -e "\e[34m$1\e[0m"; }

echo_blue "🚀 Deploying backend (apps/backend) using pnpm deploy"

# Move to repo root
REPO_ROOT="$(dirname "$0")/../.."
cd "$REPO_ROOT"

echo_blue "📦 Installing workspace dependencies..."
pnpm install

echo_blue "⚡ Building backend..."
pnpm turbo run build --filter=backend

echo_blue "🧪 Running tests..."
CI=1 pnpm turbo run test --filter=backend

# Build portable backend via pnpm deploy
DEPLOY_OUT="/tmp/backend-deploy-$(date '+%Y%m%d%H%M%S')"
echo_blue "📦 Creating portable backend package at $DEPLOY_OUT"
rm -rf "$DEPLOY_OUT"
pnpm deploy --filter backend "$DEPLOY_OUT"

cp $ECOSYSTEM_CONFIG_FILE "$DEPLOY_OUT/ecosystem.config.cjs"