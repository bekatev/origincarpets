import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { SiteHeader } from '@/components/layout/site-header';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { LANG_COOKIE, dictionaries, normalizeLocale } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Origin Carpets',
    template: '%s | Origin Carpets'
  },
  description: 'Finest Caucasian and Oriental Carpets',
  openGraph: {
    title: 'Origin Carpets',
    description: 'Finest Caucasian and Oriental Carpets',
    type: 'website',
    url: 'http://localhost:3000'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Origin Carpets',
    description: 'Finest Caucasian and Oriental Carpets'
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LANG_COOKIE)?.value);
  const dict = dictionaries[locale];

  return (
    <html lang={locale}>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} font-sans`}>
        <I18nProvider initialLocale={locale}>
          <CartProvider>
            <div className="border-b border-[var(--oc-line)] bg-[var(--oc-paper)]">
              <div className="oc-container flex min-h-10 items-center justify-center text-center">
                <p className="oc-kicker">{dict.topbar.shipping}</p>
              </div>
            </div>

            <SiteHeader />

            {children}

            <footer className="mt-10 border-t border-[var(--oc-line)] bg-[var(--oc-paper)]">
              <div className="oc-container grid gap-8 py-12 md:grid-cols-3">
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.12em]">Origin Carpets</p>
                  <p className="mt-3 max-w-sm text-sm text-[var(--oc-muted)]">{dict.footer.description}</p>
                </div>
                <div className="space-y-2 text-sm text-[var(--oc-muted)]">
                  <p className="oc-kicker">{dict.footer.shop}</p>
                  <Link href="/products" className="block hover:text-[var(--oc-ink)]">
                    {dict.footer.productCatalog}
                  </Link>
                  <Link href="/cart" className="block hover:text-[var(--oc-ink)]">
                    {dict.common.cart}
                  </Link>
                  <Link href="/checkout" className="block hover:text-[var(--oc-ink)]">
                    {dict.footer.checkout}
                  </Link>
                </div>
                <div className="space-y-2 text-sm text-[var(--oc-muted)]">
                  <p className="oc-kicker">{dict.footer.account}</p>
                  <Link href="/login" className="block hover:text-[var(--oc-ink)]">
                    {dict.common.login}
                  </Link>
                  <Link href="/register" className="block hover:text-[var(--oc-ink)]">
                    {dict.footer.register}
                  </Link>
                  <Link href="/orders" className="block hover:text-[var(--oc-ink)]">
                    {dict.footer.myOrders}
                  </Link>
                </div>
              </div>
            </footer>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
