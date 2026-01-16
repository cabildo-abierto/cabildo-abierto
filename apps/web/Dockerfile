# ---------------------------------------------------------
# 1. Builder
# ---------------------------------------------------------
FROM node:20-alpine AS builder

RUN addgroup -S cabildo && adduser -S cabildo -G cabildo

RUN npm install -g pnpm

USER cabildo
WORKDIR /repo

COPY --chown=cabildo:cabildo package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY --chown=cabildo:cabildo apps ./apps
COPY --chown=cabildo:cabildo packages ./packages

ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN pnpm --filter web build


# ---------------------------------------------------------
# 2. Assembler
# ---------------------------------------------------------
FROM node:20-alpine AS assembler

WORKDIR /assemble

COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/public ./apps/web/public
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static


# ---------------------------------------------------------
# 3. Runner
# ---------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl

COPY --from=assembler /assemble ./

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
