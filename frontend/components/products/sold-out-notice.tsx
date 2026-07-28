'use client';

import { useI18n } from '@/components/providers/i18n-provider';

const MESSENGER_URL = 'https://m.me/carpetsgallerytbilisi';

export function SoldOutNotice({ className }: { className?: string }) {
  const { dict } = useI18n();
  const d = dict.productDetail;

  return (
    <div className={className}>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--oc-ink)]">{d.sold}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--oc-muted)]">
        {d.outOfStock} —{' '}
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--oc-ink)] underline underline-offset-4 hover:opacity-70"
        >
          {d.textUsSimilar}
        </a>
      </p>
    </div>
  );
}
