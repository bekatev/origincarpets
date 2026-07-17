import type { NextRequest } from 'next/server';

/**
 * First-party collection endpoint for the Umami tracker (see app/oc.js/route.ts).
 * A plain Next.js rewrite would make Umami see every visitor as the server's IP
 * (wrong countries, merged visitors), so we forward the real client IP that
 * nginx passes via X-Real-IP / X-Forwarded-For — same approach as Umami's
 * official Cloudflare Worker proxy guide.
 */
const UPSTREAM = 'https://cloud.umami.is/api/send';

export async function POST(request: NextRequest) {
  // The site sits behind Cloudflare: cf-connecting-ip is the visitor's real IP.
  // X-Forwarded-For's FIRST entry is the original client; x-real-ip as set by
  // nginx would be the Cloudflare edge node, so it comes last.
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': request.headers.get('user-agent') ?? ''
  };
  if (clientIp) {
    headers['X-Forwarded-For'] = clientIp;
    headers['X-Real-IP'] = clientIp;
    headers['X-Client-IP'] = clientIp;
  }

  const upstream = await fetch(UPSTREAM, {
    method: 'POST',
    headers,
    body: await request.text(),
    cache: 'no-store'
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
