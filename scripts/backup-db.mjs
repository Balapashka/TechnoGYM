// Consistent backup of the SQLite database while the shop keeps running.
//
//   docker compose exec app node scripts/backup-db.mjs
//
// Writes /app/data/backups/shop-YYYY-MM-DD-HHMM.db (on the persistent volume)
// and keeps the 14 newest copies. Uses SQLite's VACUUM INTO, which produces a
// clean, self-contained copy even with writes in progress. Copy the backups
// off the server regularly (see ЗАПУСК-ПРОДАЖ.md).
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const dir = path.join(process.cwd(), "data", "backups");
const keep = Number(process.env.BACKUP_KEEP || 14);
mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
const file = path.join(dir, `shop-${stamp}.db`);

const prisma = new PrismaClient();
try {
  await prisma.$executeRawUnsafe(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
  console.log(`→ Backup written: ${file}`);
  const old = readdirSync(dir)
    .filter((f) => /^shop-.*\.db$/.test(f))
    .sort()
    .reverse()
    .slice(keep);
  for (const f of old) rmSync(path.join(dir, f));
} catch (e) {
  console.error("✗ Backup failed:", e?.message ?? e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
}
