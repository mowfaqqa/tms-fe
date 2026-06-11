import axios from 'axios';
import { clearAuth, getToken } from '@/lib/auth/storage';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (expired/invalid token), clear auth and bounce to login — unless we
// are already on an auth page.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      const path = window.location.pathname;
      const onAuthPage =
        path.startsWith('/login') ||
        path.startsWith('/forgot-password') ||
        path.startsWith('/reset-password');
      if (!onAuthPage) {
        clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/** Downloads a binary endpoint (e.g. notice PDF) and triggers a browser save. */
export async function downloadFile(
  url: string,
  fallbackFilename: string,
): Promise<void> {
  const res = await api.get(url, { responseType: 'blob' });
  const disposition = res.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? fallbackFilename;

  const blobUrl = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}
