'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { RequireAuth } from '@/components/auth/require-auth';
import { useI18n } from '@/components/providers/i18n-provider';

function SettingsLinkCard({ href, title, subtitle }: { href: Route; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="oc-surface group flex items-center justify-between gap-4 p-5 transition hover:border-[var(--oc-ink)]"
    >
      <span>
        <span className="font-display block text-xl uppercase tracking-[0.08em] text-[var(--oc-ink)]">{title}</span>
        <span className="mt-1 block text-sm text-[var(--oc-muted)]">{subtitle}</span>
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0 text-[var(--oc-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--oc-ink)]"
      >
        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export default function AccountSettingsPage() {
  const { dict } = useI18n();
  const s = dict.settings;
  const a = dict.auth;

  return (
    <RequireAuth>
      <main className="oc-section">
        <div className="oc-container max-w-3xl space-y-8">
          <div>
            <Link href="/orders" className="oc-link text-xs font-semibold uppercase tracking-[0.14em]">
              ← {s.backToProfile}
            </Link>
            <h1 className="oc-heading mt-4">{s.title}</h1>
            <p className="mt-2 text-sm text-[var(--oc-muted)]">{s.subtitle}</p>
          </div>

          <div className="space-y-4">
            <SettingsLinkCard
              href={'/account/settings/password' as Route}
              title={a.changePasswordTitle}
              subtitle={a.changePasswordSubtitle}
            />
            <SettingsLinkCard
              href={'/account/settings/addresses' as Route}
              title={s.addressesTitle}
              subtitle={s.addressesSubtitle}
            />
            <SettingsLinkCard
              href={'/account/settings/payment' as Route}
              title={s.paymentTitle}
              subtitle={s.paymentSubtitle}
            />
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
