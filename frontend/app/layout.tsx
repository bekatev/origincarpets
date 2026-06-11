import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { CurrencyProvider } from '@/components/providers/currency-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeScript } from '@/components/layout/theme-script';
import { CURRENCY_COOKIE, normalizeCurrency } from '@/lib/currency';
import { LANG_COOKIE, DEFAULT_LOCALE, dictionaries, normalizeLocale } from '@/lib/i18n';
import { stockImages } from '@/lib/stock-images';
import { THEME_COOKIE, normalizeTheme } from '@/lib/theme';

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

const SITE_TITLE = 'Finest Caucasian and Oriental Carpets';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: SITE_TITLE,
    template: `%s | Origin Carpets`
  },
  description: SITE_TITLE,
  icons: {
    icon: [{ url: '/brand/logo-icon.png', type: 'image/png' }],
    apple: [{ url: '/brand/logo-icon.png', type: 'image/png' }]
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_TITLE,
    type: 'website',
    url: 'http://localhost:3000',
    images: [{ url: stockImages.og, width: 1200, height: 800, alt: SITE_TITLE }]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_TITLE,
    images: [stockImages.og]
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LANG_COOKIE)?.value;
  const locale = cookieLocale ? normalizeLocale(cookieLocale) : DEFAULT_LOCALE;
  const currency = normalizeCurrency(cookieStore.get(CURRENCY_COOKIE)?.value);
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);
  const dict = dictionaries[locale];

  return (
    <html lang={locale} className={theme === 'dark' ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider initialTheme={theme}>
          <I18nProvider initialLocale={locale}>
            <CurrencyProvider initialCurrency={currency}>
              <AuthProvider>
              <CartProvider>
                <p className="border-b border-[var(--oc-line)] py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--oc-muted)]">
                  {dict.topbar.shipping}
                </p>

                <SiteHeader />

                {children}

                <SiteFooter />
                <CurrencySwitcher />
              </CartProvider>
              </AuthProvider>
            </CurrencyProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
