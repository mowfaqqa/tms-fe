import type { AuthUser } from '@/lib/types';

const TOKEN_KEY = 'tms.token';
const USER_KEY = 'tms.user';

const isBrowser = () => typeof window !== 'undefined';

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
