# ---------------------------------------------------------
# 1. Builder
# ---------------------------------------------------------
FROM node:20-alpine AS builder

# Create user
RUN addgroup -S cabildo && adduser -S cabildo -G cabildo

# Install pnpm
RUN npm install -g pnpm

USER cabildo
WORKDIR /repo

# Copy root manifests
COPY --chown=cabildo:cabildo package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy monorepo packages
COPY --chown=cabildo:cabildo apps ./apps
COPY --chown=cabildo:cabildo packages ./packages

ENV NODE_ENV=production

# Install dependencies (pnpm will dedupe workspace deps properly)
RUN pnpm install --frozen-lockfile

# Build the Next.js app (MUST have output: 'standalone' in apps/web/next.config.js)
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN pnpm --filter web build


# ---------------------------------------------------------
# 2. Assembler (collect exactly what Next.js standalone produced)
# ---------------------------------------------------------
FROM node:20-alpine AS assembler

WORKDIR /assemble

# Copy full standalone directory (contains server.js + real node_modules)
COPY --from=builder /repo/apps/web/.next/standalone ./

# Copy static assets required at runtime
COPY --from=builder /repo/apps/web/public ./apps/web/public
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static


# ---------------------------------------------------------
# 3. Runner (production image)
# ---------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl

# Copy prepared bundle
COPY --from=assembler /assemble ./

# Run as non-root
USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
