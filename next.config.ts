import type { NextConfig } from "next";

/**
 * Security headers for every response. HSTS is left to the HTTPS reverse
 * proxy (see deploy/Caddyfile): sent over plain HTTP it would be ignored, and a
 * wrong value is hard to undo.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Local SVG placeholders are served through next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    // Sandbox SVGs served through the optimizer so they cannot run scripts.
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Hosts whose photos are optimized. Must match OPTIMIZED_HOSTS in
    // src/components/ui/Media.tsx; any other host is rendered unoptimized.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
