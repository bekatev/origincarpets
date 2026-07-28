'use client';

import Link from 'next/link';
import type { Route } from 'next';
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
      <div className="mt-2 flex justify-center px-3">
        <Link
          href={'/products?sale=1' as Route}
          className="oc-sale-banner group relative inline-flex max-w-full items-center justify-center gap-2 overflow-hidden rounded-sm bg-[var(--oc-sale)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-10px_rgba(180,35,24,0.75)] transition hover:bg-[var(--oc-sale-hover)] hover:shadow-[0_10px_28px_-8px_rgba(180,35,24,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--oc-sale)] sm:px-7 sm:text-[12px] sm:tracking-[0.24em]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full"
          />
          <span className="relative">{dict.topbar.sale}</span>
          <span aria-hidden className="relative text-[13px] leading-none">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
