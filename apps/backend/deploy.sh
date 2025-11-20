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
echo_blue "📦 Creating portable backend package..."
DEPLOY_OUT="/tmp/backend-deploy-$(date '+%Y%m%d%H%M%S')"
rm -rf "$DEPLOY_OUT"
pnpm deploy --filter backend "$DEPLOY_OUT"

# Create release folder on server
RELEASE_DIR_NAME=$(date '+%Y%m%d%H%M%S')
REMOTE_RELEASE_PATH="${RELEASES_PATH}/${RELEASE_DIR_NAME}"

ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_RELEASE_PATH"

echo_blue "⬆️ Uploading portable backend package..."
rsync -avz \
  "$DEPLOY_OUT/" \
  apps/backend/ecosystem.config.*.cjs \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH

echo_blue "📄 Finalizing config..."
ssh $SERVER_USER@$SERVER_IP "
  cd $REMOTE_RELEASE_PATH
  cp $ECOSYSTEM_CONFIG_FILE ecosystem.config.cjs

  echo '${RELEASE_DIR_NAME}' > public/version.txt

  if [ '$ENV' = 'prod' ]; then
    cp public/client-metadata.prod.json public/client-metadata.json
  else
    cp public/client-metadata.test.json public/client-metadata.json
  fi
"


echo_blue "🔗 Switching release..."
ssh $SERVER_USER@$SERVER_IP "
  OLD=\$(readlink $SYMLINK_PATH || true)
  ln -sfn $REMOTE_RELEASE_PATH $SYMLINK_PATH

  cd $SYMLINK_PATH/${RELEASE_DIR_NAME}
  if ! pm2 reload ecosystem.config.cjs --env production; then
    echo '❌ Reload failed — rolling back'
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
