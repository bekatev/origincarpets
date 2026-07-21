'use client';

import { useI18n } from '@/components/providers/i18n-provider';

export function SiteTopbar() {
  const { dict } = useI18n();

  return (
    <p
      className="border-b border-[var(--oc-line)] py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--oc-muted)] backdrop-blur-md"
      style={{ backgroundColor: 'color-mix(in srgb, var(--oc-bg) 55%, transparent)' }}
    >
      {dict.topbar.shipping}
    </p>
  );
}
