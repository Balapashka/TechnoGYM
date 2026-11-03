#!/bin/sh
set -e

mkdir -p /app/data/uploads /app/data/backups

echo "→ Applying database migrations..."
npx prisma migrate deploy

if node scripts/seed-if-empty.mjs; then
  echo "→ Catalog already present, skipping seed."
else
  echo "→ Empty database: loading the starter catalog..."
  npx prisma db seed
fi

# Test accounts with documented passwords: local demo only.
if [ "$DEMO_ACCOUNTS" = "true" ]; then
  echo "→ DEMO_ACCOUNTS=true: ensuring test accounts (do NOT use on a live store)..."
  node scripts/ensure-accounts.mjs
fi

# The real administrator, from ADMIN_EMAIL / ADMIN_PASSWORD.
node scripts/create-admin.mjs

echo "→ Starting Next.js server on port ${PORT:-3000}..."
exec npm run start -- --port "${PORT:-3000}" --hostname 0.0.0.0
