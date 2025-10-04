#!/bin/bash
set -e # Si algo falla cortamos.

SERVER_USER="root"
SERVER_IP="216.238.122.145"
SYMLINK_PATH="/var/www/cabildo-abierto"
RELEASES_PATH="/var/www/releases/cabildo-abierto"
RELEASES_TO_KEEP=4
ENV="${1:-prod}"

echo_blue() {
    echo -e "\e[34m$1\e[0m"
}

echo_blue "Deploying frontend to ${ENV} environment"

echo_blue "Building locally..."

export NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"
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
  ./.next ./public ./next.config.js ./ecosystem.config.prod.js ./ecosystem.config.test.js ./package*.json \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH

# 6. Prepare the release on the server (Install dependencies, set up configs)
echo_blue "Preparing release on server..."
ssh $SERVER_USER@$SERVER_IP "
  set -e
  # Make sure Node/NPM are in the PATH
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH

  # Navigate to the new release directory
  cd $REMOTE_RELEASE_PATH

  echo '>>> Installing dependencies...'
  npm ci --omit=dev --legacy-peer-deps

  echo '>>> Setting up ecosystem config...'
  if [ "$ENV" = "prod" ]; then
    cp ./ecosystem.config.prod.js ./ecosystem.config.js
  else
    cp ./ecosystem.config.test.js ./ecosystem.config.js
  fi

  echo '>>> New release is ready!'
"

echo_blue "Activating new release..."
ssh $SERVER_USER@$SERVER_IP "ln -sfn $REMOTE_RELEASE_PATH $SYMLINK_PATH"

echo_blue "Reloading PM2..."
ssh $SERVER_USER@$SERVER_IP "
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  # cd into the symlinked directory to ensure PM2 uses the correct path context
  cd $SYMLINK_PATH
  pm2 reload ecosystem.config.js --env production
"

echo_blue "Cleaning up old releases..."
ssh $SERVER_USER@$SERVER_IP "
  cd $RELEASES_PATH && \
  ls -t | \
  tail -n +$(($RELEASES_TO_KEEP + 1)) | \
  xargs -r rm -rf
"

echo_blue "✅ Deployment successful!"