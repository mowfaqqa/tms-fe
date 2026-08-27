'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquareWarning } from 'lucide-react';
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
import { PaginationBar } from '@/components/shared/pagination-bar';
import {
  IssuePriorityBadge,
  IssueStatusBadge,
} from '@/components/issues/issue-badges';
import { useIssues } from '@/lib/hooks/use-issues';
import { ISSUE_CATEGORY_LABELS } from '@/lib/labels';
import { formatDate } from '@/lib/format';

/** Escalations this staff member raised, newest activity first. */
export function StaffIssuesPanel({ staffId }: { staffId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useIssues({
    page,
    limit: 10,
    raisedById: staffId,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareWarning}
        title="No issues reported"
        description="This staff member hasn't escalated anything to the admin."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Raised</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((issue) => (
              <TableRow
                key={issue.id}
                className="cursor-pointer"
                onClick={() => router.push(`/issues/${issue.id}`)}
              >
                <TableCell className="whitespace-normal">
                  <div className="font-medium">{issue.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {ISSUE_CATEGORY_LABELS[issue.category]}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {issue.property ? (
                    <Link
                      href={`/properties/${issue.property.id}`}
                      className="underline underline-offset-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {issue.property.address}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <IssuePriorityBadge priority={issue.priority} />
                </TableCell>
                <TableCell>
                  <IssueStatusBadge status={issue.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(issue.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationBar meta={data.meta} onPageChange={setPage} />
    </div>
  );
}
