'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PartPaymentBadge } from './part-payment-badge';
import { TenantStatusBadge } from './tenant-status-badge';
import { formatDate, formatMoney, formatRelative } from '@/lib/format';
import type { Tenant } from '@/lib/types';

export function TenantTable({ tenants }: { tenants: Tenant[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Tenancy End</TableHead>
            <TableHead className="text-right">Rent</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((t) => (
            <TableRow
              key={t.id}
              className="cursor-pointer"
              onClick={() => router.push(`/tenants/${t.id}`)}
            >
              <TableCell>
                <div className="font-medium">{t.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {t.phoneNumber}
                </div>
              </TableCell>
              <TableCell>
                <div>{t.property?.address}</div>
                <div className="text-xs text-muted-foreground">
                  Unit {t.property?.unitNumber}
                </div>
              </TableCell>
              <TableCell>
                <div>{formatDate(t.tenancyEndDate)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatRelative(t.tenancyEndDate)}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(t.rentAmount)}
                {t.isPartPayment && t.payments && !t.payments.isFullyPaid ? (
                  <div className="text-xs text-amber-600 dark:text-amber-500">
                    {formatMoney(t.payments.outstanding)} owing
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <TenantStatusBadge status={t.status} />
                  <PartPaymentBadge
                    isPartPayment={t.isPartPayment}
                    isFullyPaid={t.payments?.isFullyPaid}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
