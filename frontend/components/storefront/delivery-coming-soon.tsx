'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/i18n-provider';

export function DeliveryComingSoon({ showBrowseLink = true }: { showBrowseLink?: boolean }) {
  const { dict } = useI18n();
  const s = dict.storefront;

  return (
    <div className="oc-surface space-y-4 p-8 text-center">
      <p className="oc-eyebrow">{s.purchaseComingSoon}</p>
      <h1 className="oc-heading-sm">{s.deliveryComingSoonTitle}</h1>
      <p className="oc-lead mx-auto max-w-lg">{s.deliveryComingSoonBody}</p>
      {showBrowseLink ? (
        <Link href="/products" className="oc-btn-primary mt-2 inline-flex">
          {s.browseCollection}
        </Link>
      ) : null}
    </div>
  );
}
