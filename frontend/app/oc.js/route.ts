/**
 * Serves the Umami tracker from our own domain with its collection endpoint
 * renamed: EasyPrivacy (used by Brave/uBlock) blocks any "/api/send" request
 * even on first-party domains, so we rewrite it to a neutral "/oc-data" path.
 */
const UPSTREAM = 'https://cloud.umami.is/script.js';

export async function GET() {
  const upstream = await fetch(UPSTREAM, { next: { revalidate: 86400 } });
  if (!upstream.ok) {
    return new Response('', { status: 204 });
  }
  const script = (await upstream.text()).replaceAll('/api/send', '/oc-data');
  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
