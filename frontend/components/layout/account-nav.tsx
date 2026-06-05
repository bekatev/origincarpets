'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/providers/i18n-provider';
import { useAuth } from '@/components/providers/auth-provider';
export function AccountNav({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { dict } = useI18n();
  const { user, isAuthenticated, ready, logout } = useAuth();

  if (!ready) {
    return <span className="oc-nav-link hidden sm:inline-flex opacity-0">.</span>;
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" className="oc-nav-link hidden sm:inline-flex" onClick={onNavigate}>
        {dict.common.login}
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-5 sm:flex">
      {user.role === 'ADMIN' ? (
        <Link href="/dashboard" className="oc-nav-link" onClick={onNavigate}>
          {dict.common.admin}
        </Link>
      ) : null}
      <Link href="/orders" className="oc-nav-link" onClick={onNavigate} title={user.email}>
        {dict.common.profile}
      </Link>
      <button
        type="button"
        className="oc-nav-link"
        onClick={() => {
          logout();
          router.push('/');
          onNavigate?.();
        }}
      >
        {dict.common.logout}
      </button>
    </div>
  );
}

export function AccountNavMobile({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { dict } = useI18n();
  const { user, isAuthenticated, ready, logout } = useAuth();

  if (!ready) return null;

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" className="oc-nav-link" onClick={onNavigate}>
        {dict.common.login}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3">
      {user.role === 'ADMIN' ? (
        <Link href="/dashboard" className="oc-nav-link" onClick={onNavigate}>
          {dict.common.admin}
        </Link>
      ) : null}
      <Link href="/orders" className="oc-nav-link" onClick={onNavigate}>
        {dict.common.profile}
      </Link>
      <button
        type="button"
        className="oc-nav-link"
        onClick={() => {
          logout();
          router.push('/');
          onNavigate?.();
        }}
      >
        {dict.common.logout}
      </button>
    </div>
  );
}
