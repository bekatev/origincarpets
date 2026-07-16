import { getSiteUrl } from '@/lib/seo';

/**
 * Umami Cloud analytics — cookieless, GDPR-friendly (no consent banner needed).
 * Served through our own domain so ad-blockers that blacklist cloud.umami.is
 * don't drop the visits: /oc.js (route handler) posts to /oc-data (rewrite).
 * Renders nothing until NEXT_PUBLIC_UMAMI_WEBSITE_ID is configured.
 */
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '';

export function Analytics() {
  if (!UMAMI_WEBSITE_ID) return null;
  return (
    <script
      defer
      src="/oc.js"
      data-website-id={UMAMI_WEBSITE_ID}
      data-host-url={getSiteUrl()}
    />
  );
}
