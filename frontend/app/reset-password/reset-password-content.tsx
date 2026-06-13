'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/i18n-provider';
import { postJson } from '@/lib/api';

export function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useI18n();
  const a = dict.auth;
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError(a.resetLinkInvalid);
      return;
    }

    if (password !== confirmPassword) {
      setError(a.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      await postJson<{ message: string }>('/auth/reset-password', { token, password });
      setSuccess(a.passwordResetSuccess);
      setTimeout(() => router.push('/login'), 2000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : a.resetPasswordFailed);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="oc-section">
        <div className="oc-container max-w-md">
          <h1 className="oc-heading text-3xl">{a.resetPasswordTitle}</h1>
          <p className="mt-4 text-sm text-red-700">{a.resetLinkInvalid}</p>
          <Link href="/forgot-password" className="oc-link mt-4 inline-flex text-sm font-medium">
            {a.requestNewLink}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-md">
        <h1 className="oc-heading text-3xl">{a.resetPasswordTitle}</h1>
        <p className="mt-2 text-sm text-[var(--oc-muted)]">{a.resetPasswordSubtitle}</p>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="oc-surface mt-6 space-y-4 p-6"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.newPassword}</label>
            <input
              type="password"
              className="oc-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.confirmPassword}</label>
            <input
              type="password"
              className="oc-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <button type="submit" className="oc-btn-primary w-full" disabled={loading}>
            {loading ? a.resettingPassword : a.resetPasswordButton}
          </button>
        </motion.form>

        <p className="mt-4 text-sm text-[var(--oc-muted)]">
          <Link href="/login" className="oc-link font-medium">
            {a.backToLogin}
          </Link>
        </p>
      </div>
    </main>
  );
}
