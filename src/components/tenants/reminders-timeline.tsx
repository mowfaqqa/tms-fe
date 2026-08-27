'use client';

import { BellRing, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { useTenantReminders } from '@/lib/hooks/use-tenants';
import { useAcknowledgeReminder } from '@/lib/hooks/use-reminders';
import { getApiErrorMessage } from '@/lib/api/errors';
import {
  REMINDER_STATUS_LABELS,
  REMINDER_STATUS_TONE,
  REMINDER_TYPE_LABELS,
} from '@/lib/labels';
import { formatDate, formatRelative } from '@/lib/format';

export function RemindersTimeline({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useTenantReminders(tenantId);
  const acknowledge = useAcknowledgeReminder(tenantId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState icon={BellRing} title="No reminders" />
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((reminder) => (
        <li
          key={reminder.id}
          className="flex items-center justify-between gap-4 rounded-md border p-3"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {REMINDER_TYPE_LABELS[reminder.type]}
            </p>
            <p className="text-xs text-muted-foreground">
              Due {formatDate(reminder.dueDate)} · {formatRelative(reminder.dueDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge
              label={REMINDER_STATUS_LABELS[reminder.status]}
              tone={REMINDER_STATUS_TONE[reminder.status]}
            />
            {/* A cancelled reminder belongs to a term that has ended or been
                renewed — there is nothing left to acknowledge. */}
            {reminder.status === 'PENDING' ||
            reminder.status === 'TRIGGERED' ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  acknowledge.mutate(reminder.id, {
                    onSuccess: () => toast.success('Reminder acknowledged'),
                    onError: (e) => toast.error(getApiErrorMessage(e)),
                  })
                }
                disabled={acknowledge.isPending}
              >
                <Check className="size-4" />
                Acknowledge
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
