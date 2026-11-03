import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { forbidUnlessAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";
import { settingsSchema } from "@/schemas/settings";

/** PUT /api/admin/settings — save store contacts / legal details (admin only). */
export async function PUT(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settings", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await saveSettings(parsed.data);
  // Info pages are statically generated; refresh them with the new details.
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
