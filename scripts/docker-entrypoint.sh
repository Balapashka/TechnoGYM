#!/bin/sh
set -e

echo "→ Applying database migrations..."
npx prisma migrate deploy

if node scripts/seed-if-empty.mjs; then
  echo "→ Database already seeded, skipping catalog seed."
else
  echo "→ Seeding database with mock catalog..."
  npx prisma db seed
fi

# Always ensure the demo accounts exist so login works as-is — even on an
# existing volume seeded before these accounts were added. No reset needed.
echo "→ Ensuring demo accounts..."
node scripts/ensure-accounts.mjs

echo "→ Starting Next.js server on port ${PORT:-3000}..."
exec npm run start -- --port "${PORT:-3000}" --hostname 0.0.0.0
