/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typedRoutes: true,
  // First-party proxy for Umami so ad-blockers (Brave, uBlock) don't drop it.
  // /oc.js is served by app/oc.js/route.ts with the endpoint renamed to /oc-data,
  // because EasyPrivacy blocks any "/api/send" path even on first-party domains.
  async rewrites() {
    return [{ source: "/oc-data", destination: "https://cloud.umami.is/api/send" }];
  },
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
