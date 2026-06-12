import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LANG_COOKIE } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

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
