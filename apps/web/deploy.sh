#!/bin/bash
set -e

SERVER_USER="root"
SERVER_IP="216.238.122.145"
RELEASES_TO_KEEP=4
ENV="${1:-prod}"

if [ "$ENV" = "prod" ]; then
  SYMLINK_PATH="/var/www/cabildo-abierto"
  RELEASES_PATH="/var/www/releases/cabildo-abierto"
  NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.prod.js"
else
  SYMLINK_PATH="/var/www/test-cabildo-abierto"
  RELEASES_PATH="/var/www/releases/test-cabildo-abierto"
  NEXT_PUBLIC_BACKEND_URL="https://test-api.cabildoabierto.ar"
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.test.js"
fi

echo_blue() { echo -e "\e[34m$1\e[0m"; }

echo_blue "🚀 Deploying frontend (apps/web) using pnpm + turbo"

# Go to repo root
REPO_ROOT="$(dirname "$0")/../.."
cd "$REPO_ROOT"

echo_blue "Setting environment vars for build"
export NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

echo_blue "📦 Installing repo dependencies..."
pnpm install

echo_blue "⚡ Running turbo build for web..."
pnpm turbo run build --filter=web

echo_blue "🧪 Running tests..."
pnpm turbo run test --filter=web

# Create release folder
RELEASE_DIR_NAME=$(date '+%Y%m%d%H%M%S')
REMOTE_RELEASE_PATH="${RELEASES_PATH}/${RELEASE_DIR_NAME}"

echo_blue "📁 Creating release directory on server..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_RELEASE_PATH"

echo_blue "⬆️ Uploading built frontend..."
rsync -avz \
  apps/web/.next \
  apps/web/public \
  apps/web/next.config.js \
  apps/web/package*.json \
  apps/web/ecosystem.config.*.js \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH

echo_blue "📦 Installing production deps on server..."
ssh $SERVER_USER@$SERVER_IP "
  set -e
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  cd $REMOTE_RELEASE_PATH
  pnpm install --prod --filter ./
  cp $ECOSYSTEM_CONFIG_FILE ecosystem.config.js
"

echo_blue "🔄 Activating new release..."
ssh $SERVER_USER@$SERVER_IP "ln -sfn $REMOTE_RELEASE_PATH $SYMLINK_PATH"

echo_blue "♻️ Reloading PM2..."
ssh $SERVER_USER@$SERVER_IP "
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  cd $SYMLINK_PATH
  pm2 reload ecosystem.config.js --env production
"

echo_blue "🧹 Cleaning old releases..."
ssh $SERVER_USER@$SERVER_IP "
  cd $RELEASES_PATH && ls -t | tail -n +$(($RELEASES_TO_KEEP + 1)) | xargs -r rm -rf
"

echo_blue "✅ Frontend deployment completed!"
