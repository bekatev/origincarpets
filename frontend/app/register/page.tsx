'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { postJson, type AuthResponse } from '@/lib/api';
import { mergeLocalCartAfterAuth } from '@/lib/cart-sync';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      const data = await postJson<AuthResponse>('/auth/register', {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email,
        password
      });
      localStorage.setItem('auth_token', data.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      await mergeLocalCartAfterAuth(data.accessToken);
      setSuccess(`Account created for ${data.user.email}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="oc-section">
      <div className="oc-container max-w-md">
        <h1 className="oc-heading text-3xl">Register</h1>
        <p className="mt-2 text-sm text-[var(--oc-muted)]">Create a customer account for checkout and tracking.</p>

      <form onSubmit={onSubmit} className="oc-surface mt-6 space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">First name</label>
            <input
              type="text"
              className="oc-input"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em]">Last name</label>
            <input
              type="text"
              className="oc-input"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

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
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-[var(--oc-muted)]">
        Already registered?{' '}
        <Link href="/login" className="font-medium text-[var(--oc-brand)] hover:text-[var(--oc-brand-soft)]">
          Login
        </Link>
      </p>
      </div>
    </main>
  );
}
