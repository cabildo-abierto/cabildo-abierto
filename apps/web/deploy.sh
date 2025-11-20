#!/bin/bash
set -euo pipefail

#############################################
# CONFIG
#############################################

SERVER_USER="root"
SERVER_IP="216.238.122.145"
ENV="${1:-prod}"

if [ "$ENV" = "prod" ]; then
  SYMLINK_PATH="/var/www/web"
  RELEASES_PATH="/var/www/releases/web"
  RELEASES_TO_KEEP=10
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.prod.js"
  NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"
else
  SYMLINK_PATH="/var/www/web-test"
  RELEASES_PATH="/var/www/releases/web-test"
  RELEASES_TO_KEEP=4
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.test.js"
  NEXT_PUBLIC_BACKEND_URL="https://test-api.cabildoabierto.ar"
fi

BLUE="\e[34m"
RESET="\e[0m"
echo_blue() { echo -e "${BLUE}$1${RESET}"; }

#############################################
# BUILD LOCALLY
#############################################

REPO_ROOT="$(dirname "$0")/../.."
cd "$REPO_ROOT"

echo_blue "📦 Installing dependencies..."
pnpm install

echo_blue "⚡ Building web (standalone)..."
export NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL"
pnpm turbo run build --filter=web

echo_blue "🧪 Running tests..."
CI=1 pnpm turbo run test --filter=web


#############################################
# SETUP REMOTE RELEASE DIR
#############################################

RELEASE_DIR_NAME=$(date '+%Y%m%d%H%M%S')
REMOTE_RELEASE_PATH="${RELEASES_PATH}/${RELEASE_DIR_NAME}"

echo_blue "📁 Creating remote release directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_RELEASE_PATH"

cp -r apps/web/public apps/web/.next/standalone/apps/web/public
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static

ssh $SERVER_USER@$SERVER_IP "
  mkdir -p $REMOTE_RELEASE_PATH/apps/web/.next/
"

echo_blue "⬆️ Uploading Next.js server files..."
rsync -avz \
  apps/web/.next/server \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH/apps/web/.next/

echo_blue "⬆️ Uploading standalone server files..."
# Copy everything from apps/web/.next/standalone/apps/web/* into release root
rsync -avz \
  apps/web/.next/standalone/ \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH/

#############################################
# CONFIG FILES
#############################################

echo_blue "⬆️ Uploading ecosystem"
rsync -avz \
  apps/web/$ECOSYSTEM_CONFIG_FILE \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH/

ssh $SERVER_USER@$SERVER_IP "
  cp $REMOTE_RELEASE_PATH/$ECOSYSTEM_CONFIG_FILE \
     $REMOTE_RELEASE_PATH/ecosystem.config.js
"

#############################################
# ACTIVATE RELEASE
#############################################

echo_blue "🔗 Switching symlink..."
ssh $SERVER_USER@$SERVER_IP "
  OLD=\$(readlink $SYMLINK_PATH || true)
  ln -sfn $REMOTE_RELEASE_PATH $SYMLINK_PATH

  cd $SYMLINK_PATH/${RELEASE_DIR_NAME}
  if ! pm2 reload ecosystem.config.js --env production; then
    echo '❌ Reload failed — rolling back'
    if [ -n \"\$OLD\" ] && [ -d \"\$OLD\" ]; then
      ln -sfn \"\$OLD\" $SYMLINK_PATH
    fi
    exit 1
  fi

  pm2 save
"

#############################################
# CLEAN OLD RELEASES
#############################################

echo_blue "🧹 Cleaning old releases..."
ssh $SERVER_USER@$SERVER_IP "
  cd $RELEASES_PATH && ls -t | tail -n +$(($RELEASES_TO_KEEP + 1)) | xargs -r rm -rf
"

echo_blue "🎉 Frontend deployed successfully!"
