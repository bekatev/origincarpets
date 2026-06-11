'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/i18n-provider';

export default function CheckoutResultPage() {
  const { dict } = useI18n();
  const r = dict.checkoutResult;

  return (
    <main className="oc-section">
      <div className="oc-container max-w-2xl space-y-6">
        <h1 className="oc-heading">{r.title}</h1>
        <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{r.success}</p>
        <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{r.pending}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/orders" className="oc-btn-primary">
            {r.viewOrders}
          </Link>
          <Link href="/products" className="oc-btn-secondary">
            {r.continueShopping}
          </Link>
        </div>
      </div>
    </main>
  );
}
