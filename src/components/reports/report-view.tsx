'use client';

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
import { useReport } from '@/lib/hooks/use-reports';
import type { ReportKey, ReportRowTypes } from '@/lib/api/reports';

export interface ReportColumn<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

export function ReportView<K extends ReportKey>({
  reportKey,
  filename,
  columns,
  rowKey,
  onRowClick,
  exportCsv,
  enabled = true,
}: {
  reportKey: K;
  filename: string;
  columns: ReportColumn<ReportRowTypes[K]>[];
  rowKey: (row: ReportRowTypes[K]) => string;
  onRowClick?: (row: ReportRowTypes[K]) => void;
  exportCsv?: (rows: ReportRowTypes[K][], filename: string) => void;
  enabled?: boolean;
}) {
  const { data, isLoading } = useReport(reportKey, enabled);

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
        {exportCsv ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportCsv(data.rows, filename)}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.header}
                  className={col.align === 'right' ? 'text-right' : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.header}
                    className={
                      col.align === 'right' ? 'text-right tabular-nums' : undefined
                    }
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
