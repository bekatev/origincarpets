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
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Register</h1>
      <p className="mt-2 text-sm text-stone-600">Create a customer account for checkout and tracking.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border border-stone-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">First name</label>
            <input
              type="text"
              className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last name</label>
            <input
              type="text"
              className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-stone-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

        <button
          type="submit"
          className="w-full rounded-md bg-brand-700 px-4 py-2 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-700">
        Already registered?{' '}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}
