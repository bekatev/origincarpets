'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { postJson, type AuthResponse } from '@/lib/api';
import { mergeLocalCartAfterAuth } from '@/lib/cart-sync';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const data = await postJson<AuthResponse>('/auth/login', { email, password });
      localStorage.setItem('auth_token', data.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      await mergeLocalCartAfterAuth(data.accessToken);
      setSuccess(`Logged in as ${data.user.email} (${data.user.role})`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-md">
        <h1 className="oc-heading text-3xl">Login</h1>
        <p className="mt-2 text-sm text-[var(--oc-muted)]">Sign in to manage orders and your account.</p>

      <form onSubmit={onSubmit} className="oc-surface mt-6 space-y-4 p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">Email</label>
          <input
            type="email"
            className="oc-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">Password</label>
          <input
            type="password"
            className="oc-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

        <button
          type="submit"
          className="oc-btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-[var(--oc-muted)]">
        No account?{' '}
        <Link href="/register" className="font-medium text-[var(--oc-brand)] hover:text-[var(--oc-brand-soft)]">
          Register
        </Link>
      </p>
      </div>
    </main>
  );
}
