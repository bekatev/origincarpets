import type { NextRequest } from 'next/server';

/**
 * First-party collection endpoint for the Umami tracker (see app/oc.js/route.ts).
 *
 * Umami Cloud sits behind its own Cloudflare, which stamps every proxied request
 * with OUR server's IP (cf-connecting-ip has top priority there) — that would
 * record all visitors as one country. Two official escape hatches fix this:
 *   1. `payload.ip` in the request body overrides all header detection AND
 *      forces a MaxMind geo lookup on that exact IP (correct country/city).
 *   2. The `x-umami-client-ip` header is checked first in cloud mode.
 */
const UPSTREAM = 'https://cloud.umami.is/api/send';

function resolveClientIp(request: NextRequest): string {
  // Site is behind Cloudflare: cf-connecting-ip is the visitor's real IP.
  // X-Forwarded-For's first entry is the original client; nginx's x-real-ip
  // would be the Cloudflare edge node, so it comes last.
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  );
}

export async function POST(request: NextRequest) {
  const clientIp = resolveClientIp(request);
  let body = await request.text();

  if (clientIp) {
    try {
      const parsed = JSON.parse(body) as { payload?: Record<string, unknown> };
      if (parsed?.payload && typeof parsed.payload === 'object' && !parsed.payload.ip) {
        parsed.payload.ip = clientIp;
        body = JSON.stringify(parsed);
      }
    } catch {
      // Malformed body — forward as-is, Umami will reject it.
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': request.headers.get('user-agent') ?? ''
  };
  if (clientIp) {
    headers['x-umami-client-ip'] = clientIp;
    headers['X-Forwarded-For'] = clientIp;
  }

  const upstream = await fetch(UPSTREAM, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store'
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
  });
}
