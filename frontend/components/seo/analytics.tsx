/**
 * Umami Cloud analytics — cookieless, GDPR-friendly (no consent banner needed).
 * Renders nothing until NEXT_PUBLIC_UMAMI_WEBSITE_ID is configured.
 */
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '';

export function Analytics() {
  if (!UMAMI_WEBSITE_ID) return null;
  return <script defer src={UMAMI_SRC} data-website-id={UMAMI_WEBSITE_ID} />;
}
