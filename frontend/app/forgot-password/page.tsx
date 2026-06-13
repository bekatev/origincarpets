'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/i18n-provider';
import { postJson } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { dict } = useI18n();
  const a = dict.auth;
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await postJson<{ message: string }>('/auth/forgot-password', { email });
      setSuccess(result.message || a.forgotPasswordSent);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : a.forgotPasswordFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-md">
        <h1 className="oc-heading text-3xl">{a.forgotPasswordTitle}</h1>
        <p className="mt-2 text-sm text-[var(--oc-muted)]">{a.forgotPasswordSubtitle}</p>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="oc-surface mt-6 space-y-4 p-6"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.email}</label>
            <input
              type="email"
              className="oc-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <button type="submit" className="oc-btn-primary w-full" disabled={loading}>
            {loading ? a.sendingResetLink : a.sendResetLink}
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
