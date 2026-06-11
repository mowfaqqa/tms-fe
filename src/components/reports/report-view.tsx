'use client';

import { useRouter } from 'next/navigation';
import { Download, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { TenantStatusBadge } from '@/components/tenants/tenant-status-badge';
import { useReport } from '@/lib/hooks/use-reports';
import type { ReportKey } from '@/lib/api/reports';
import { exportTenantsToCsv } from '@/lib/csv';
import { formatDate, formatMoney } from '@/lib/format';

export function ReportView({
  reportKey,
  filename,
}: {
  reportKey: ReportKey;
  filename: string;
}) {
  const router = useRouter();
  const { data, isLoading } = useReport(reportKey);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="No records"
        description="There is nothing to report for this view yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.count} record{data.count === 1 ? '' : 's'}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => exportTenantsToCsv(data.rows, filename)}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

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
            {data.rows.map((t) => (
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
                  {t.propertyAddress}
                  <span className="text-muted-foreground"> · {t.unitNumber}</span>
                </TableCell>
                <TableCell>{formatDate(t.tenancyEndDate)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(t.rentAmount)}
                </TableCell>
                <TableCell>
                  <TenantStatusBadge status={t.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
