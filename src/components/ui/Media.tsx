"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Neutral LQIP for remote photos while they stream in. Inline data URL so it
 * costs no network round-trip; the colour matches the `mist` design token.
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%23f2f2f2'/%3E%3C/svg%3E";

type MediaProps = {
  /** Image URL. `null` renders the branded fallback surface instead. */
  src: string | null;
  /** Meaningful, localized description; "" only for decorative images. */
  alt: string;
  /** Responsive hint forwarded to next/image, e.g. "(max-width: 768px) 50vw, 25vw". */
  sizes: string;
  /**
   * CSS aspect ratio (e.g. "4/3"). When set, Media reserves its own box so the
   * layout cannot shift; when omitted, Media fills its positioned parent.
   */
  aspect?: string;
  /** Above-the-fold LCP images only: eager load + high fetch priority. */
  priority?: boolean;
  fit?: "cover" | "contain";
  /** object-position for the cover crop, e.g. "50% 30%". */
  position?: string;
  className?: string;
  /** Extra classes for the <img> itself (padding, hover transforms…). */
  imgClassName?: string;
  /** Overrides the branded fallback surface, e.g. for dark sections. */
  fallbackClassName?: string;
};

/**
 * The one way to render a photo. Reserves space (CLS ≈ 0), lazy-loads by
 * default, blurs in remote images and degrades to a clean branded surface —
 * never a technical grey placeholder — when there is no asset or it fails.
 */
export function Media({
  src,
  alt,
  sizes,
  aspect,
  priority = false,
  fit = "cover",
  position,
  className,
  imgClassName,
  fallbackClassName,
}: MediaProps) {
  // Track the failed URL (not a boolean) so a src change retries naturally.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src !== null && src !== failedSrc;

  return (
    <div
      className={cn(
        "overflow-hidden",
        aspect ? "relative" : "absolute inset-0",
        className,
      )}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailedSrc(src)}
          placeholder={src.startsWith("http") ? "blur" : undefined}
          blurDataURL={src.startsWith("http") ? BLUR_DATA_URL : undefined}
          className={cn(
            fit === "cover" ? "object-cover" : "object-contain",
            imgClassName,
          )}
          style={position ? { objectPosition: position } : undefined}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-mist to-stone",
            fallbackClassName,
          )}
        />
      )}
    </div>
  );
}
