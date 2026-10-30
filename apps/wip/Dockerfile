FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.22.0
COPY apps/wip/package.json apps/wip/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-wip-store,target=/pnpm/store pnpm install --ignore-workspace --frozen-lockfile --store-dir /pnpm/store
COPY apps/wip/next.config.mjs apps/wip/postcss.config.mjs apps/wip/tsconfig.json ./
COPY apps/wip/src/ ./src/
COPY apps/wip/public/ ./public/
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runner
COPY apps/wip/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1
