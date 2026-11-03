import { readFile } from "node:fs/promises";
import path from "node:path";
import { MIME_BY_EXT, UPLOAD_NAME_PATTERN, uploadDir } from "@/lib/uploads";

type Ctx = { params: Promise<{ name: string }> };

/** GET /uploads/<uuid>.<ext> — serve an uploaded product photo. */
export async function GET(_request: Request, { params }: Ctx) {
  const { name } = await params;
  // Strict whitelist: server-generated names only, so no path traversal.
  if (!UPLOAD_NAME_PATTERN.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await readFile(path.join(uploadDir(), name));
    const ext = name.split(".").pop()!;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext],
        // Names are unique per upload, so the file never changes.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
