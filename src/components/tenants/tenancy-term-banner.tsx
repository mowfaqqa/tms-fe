import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/format';
import type { Tenant } from '@/lib/types';

/**
 * Both ends of the renewal chain. A superseded term needs to say so loudly —
 * otherwise its stale rent and dates read as current — and a renewed term
 * should point back at what it replaced, since that is where last year's
 * rent lives.
 */
export function TenancyTermBanner({ tenant }: { tenant: Tenant }) {
  if (tenant.renewedTo) {
    const next = tenant.renewedTo;
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
        <p className="font-medium">This term has been renewed.</p>
        <p className="mt-1 text-muted-foreground">
          The figures below are the old term, kept as history. The current term
          runs {formatDate(next.tenancyStartDate)} –{' '}
          {formatDate(next.tenancyEndDate)} at {formatMoney(next.rentAmount)}.
        </p>
        <Link
          href={`/tenants/${next.id}`}
          className="mt-2 inline-flex items-center gap-1 font-medium underline underline-offset-4"
        >
          Go to the current term
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  if (tenant.renewedFrom) {
    const previous = tenant.renewedFrom;
    return (
      <div className="rounded-md border bg-muted/40 p-3 text-sm">
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <History className="size-3.5 shrink-0" />
          Renewed from a term running {formatDate(previous.tenancyStartDate)} –{' '}
          {formatDate(previous.tenancyEndDate)} at{' '}
          {formatMoney(previous.rentAmount)}.
          <Link
            href={`/tenants/${previous.id}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            View previous term
          </Link>
        </p>
      </div>
    );
  }

  return null;
}
