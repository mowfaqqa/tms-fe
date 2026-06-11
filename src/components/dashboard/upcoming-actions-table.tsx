'use client';

import Link from 'next/link';
import { CalendarClock, Check } from 'lucide-react';
import { toast } from 'sonner';
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
import { StatusBadge } from '@/components/shared/status-badge';
import { useUpcomingActions } from '@/lib/hooks/use-dashboard';
import { useAcknowledgeReminder } from '@/lib/hooks/use-reminders';
import { getApiErrorMessage } from '@/lib/api/errors';
import { REMINDER_STATUS_LABELS, REMINDER_STATUS_TONE } from '@/lib/labels';
import { formatDate, formatRelative } from '@/lib/format';
import type { ReminderStatus } from '@/lib/types';

export function UpcomingActionsTable() {
  const { data, isLoading } = useUpcomingActions();
  const acknowledge = useAcknowledgeReminder();

  const onAcknowledge = (id: string) => {
    acknowledge.mutate(id, {
      onSuccess: () => toast.success('Reminder acknowledged'),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No upcoming actions"
        description="Reminders that are due will appear here for follow-up."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Reminder</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.reminderId}>
              <TableCell className="font-medium">
                <Link
                  href={`/tenants/${row.tenantId}`}
                  className="hover:underline"
                >
                  {row.tenantName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.property}
              </TableCell>
              <TableCell>
                <div>{formatDate(row.expiryDate)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatRelative(row.expiryDate)}
                </div>
              </TableCell>
              <TableCell>{row.reminderType}</TableCell>
              <TableCell>
                <StatusBadge
                  label={
                    REMINDER_STATUS_LABELS[row.actionStatus as ReminderStatus]
                  }
                  tone={REMINDER_STATUS_TONE[row.actionStatus as ReminderStatus]}
                />
              </TableCell>
              <TableCell className="text-right">
                {row.actionStatus !== 'ACKNOWLEDGED' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcknowledge(row.reminderId)}
                    disabled={acknowledge.isPending}
                  >
                    <Check className="size-4" />
                    Acknowledge
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">Done</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
