'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { TenantStatusBadge } from '@/components/tenants/tenant-status-badge';
import { usePartPayments } from '@/lib/hooks/use-payments';
import { formatDate, formatMoney } from '@/lib/format';

export function PartPaymentsReport() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [includeSettled, setIncludeSettled] = useState(false);

  const { data, isLoading } = usePartPayments({
    page,
    limit: 20,
    outstandingOnly: !includeSettled,
  });

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={includeSettled}
          onCheckedChange={(v) => {
            setIncludeSettled(v === true);
            setPage(1);
          }}
        />
        Include arrangements that have been paid off
      </label>

      {isLoading && !data ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No part payments"
          description={
            includeSettled
              ? 'Nobody is on a part-payment arrangement.'
              : 'Nothing is outstanding on a part-payment arrangement.'
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Tenancy ends</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/tenants/${row.id}`)}
                  >
                    <TableCell className="whitespace-normal">
                      <div className="font-medium">{row.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {row.propertyLabel ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(row.rentAmount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(row.amountPaid)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.isFullyPaid ? (
                        <span className="text-muted-foreground">Settled</span>
                      ) : (
                        <span className="font-medium text-amber-600 dark:text-amber-500">
                          {formatMoney(row.outstanding)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>{formatDate(row.tenancyEndDate)}</div>
                      <TenantStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
