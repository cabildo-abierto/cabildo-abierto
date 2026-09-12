# ---------------------------------------------------------
# 1. Prepare the pruned web workspace
# ---------------------------------------------------------
FROM node:20-alpine AS prepare

WORKDIR /repo

RUN npm install -g turbo@2.10.12

COPY . .

RUN turbo prune web --docker


# ---------------------------------------------------------
# 2. Builder
# ---------------------------------------------------------
FROM node:20-alpine AS builder

RUN addgroup -g 1001 -S cabildo && adduser -u 1001 -S cabildo -G cabildo

RUN npm install -g pnpm@10.22.0

WORKDIR /repo

COPY --from=prepare --chown=cabildo:cabildo /repo/out/json/ ./

RUN chown cabildo:cabildo /repo

USER cabildo

RUN --mount=type=cache,id=pnpm-web-store-v2,target=/pnpm/store,uid=1001,gid=1001 \
    pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile

COPY --from=prepare --chown=cabildo:cabildo /repo/out/full/ ./

ENV NODE_ENV=production

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

ARG NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL

ARG NEXT_PUBLIC_WEB_VIEW=app
ENV NEXT_PUBLIC_WEB_VIEW=$NEXT_PUBLIC_WEB_VIEW

RUN mkdir -p apps/web/.next/cache

RUN --mount=type=cache,id=next-web-cache,target=/repo/apps/web/.next/cache,uid=1001,gid=1001 \
    pnpm --filter web build


# ---------------------------------------------------------
# 3. Assembler
# ---------------------------------------------------------
FROM node:20-alpine AS assembler

WORKDIR /assemble

COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/public ./apps/web/public
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static


# ---------------------------------------------------------
# 4. Runner
# ---------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl

COPY --from=assembler --chown=node:node /assemble ./

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
