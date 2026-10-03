# ============================
# 1. Base
# ============================
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

# ============================
# 1. Prepare (Turbo Prune)
# ============================
FROM base AS prepare
RUN npm install -g turbo@2.10.12
COPY . .

RUN turbo prune backend --docker

# ============================
# 2. Builder
# ============================
FROM base AS builder

RUN npm install -g pnpm@10.22.0

COPY --from=prepare /repo/out/json/ .

RUN --mount=type=cache,id=pnpm-backend-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile

COPY --from=prepare /repo/out/full/ .
COPY tsconfig.base.json /repo/.

RUN pnpm -F @cabildo-abierto/api build
RUN pnpm -F @cabildo-abierto/utils build
RUN pnpm -F backend build
RUN pnpm --filter backend --prod deploy /runtime

# ============================
# 3. Runtime
# ============================
FROM base AS runner

RUN apt-get update && apt-get install -y --no-install-recommends curl poppler-utils libreoffice-writer fonts-noto fonts-liberation && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /runtime/node_modules ./node_modules
COPY --from=builder /runtime/package.json ./package.json
COPY --from=builder /runtime/dist ./dist
COPY --from=builder /runtime/schema ./schema

COPY --from=builder /repo/apps/backend/src/scripts/install-dataset-httpfs.mjs ./install-dataset-httpfs.mjs
RUN node install-dataset-httpfs.mjs

EXPOSE 8080
CMD ["node", "dist/index.js"]
