// Create (or promote) the store administrator.
//
// Two ways to use it:
//
// 1. Automatically on every Docker start, from environment variables:
//      ADMIN_EMAIL=owner@example.ru  ADMIN_PASSWORD=<long password>
//    The account is created if missing and given the ADMIN role. An existing
//    password is NOT overwritten (so changing it on the site sticks), unless
//    ADMIN_RESET_PASSWORD=true is set for one start — the way to recover a
//    forgotten admin password.
//
// 2. By hand, to add another admin or reset a password:
//      docker compose exec app node scripts/create-admin.mjs owner@example.ru 'NewPassword123'
//    An explicit password on the command line always resets it.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [cliEmail, cliPassword] = process.argv.slice(2);
const email = (cliEmail ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = cliPassword ?? process.env.ADMIN_PASSWORD ?? "";
const forceReset = Boolean(cliPassword) || process.env.ADMIN_RESET_PASSWORD === "true";

if (!email) {
  console.log("→ ADMIN_EMAIL is not set — skipping administrator setup.");
  process.exit(0);
}
if (password.length < 10) {
  console.error("✗ ADMIN_PASSWORD must be at least 10 characters — administrator not created.");
  process.exit(cliEmail ? 1 : 0);
}

const prisma = new PrismaClient();
try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        name: "Администратор",
        password: await bcrypt.hash(password, 10),
        role: "ADMIN",
      },
    });
    console.log(`→ Administrator created: ${email}`);
  } else {
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        ...(forceReset ? { password: await bcrypt.hash(password, 10) } : {}),
      },
    });
    if (forceReset) await prisma.session.deleteMany({ where: { userId: existing.id } });
    console.log(
      `→ Administrator ensured: ${email}${forceReset ? " (password reset)" : ""}`,
    );
  }
} catch (e) {
  console.error("✗ Could not set up the administrator:", e?.message ?? e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
}
