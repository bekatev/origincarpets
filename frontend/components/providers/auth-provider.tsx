'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest, type AuthResponse, type AuthUser } from '@/lib/api';
import { clearAuthStorage, persistAuth, readStoredToken, readStoredUser } from '@/lib/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const syncFromStorage = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    let cancelled = false;

    syncFromStorage();
    setReady(true);

    const token = readStoredToken();
    if (!token) return;

    void (async () => {
      try {
        const profile = await apiRequest<AuthUser>('/auth/me', token);
        if (!cancelled) {
          persistAuth(token, profile);
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          clearAuthStorage();
          setUser(null);
        }
      }
    })();

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'auth_user' || event.key === 'auth_token') {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, [syncFromStorage]);

  const login = useCallback((data: AuthResponse) => {
    persistAuth(data.accessToken, data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      login,
      logout
    }),
    [user, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
