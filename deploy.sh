#!/bin/bash
set -e # Si algo falla cortamos.

SERVER_USER="root"
SERVER_IP="216.238.122.145"
RELEASES_TO_KEEP=4
ENV="${1:-prod}" # Default to 'prod' if no argument is given

# --- Environment-Specific Variables ---
if [ "$ENV" = "prod" ]; then
  SYMLINK_PATH="/var/www/cabildo-abierto"
  RELEASES_PATH="/var/www/releases/cabildo-abierto"
  NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.prod.js"
else
  # Assuming 'test' environment for anything else
  SYMLINK_PATH="/var/www/test-cabildo-abierto"
  RELEASES_PATH="/var/www/releases/test-cabildo-abierto"
  NEXT_PUBLIC_BACKEND_URL="https://test-api.cabildoabierto.ar"
  ECOSYSTEM_CONFIG_FILE="ecosystem.config.test.js"
fi
# --- End of Variables ---

echo_blue() {
    echo -e "\e[34m$1\e[0m"
}

echo_blue "🚀 Deploying frontend to ${ENV} environment"

echo_blue "Building locally for ${ENV}..."

# Set the backend URL for the build process
export NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
npm run build

echo_blue "Running tests..."
npm test
echo_blue "✅ Tests passed! Proceeding with deployment."

RELEASE_DIR_NAME=$(date '+%Y%m%d%H%M%S')
REMOTE_RELEASE_PATH="${RELEASES_PATH}/${RELEASE_DIR_NAME}"

echo_blue "New release path will be: ${REMOTE_RELEASE_PATH}"

echo_blue "Creating release directory on server..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_RELEASE_PATH"

echo_blue "Uploading code..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.next/cache' \
  ./.next ./public ./next.config.js ./ecosystem.config.*.js ./package*.json \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH

# 6. Prepare the release on the server
echo_blue "Preparing release on server..."
ssh $SERVER_USER@$SERVER_IP "
  set -e
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  cd $REMOTE_RELEASE_PATH

  echo '>>> Installing dependencies...'
  npm ci --omit=dev --legacy-peer-deps

  echo '>>> Setting up ecosystem config for ${ENV}...'
  cp ./${ECOSYSTEM_CONFIG_FILE} ./ecosystem.config.js # Use the correct config file

  echo '>>> New release is ready!'
"

echo_blue "Activating new release..."
ssh $SERVER_USER@$SERVER_IP "ln -sfn $REMOTE_RELEASE_PATH $SYMLINK_PATH"

echo_blue "Reloading PM2 for ${ENV}..."
ssh $SERVER_USER@$SERVER_IP "
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  # cd into the correct symlinked directory for this environment
  cd $SYMLINK_PATH
  pm2 reload ecosystem.config.js --env production
"

echo_blue "Cleaning up old releases for ${ENV}..."
ssh $SERVER_USER@$SERVER_IP "
  cd $RELEASES_PATH && \
  ls -t | \
  tail -n +$(($RELEASES_TO_KEEP + 1)) | \
  xargs -r rm -rf
"

echo_blue "✅ Deployment successful for ${ENV}!"