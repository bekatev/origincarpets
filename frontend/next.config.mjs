/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typedRoutes: true,
  // First-party Umami proxy: /oc.js (app/oc.js/route.ts) renames the tracker's
  // endpoint to /oc-data (app/oc-data/route.ts), which forwards the real client
  // IP so geo stats stay correct. EasyPrivacy blocks "/api/send" even first-party.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "origincarpets.com" },
      { protocol: "https", hostname: "www.origincarpets.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" }
    ],
    formats: ["image/avif", "image/webp"],
    // Next 15 defaults to [75] only — anything else 400s the optimizer.
    qualities: [60, 68, 70, 72, 75, 80, 85, 90],
    // Prefer modern formats; keep source files web-sized so first paint stays fast.
    // Cap at 2048 — full-bleed carpets stay sharp without shipping 4K JPEGs on mobile.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30
  }
};

export default nextConfig;
