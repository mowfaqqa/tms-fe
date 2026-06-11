import axios from 'axios';
import type { ApiErrorBody } from '@/lib/types';

/** Normalizes any thrown error into a user-facing message string. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) {
      return Array.isArray(body.message)
        ? body.message.join('. ')
        : body.message;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

/** Returns the raw validation messages array (for inline form display). */
export function getValidationMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (Array.isArray(body?.message)) return body.message;
  }
  return [];
}
