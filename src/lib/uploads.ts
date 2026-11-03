/**
 * Product photo uploads: validation helpers (pure) and the storage location.
 *
 * Files are stored outside `public/` — Next.js only serves `public/` files that
 * existed at build time — in UPLOAD_DIR (default `./data/uploads`; under
 * Docker that is /app/data/uploads on the persistent volume, next to the
 * database) and served by src/app/uploads/[name]/route.ts.
 */
import path from "node:path";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
}

export type ImageKind = { ext: "jpg" | "png" | "webp"; mime: string };

/** Detect an image by its magic bytes — the browser-supplied type is not trusted. */
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

/** Stored file names are server-generated: uuid + known extension. */
export const UPLOAD_NAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
