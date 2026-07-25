// Idempotently ensure the demo accounts exist on every startup.
// This runs regardless of whether the catalog is already seeded, so login
// works natively even on an old database volume that predates these accounts.
// No settings or volume reset are needed.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const accounts = [
  { email: "admin@movigym.test", name: "Store Admin", password: "admin1234", role: "ADMIN" },
  { email: "demo@movigym.test", name: "Demo User", password: "demo1234", role: "USER" },
];

try {
  for (const a of accounts) {
    const hash = await bcrypt.hash(a.password, 10);
    // Reset password + role every start so the documented credentials always work.
    await prisma.user.upsert({
      where: { email: a.email },
      update: { password: hash, role: a.role, name: a.name },
      create: { email: a.email, name: a.name, password: hash, role: a.role },
    });
  }
  console.log("→ Demo accounts ensured (admin@movigym.test / demo@movigym.test).");
} catch (e) {
  console.error("Could not ensure demo accounts:", e?.message ?? e);
} finally {
  await prisma.$disconnect().catch(() => {});
}
