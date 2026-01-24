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
RUN npm install -g turbo@^2
COPY . .

RUN turbo prune backend --docker

# ============================
# 2. Builder
# ============================
FROM base AS builder

RUN npm install -g pnpm@^10

COPY --from=prepare /repo/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=prepare /repo/out/full/ .
COPY tsconfig.base.json /repo/.

RUN pnpm -F utils build
RUN pnpm -F api build
RUN pnpm -F editor-core build
RUN pnpm -F backend build

# ============================
# 3. Runtime
# ============================
FROM base AS runner

RUN apk add --no-cache curl

COPY --from=builder /repo ./

RUN mkdir -p /repo/public

ARG DEPLOY_ENV=prod
RUN if [ "$DEPLOY_ENV" = "prod" ]; then \
      cp apps/backend/public/client-metadata.prod.json public/client-metadata.json ; \
    else \
      cp apps/backend/public/client-metadata.test.json public/client-metadata.json ; \
    fi

EXPOSE 8080
CMD ["node", "--import", "./apps/backend/dist/instrumentation.js", "apps/backend/dist/index.js"]
