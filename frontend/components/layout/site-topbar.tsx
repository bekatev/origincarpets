'use client';

import { useI18n } from '@/components/providers/i18n-provider';

export function SiteTopbar() {
  const { dict } = useI18n();

  return (
    <div
      className="border-b border-[var(--oc-line)] py-2.5 text-center backdrop-blur-md"
      style={{ backgroundColor: 'color-mix(in srgb, var(--oc-bg) 55%, transparent)' }}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--oc-muted)]">
        {dict.topbar.shipping}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--oc-brand)]">
        {dict.topbar.sale}
      </p>
    </div>
  );
}
