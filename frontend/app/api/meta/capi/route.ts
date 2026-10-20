import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Meta Conversions API proxy.
 * Browser sends events here; we forward to Graph API with the server access token.
 * Dedup with the browser Pixel via the same `eventId`.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN?.trim() || '';
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE?.trim() || '';
const API_VERSION = 'v21.0';
const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Lead',
  'CompleteRegistration',
  'Purchase'
]);

type CapiBody = {
  eventName?: string;
  eventId?: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  customData?: Record<string, unknown>;
};

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function readCookie(req: NextRequest, name: string): string | undefined {
  return req.cookies.get(name)?.value;
}

export async function POST(req: NextRequest) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json({ ok: false, skipped: true, reason: 'not_configured' }, { status: 200 });
  }

  let body: CapiBody;
  try {
    body = (await req.json()) as CapiBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const eventName = body.eventName?.trim();
  const eventId = body.eventId?.trim();
  if (!eventName || !eventId) {
    return NextResponse.json({ ok: false, error: 'eventName_and_eventId_required' }, { status: 400 });
  }
  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, error: 'event_not_allowed' }, { status: 400 });
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const clientIp = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;
  const userAgent = req.headers.get('user-agent') || undefined;
  const fbp = readCookie(req, '_fbp');
  const fbc = readCookie(req, '_fbc');

  const userData: Record<string, string> = {};
  if (body.email && body.email.includes('@')) {
    userData.em = sha256(body.email);
  }
  if (body.phone) {
    const digits = body.phone.replace(/[^\d]/g, '');
    if (digits.length >= 8) {
      userData.ph = sha256(digits);
    }
  }
  if (body.firstName?.trim()) {
    userData.fn = sha256(body.firstName);
  }
  if (body.lastName?.trim()) {
    userData.ln = sha256(body.lastName);
  }
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: body.eventSourceUrl || undefined,
    user_data: userData,
    custom_data: body.customData || {}
  };

  const payload: Record<string, unknown> = {
    data: [event]
  };
  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, error: json },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, result: json });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'capi_request_failed'
      },
      { status: 502 }
    );
  }
}
