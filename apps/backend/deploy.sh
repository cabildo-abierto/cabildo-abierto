#!/bin/bash
set -e

SERVER_USER="root"
SERVER_IP="216.238.122.145"
ENV="${1:-prod}"

if [ "$ENV" = "prod" ]; then
  RELEASES_PATH="/var/www/releases/ca-server"
  SYMLINK_PATH="/var/www/ca-server"
  RELEASES_TO_KEEP=10
else
  SYMLINK_PATH="/var/www/ca-server-test"
  RELEASES_PATH="/var/www/releases/ca-server-test"
  RELEASES_TO_KEEP=4
fi

echo_blue() {
    echo -e "\e[34m$1\e[0m"
}

echo_blue "Deploying backend to ${ENV} environment"

echo_blue "Building locally..."
npm run build --max-old-space-size=2048

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
  ./dist ./public ./ecosystem.config.prod.cjs ./ecosystem.config.test.cjs ./package*.json \
  $SERVER_USER@$SERVER_IP:$REMOTE_RELEASE_PATH

echo_blue "Preparing release on server..."
ssh $SERVER_USER@$SERVER_IP "
  set -e
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH
  cd $REMOTE_RELEASE_PATH

  echo '>>> Writing version file...'
  echo '${RELEASE_DIR_NAME}' > ./public/version.txt

  echo '>>> Installing dependencies...'
  npm ci --omit=dev --legacy-peer-deps

  echo '>>> Setting up environment-specific files...'
  if [ "$ENV" = "prod" ]; then
    cp ./public/client-metadata.prod.json ./public/client-metadata.json
    cp ./ecosystem.config.prod.cjs ./ecosystem.config.cjs
  else
    cp ./public/client-metadata.test.json ./public/client-metadata.json
    cp ./ecosystem.config.test.cjs ./ecosystem.config.cjs
  fi

  echo '>>> New release is ready!'
"

echo_blue "Activating new release with rollback protection..."
ssh $SERVER_USER@$SERVER_IP "
  set -e
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH

  # 1. (Remember) Get the path of the current release for rollback.
  OLD_RELEASE_PATH=\$(readlink ${SYMLINK_PATH} || true)
  echo \"Current release is: \$OLD_RELEASE_PATH\"
  echo \"New release is: ${REMOTE_RELEASE_PATH}\"

  # 2. Switch the symlink to point to the new code.
  echo '>>> Atomically switching symlink to new release...'
  ln -sfn ${REMOTE_RELEASE_PATH} ${SYMLINK_PATH}

  # 3. (FIX) Change into the application directory.
  echo '>>> Changing to application directory: ${SYMLINK_PATH}'
  cd ${SYMLINK_PATH}

  # 4. (Try) Attempt to reload services from the correct directory.
  echo '>>> Reloading PM2 services and waiting for readiness...'
  if ! pm2 reload ecosystem.config.cjs --env production; then
      # --- CATCH & ROLLBACK ---
      echo -e \"\e[31m❌ PM2 reload failed! Rolling back to previous release.\e[0m\"

      if [ -n \"\$OLD_RELEASE_PATH\" ] && [ -d \"\$OLD_RELEASE_PATH\" ]; then
          echo \"Reverting symlink to \$OLD_RELEASE_PATH...\"
          ln -sfn \"\$OLD_RELEASE_PATH\" ${SYMLINK_PATH}
          echo \"✅ Symlink rolled back successfully.\"
      else
          echo \"⚠️ No previous release to roll back to. Manual intervention may be needed.\"
      fi
      exit 1
  fi

  # --- SUCCESS ---
  echo '>>> New release is live and healthy!'
  pm2 save
"

# --- Final Cleanup ---
echo_blue "Cleaning up old releases..."
ssh $SERVER_USER@$SERVER_IP "
  cd $RELEASES_PATH && \
  ls -t | \
  tail -n +$(($RELEASES_TO_KEEP + 1)) | \
  xargs -r rm -rf
"

echo_blue "✅ Backend deployment successful! Release number ${RELEASE_DIR_NAME}"