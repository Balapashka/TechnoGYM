import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local SVG placeholders are served through next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    // Allow common placeholder image hosts if real assets are swapped in.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
