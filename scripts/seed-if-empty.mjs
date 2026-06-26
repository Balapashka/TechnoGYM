// Exit 0 if the database already has products (skip seeding),
// exit 1 if it is empty (the entrypoint will then run the seed).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const count = await prisma.product.count();
  await prisma.$disconnect();
  process.exit(count > 0 ? 0 : 1);
} catch {
  // If the table does not exist yet, treat as empty.
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
}
