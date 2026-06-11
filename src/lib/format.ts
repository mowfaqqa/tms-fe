import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

/** Formats an ISO date string as e.g. "31 Dec 2026". Returns "—" if empty. */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = parseISO(value);
  return isValid(d) ? format(d, 'd MMM yyyy') : '—';
}

/** Formats an ISO date string with time, e.g. "31 Dec 2026, 14:30". */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = parseISO(value);
  return isValid(d) ? format(d, 'd MMM yyyy, HH:mm') : '—';
}

/** Relative time, e.g. "in 3 months" / "2 days ago". */
export function formatRelative(value?: string | null): string {
  if (!value) return '';
  const d = parseISO(value);
  if (!isValid(d)) return '';
  const distance = formatDistanceToNowStrict(d);
  return d.getTime() >= Date.now() ? `in ${distance}` : `${distance} ago`;
}

/** Formats a decimal string/number as a localized amount, e.g. "1,500,000". */
export function formatMoney(value: string | number): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString();
}

/** Initials for an avatar, e.g. "John Doe" -> "JD". */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
