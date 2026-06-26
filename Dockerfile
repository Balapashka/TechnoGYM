# syntax=docker/dockerfile:1

# ---- Builder: install deps and build the Next.js app ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# OpenSSL is required by the Prisma engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy manifest + prisma schema first so the `postinstall` prisma generate works
# and dependency installation stays cached.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

# ---- Runner: smaller image that runs migrations + the server ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy everything needed to run migrations, seed and `next start`.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/config ./config
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["sh", "scripts/docker-entrypoint.sh"]
