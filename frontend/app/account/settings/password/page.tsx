'use client';

import Link from 'next/link';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { RequireAuth } from '@/components/auth/require-auth';
import { useI18n } from '@/components/providers/i18n-provider';

export default function ChangePasswordPage() {
  const { dict } = useI18n();
  const s = dict.settings;
  const a = dict.auth;

  return (
    <RequireAuth>
      <main className="oc-section">
        <div className="oc-container max-w-3xl space-y-8">
          <div>
            <Link href="/account/settings" className="oc-link text-xs font-semibold uppercase tracking-[0.14em]">
              ← {s.backToSettings}
            </Link>
            <h1 className="oc-heading mt-4">{a.changePasswordTitle}</h1>
          </div>

          <ChangePasswordForm />
        </div>
      </main>
    </RequireAuth>
  );
}
