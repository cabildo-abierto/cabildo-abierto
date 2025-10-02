#!/bin/bash
SERVER_USER="root"
SERVER_IP="216.238.122.145"
APP_PATH="/var/www/cabildo-abierto"
ENV="${1:-test}"

echo_blue() {
    echo -e "\e[34m$1\e[0m"
}

echo_blue "deploying frontend env ${ENV}"

echo_blue "creating directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_PATH"

export NEXT_PUBLIC_BACKEND_URL="https://api.cabildoabierto.ar"

echo_blue "building locally..."
npm run build

echo_blue "uploading code..."
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  ./.next ./public ./next.config.js ./ecosystem.config.prod.js ./ecosystem.cofing.test.js ./package*.json \
  $SERVER_USER@$SERVER_IP:$APP_PATH

if [ "$ENV" = "prod" ]; then
  echo_blue "uploading prod metadata..."
  ssh $SERVER_USER@$SERVER_IP "
    cd $APP_PATH &&
    cp ./ecosystem.config.prod.js ./ecosystem.config.js
  "
else
  echo_blue "uploading test metadata..."
  ssh $SERVER_USER@$SERVER_IP "
    cd $APP_PATH &&
    cp ./ecosystem.config.test.js ./ecosystem.config.js
  "
fi

echo_blue "running ci..."
ssh $SERVER_USER@$SERVER_IP "
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH &&
  cd $APP_PATH &&
  npm ci --omit=dev --legacy-peer-deps
"

echo_blue "restarting pm2..."
ssh $SERVER_USER@$SERVER_IP "
  export PATH=/root/.nvm/versions/node/v22.19.0/bin:\$PATH &&
  cd $APP_PATH &&
  pm2 startOrReload ecosystem.config.js --env production
"