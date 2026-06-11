'use client';

import { useI18n } from '@/components/providers/i18n-provider';

export function SiteTopbar() {
  const { dict } = useI18n();

  return (
    <p className="border-b border-[var(--oc-line)] py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--oc-muted)]">
      {dict.topbar.shipping}
    </p>
  );
}
