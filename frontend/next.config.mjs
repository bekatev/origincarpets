/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typedRoutes: true,
  // First-party proxy for Umami so ad-blockers (Brave, uBlock) don't drop it.
  // Neutral paths on our own domain instead of cloud.umami.is.
  async rewrites() {
    return [
      { source: "/oc.js", destination: "https://cloud.umami.is/script.js" },
      { source: "/oc/api/send", destination: "https://cloud.umami.is/api/send" }
    ];
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
