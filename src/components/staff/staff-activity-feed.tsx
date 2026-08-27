'use client';

import { useState } from 'react';
import { History } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusBadge } from '@/components/shared/status-badge';
import { ActivityChanges } from '@/components/reports/activity-changes';
import { useStaffActivity } from '@/lib/hooks/use-staff';
import { activityActionLabel, activitySubject } from '@/lib/labels';
import { formatDate, formatDateTime, formatRelative } from '@/lib/format';
import type { ActivityAction, StaffActivitySummary } from '@/lib/types';

/** How many action types to show as chips before the rest are summed up. */
const TOP_ACTIONS = 5;

export function StaffActivityFeed({ staffId }: { staffId: string }) {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActivityAction | 'all'>('all');

  const { data, isLoading } = useStaffActivity(staffId, {
    page,
    limit: 20,
    ...(action === 'all' ? {} : { action }),
  });

  // A second, deliberately tiny request for the unfiltered totals. The server
  // filters the summary alongside the feed, so reading it from the filtered
  // response would collapse the dropdown to the one action already selected
  // and strand the user there. It also means the strip keeps describing the
  // whole history while the feed below it is narrowed, which is what a
  // profile-level stat should do.
  const { data: overall } = useStaffActivity(staffId, { limit: 1 });

  if (isLoading && !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const summary = overall?.summary;
  const actionsInDropdown = summary?.byAction ?? [];

  return (
    <div className="space-y-4">
      {summary ? <ActivitySummaryStrip summary={summary} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v as ActivityAction | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionsInDropdown.map((row) => (
              <SelectItem key={row.action} value={row.action}>
                {activityActionLabel(row.action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!data || data.rows.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity"
          description={
            action === 'all'
              ? "This staff member hasn't made any changes yet."
              : 'No activity of this kind.'
          }
        />
      ) : (
        <>
          <ol className="space-y-3">
            {data.rows.map((entry) => (
              <li key={entry.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium">
                      {activityActionLabel(entry.action)}
                    </div>
                    {activitySubject(entry) ? (
                      <div className="text-xs text-muted-foreground">
                        {activitySubject(entry)}
                      </div>
                    ) : null}
                  </div>
                  <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={entry.createdAt}
                    title={formatDateTime(entry.createdAt)}
                  >
                    {formatRelative(entry.createdAt)}
                  </time>
                </div>

                {entry.changes && entry.changes.length > 0 ? (
                  <div className="mt-2 border-t pt-2">
                    <ActivityChanges changes={entry.changes} />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>

          {data.meta ? (
            <PaginationBar meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
    </div>
  );
}

function ActivitySummaryStrip({ summary }: { summary: StaffActivitySummary }) {
  if (summary.totalActions === 0) return null;

  const top = summary.byAction.slice(0, TOP_ACTIONS);
  const remainder = summary.byAction
    .slice(TOP_ACTIONS)
    .reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <p className="text-sm">
        <span className="font-medium">{summary.totalActions}</span>{' '}
        {summary.totalActions === 1 ? 'action' : 'actions'}
        {summary.firstActionAt && summary.lastActionAt ? (
          <span className="text-muted-foreground">
            {' '}
            between {formatDate(summary.firstActionAt)} and{' '}
            {formatDate(summary.lastActionAt)}
          </span>
        ) : null}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {top.map((row) => (
          <StatusBadge
            key={row.action}
            tone="secondary"
            label={`${activityActionLabel(row.action)} · ${row.count}`}
          />
        ))}
        {remainder > 0 ? (
          <StatusBadge tone="outline" label={`${remainder} more`} />
        ) : null}
      </div>
    </div>
  );
}
