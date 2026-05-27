import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CartLink } from '@/components/cart/cart-link';
import { CartProvider } from '@/lib/cart';

export const metadata: Metadata = {
  title: 'Carpet Commerce',
  description: 'Ecommerce platform for premium carpets'
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
