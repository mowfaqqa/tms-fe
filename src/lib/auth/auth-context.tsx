'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/types';
import { clearAuth, getStoredUser, getToken, setAuth } from './storage';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** True until the initial hydration from storage completes. */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount. localStorage is an external store that
  // is only available client-side after mount, so this must run in an effect.
  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(token && storedUser ? storedUser : null);
    setLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAuth(res.accessToken, res.user);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    void authApi.logout().catch(() => undefined);
    clearAuth();
    setUser(null);
    window.location.href = '/login';
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      loading,
      login,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
