#!/bin/bash
set -e

SERVER_USER="root"
SERVER_IP="216.238.122.145"
ENV="${1:-prod}"

if [ "$ENV" = "prod" ]; then
  SYMLINK_PATH="/var/www/ca-server"
  RELEASES_PATH="/var/www/releases/ca-server"
  RELEASES_TO_KEEP=10
else
  SYMLINK_PATH="/var/www/ca-server-test"
  RELEASES_PATH="/var/www/releases/ca-server-test"
  RELEASES_TO_KEEP=4
fi

echo_blue() { echo -e "\e[34m$1\e[0m"; }

echo_blue "🚀 Deploying backend (apps/backend) using pnpm + turbo"

REPO_ROOT="$(dirname "$0")/../.."
cd "$REPO_ROOT"

echo_blue "📦 Installing root dependencies..."
pnpm install

echo_blue "⚡ Building backend..."
pnpm turbo run build --filter=backend

echo_blue "🧪 Running tests..."
pnpm turbo run test --filter=backend

RELEASE_DIR_NAME=$(date '+%Y%m%d%H%M%S')
REMOTE_RELEASE_PATH="${RELEASES_PATH}/${RELEASE_DIR_NAME}"

ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_RELEASE_PATH"

echo_blue "⬆️ Uploading backend build..."
rsync -avz \
  apps/backend/dist \
  apps/backend/public \
  apps/backend/package*.json \
  apps/backend/ecosystem.config.*.cjs \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH

ssh $SERVER_USER@$SERVER_IP "
  set -e
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  cd $REMOTE_RELEASE_PATH

  echo '${RELEASE_DIR_NAME}' > public/version.txt

  echo '📦 Installing production deps...'
  pnpm install --prod --filter ./

  if [ '$ENV' = 'prod' ]; then
    cp public/client-metadata.prod.json public/client-metadata.json
    cp ecosystem.config.prod.cjs ecosystem.config.cjs
  else
    cp public/client-metadata.test.json public/client-metadata.json
    cp ecosystem.config.test.cjs ecosystem.config.cjs
  fi
"

echo_blue "🔄 Activate release with rollback protection..."
ssh $SERVER_USER@$SERVER_IP "
  set -e
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH

  OLD=\$(readlink $SYMLINK_PATH || true)

  ln -sfn $REMOTE_RELEASE_PATH $SYMLINK_PATH
  cd $SYMLINK_PATH

  if ! pm2 reload ecosystem.config.cjs --env production; then
      echo '❌ Reload failed, rolling back...'
      if [ -n \"\$OLD\" ] && [ -d \"\$OLD\" ]; then
          ln -sfn \"\$OLD\" $SYMLINK_PATH
      fi
      exit 1
  fi

  pm2 save
"

echo_blue "🧹 Cleaning old releases..."
ssh $SERVER_USER@$SERVER_IP "
  cd $RELEASES_PATH && ls -t | tail -n +$(($RELEASES_TO_KEEP + 1)) | xargs -r rm -rf
"

echo_blue "✅ Backend deployment completed!"
