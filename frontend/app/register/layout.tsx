import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/register' }
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
