# ============================
# 1. Turbo Prune Prereq Stage
# ============================
FROM node:20-alpine AS pruner
WORKDIR /repo

RUN npm install -g pnpm turbo && apk add --no-cache libc6-compat

COPY . .
RUN turbo prune --scope=backend --docker


# ============================
# 2. Builder Stage
# ============================
FROM node:20-alpine AS builder
WORKDIR /repo

# Needed for pnpm + some native deps
RUN npm install -g pnpm && apk add --no-cache libc6-compat

# Build args (your metadata toggle)
ARG DEPLOY_ENV=prod

# Bring in pruned workspace
COPY --from=pruner /repo/out/json/ .
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /repo/out/full/ .

# Install *only required* deps
RUN pnpm install --frozen-lockfile

# Build backend only
RUN pnpm -F backend build

# Ensure public dir exists in the pruned workspace
RUN mkdir -p apps/backend/public

# Select correct metadata file
RUN if [ "$DEPLOY_ENV" = "prod" ]; then \
      cp apps/backend/public/client-metadata.prod.json apps/backend/public/client-metadata.json ; \
    else \
      cp apps/backend/public/client-metadata.test.json apps/backend/public/client-metadata.json ; \
    fi


# ============================
# 3. Runtime Stage
# ============================
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl

# Copy backend dist, node_modules, public
COPY --from=builder /repo/apps/backend/dist ./dist
COPY --from=builder /repo/apps/backend/public ./public
COPY --from=builder /repo/apps/backend/package.json ./
COPY --from=builder /repo/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "dist/index.js"]
