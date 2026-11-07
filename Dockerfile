# ---- Builder: install deps and build the Next.js app ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# OpenSSL is required by the Prisma engine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# `.env` is excluded from the build context, so give Prisma a datasource URL at
# build time too — `prisma generate` and `next build` both resolve it.
ENV DATABASE_URL="file:/app/data/dev.db"

# Copy manifest + prisma schema first so the `postinstall` prisma generate works
# and dependency installation stays cached.
COPY package.json package-lock.json ./
COPY prisma ./prisma
# The server's network to the npm registry can be slow and drop connections:
# generous retries, up to three full attempts, and a cache mount so a retry
# (or the next deploy) does not download everything again.
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 6 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000 \
 && for attempt in 1 2 3; do \
      npm ci --no-audit --no-fund && break; \
      echo "npm ci failed (attempt $attempt), retrying in 20s..."; sleep 20; \
    done \
 && test -x node_modules/.bin/next

COPY . .
# Build-time setting (inlined into the browser bundle), see .env.example.
ARG NEXT_PUBLIC_INSTALLMENT_MONTHS=0
ENV NEXT_PUBLIC_INSTALLMENT_MONTHS=$NEXT_PUBLIC_INSTALLMENT_MONTHS
RUN npm run build

# ---- Runner: smaller image that runs migrations + the server ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Database path on the mounted volume (see docker-compose.yml). Keeping the
# SQLite file out of /app means `docker compose down` no longer wipes the data.
ENV DATABASE_URL="file:/app/data/dev.db"

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Mount point for the data volume (database, uploaded photos, backups);
# created here so the app can write even without a volume (plain `docker run`).
RUN mkdir -p /app/data/uploads /app/data/backups

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
