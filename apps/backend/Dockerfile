# ============================
# 1. Base
# ============================
FROM node:20-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
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

RUN pnpm -F api build
RUN pnpm -F utils build
RUN pnpm -F backend build
RUN pnpm --filter backend --prod deploy /runtime

# ============================
# 3. Runtime
# ============================
FROM base AS runner

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /runtime/node_modules ./node_modules
COPY --from=builder /runtime/package.json ./package.json
COPY --from=builder /runtime/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]
