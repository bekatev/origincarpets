import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CartLink } from '@/components/cart/cart-link';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Carpet Commerce',
    template: '%s | Carpet Commerce'
  },
  description: 'Ecommerce platform for premium carpets',
  openGraph: {
    title: 'Carpet Commerce',
    description: 'Shop premium carpets with worldwide shipping options.',
    type: 'website',
    url: 'http://localhost:3000'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carpet Commerce',
    description: 'Shop premium carpets with worldwide shipping options.'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <CartProvider>
          <header className="border-b border-stone-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
              <Link href="/" className="font-semibold">
                Carpet Commerce
              </Link>
              <nav className="flex items-center gap-2">
                <Link href="/products" className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">
                  Products
                </Link>
                <Link href="/orders" className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">
                  Orders
                </Link>
                <CartLink />
              </nav>
            </div>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
