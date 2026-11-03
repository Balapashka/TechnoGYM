import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { forbidUnlessAdmin } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, sniffImage, uploadDir, uploadPath } from "@/lib/uploads";

/**
 * POST /api/admin/uploads — store product photos (admin only).
 * multipart/form-data with one or more `files`; answers `{ urls: string[] }`.
 */
export async function POST(request: Request) {
  const forbidden = await forbidUnlessAdmin();
  if (forbidden) return forbidden;

  const form = await request.formData().catch(() => null);
  const files = form?.getAll("files").filter((f): f is File => f instanceof File) ?? [];
  if (files.length === 0 || files.length > 20) {
    return NextResponse.json({ error: "Attach 1–20 files" }, { status: 400 });
  }

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `${file.name}: file too large` }, { status: 413 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) {
      return NextResponse.json(
        { error: `${file.name}: only JPG, PNG or WebP` },
        { status: 415 },
      );
    }
    const name = `${randomUUID()}.${kind.ext}`;
    await writeFile(uploadPath(name), bytes);
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls }, { status: 201 });
}
