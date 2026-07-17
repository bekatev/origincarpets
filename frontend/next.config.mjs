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
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" }
    ],
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
