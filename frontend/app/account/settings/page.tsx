'use client';

import Link from 'next/link';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { RequireAuth } from '@/components/auth/require-auth';
import { AddressSettings } from '@/components/account/address-settings';
import { PaymentSettings } from '@/components/account/payment-settings';
import { useI18n } from '@/components/providers/i18n-provider';

export default function AccountSettingsPage() {
  const { dict } = useI18n();
  const s = dict.settings;

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

          <ChangePasswordForm />
          <AddressSettings />
          <PaymentSettings />
        </div>
      </main>
    </RequireAuth>
  );
}
