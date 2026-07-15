import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteTopbar } from '@/components/layout/site-topbar';
import { SiteFooter } from '@/components/layout/site-footer';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { CurrencyProvider } from '@/components/providers/currency-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeScript } from '@/components/layout/theme-script';
import { JsonLd } from '@/components/seo/json-ld';
import { CURRENCY_COOKIE, normalizeCurrency } from '@/lib/currency';
import { LANG_COOKIE, resolveSiteLocale } from '@/lib/i18n';
import {
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
  languageAlternates,
  organizationJsonLd,
  websiteJsonLd
} from '@/lib/seo';
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_TAGLINE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION_EN,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'shopping',
  keywords: [
    'Caucasian carpets',
    'Oriental rugs',
    'handmade kilim',
    'antique rugs Tbilisi',
    'Georgian carpets',
    'Origin Carpets',
    'buy handmade rug online',
    'worldwide rug shipping'
  ],
  icons: {
    icon: [{ url: '/brand/logo-icon.png', type: 'image/png' }],
    apple: [{ url: '/brand/logo-icon.png', type: 'image/png' }]
  },
  manifest: '/site.webmanifest',
  alternates: languageAlternates('/'),
  openGraph: {
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION_EN,
    type: 'website',
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    locale: 'en_US',
    alternateLocale: ['ka_GE'],
    images: [{ url: stockImages.og, width: 1200, height: 800, alt: SITE_TAGLINE }]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION_EN,
    images: [stockImages.og]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = resolveSiteLocale(cookieStore.get(LANG_COOKIE)?.value);
  const currency = normalizeCurrency(cookieStore.get(CURRENCY_COOKIE)?.value);
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html lang={locale} className={theme === 'dark' ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider initialTheme={theme}>
          <I18nProvider initialLocale={locale}>
            <CurrencyProvider initialCurrency={currency}>
              <AuthProvider>
                <CartProvider>
                  <SiteTopbar />
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
