import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LANG_COOKIE, type Locale } from '@/lib/i18n';

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'ka';
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const langParam = request.nextUrl.searchParams.get('lang');

  // ?lang=en|ka makes hreflang URLs crawlable with the right language cookie.
  if (isLocale(langParam)) {
    response.cookies.set(LANG_COOKIE, langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
    return response;
  }

  if (!request.cookies.get(LANG_COOKIE)?.value) {
    response.cookies.set(LANG_COOKIE, DEFAULT_LOCALE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)']
};
