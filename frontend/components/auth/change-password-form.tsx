'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/components/providers/i18n-provider';
import { patchJson } from '@/lib/api';

export function ChangePasswordForm() {
  const { dict } = useI18n();
  const a = dict.auth;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError(a.passwordMismatch);
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError(a.loginRequired);
      return;
    }

    setLoading(true);

    try {
      await patchJson<{ message: string }>('/auth/password', token, {
        currentPassword,
        newPassword
      });
      setSuccess(a.passwordChanged);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : a.passwordChangeFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="oc-surface space-y-4 p-5"
    >
      <div>
        <h2 className="font-display text-xl uppercase tracking-[0.08em]">{a.changePasswordTitle}</h2>
        <p className="mt-1 text-sm text-[var(--oc-muted)]">{a.changePasswordSubtitle}</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.currentPassword}</label>
        <input
          type="password"
          className="oc-input"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">{a.newPassword}</label>
        <input
          type="password"
          className="oc-input"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
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

      <button type="submit" className="oc-btn-primary" disabled={loading}>
        {loading ? a.updatingPassword : a.updatePassword}
      </button>
    </motion.form>
  );
}
