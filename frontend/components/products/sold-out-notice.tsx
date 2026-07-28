'use client';

import { useI18n } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/cn';

const MESSENGER_URL = 'https://m.me/carpetsgallerytbilisi';

export function SoldOutNotice({ className }: { className?: string }) {
  const { dict } = useI18n();
  const d = dict.productDetail;

  return (
    <div className={cn('space-y-2', className)}>
      <span className="inline-flex bg-[var(--oc-sold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm ring-1 ring-white/30">
        {d.sold}
      </span>
      <p className="text-sm leading-relaxed text-[var(--oc-muted)]">
        {d.outOfStock} —{' '}
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--oc-sold)] underline underline-offset-4 hover:text-[var(--oc-sold-hover)]"
        >
          {d.textUsSimilar}
        </a>
      </p>
    </div>
  );
}
