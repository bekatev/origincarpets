'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import type { AuthUser } from '@/lib/api';

type RequireAuthProps = {
  children: ReactNode;
  /** When set, only users with this role can access the page. */
  role?: AuthUser['role'];
};

export function RequireAuth({ children, role }: RequireAuthProps) {
  const router = useRouter();
  const { user, isAuthenticated, ready } = useAuth();

  const allowed = isAuthenticated && (!role || user?.role === role);

  useEffect(() => {
    if (ready && !allowed) {
      router.replace('/');
    }
  }, [ready, allowed, router]);

  if (!ready || !allowed) {
    return null;
  }

  return <>{children}</>;
}
