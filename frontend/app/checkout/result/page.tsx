'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { clearPendingPurchase, flushPendingPurchase } from '@/lib/tracking';

function CheckoutResultInner() {
  const { dict } = useI18n();
  const { isAuthenticated } = useAuth();
  const r = dict.checkoutResult;
  const searchParams = useSearchParams();
  const payment = searchParams.get('payment');
  const failed = payment === 'failed';
  const success = payment === 'success';

  useEffect(() => {
    if (success) {
      flushPendingPurchase();
      return;
    }
    if (failed) {
      clearPendingPurchase();
    }
  }, [success, failed]);

  return (
    <div className="oc-container max-w-2xl space-y-6">
      <h1 className="oc-heading">{failed ? r.failedTitle : r.title}</h1>
      {failed ? (
        <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{r.failedBody}</p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-[var(--oc-muted)]">
            {success ? r.success : r.pending}
          </p>
          {success ? (
            <p className="text-sm leading-relaxed text-[var(--oc-muted)]">{r.emailHint}</p>
          ) : null}
        </>
      )}
      <div className="flex flex-wrap gap-4">
        {isAuthenticated ? (
          <Link href={'/orders' as Route} className="oc-btn-primary">
            {r.viewOrders}
          </Link>
        ) : (
          <Link href={'/order-lookup' as Route} className="oc-btn-primary">
            {r.lookupOrder}
          </Link>
        )}
        <Link href={'/products' as Route} className="oc-btn-secondary">
          {r.continueShopping}
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <main className="oc-section">
      <Suspense fallback={<div className="oc-container max-w-2xl" />}>
        <CheckoutResultInner />
      </Suspense>
    </main>
  );
}
