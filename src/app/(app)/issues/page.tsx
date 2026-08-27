'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareWarning, TriangleAlert } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import {
  IssuePriorityBadge,
  IssueStatusBadge,
} from '@/components/issues/issue-badges';
import { ReportIssueDialog } from '@/components/issues/report-issue-dialog';
import { useIssues, useIssueSummary } from '@/lib/hooks/use-issues';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useAuth } from '@/lib/auth/auth-context';
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import type { IssueCategory, IssueStatus } from '@/lib/types';

const STATUSES = Object.keys(ISSUE_STATUS_LABELS) as IssueStatus[];
const CATEGORIES = Object.keys(ISSUE_CATEGORY_LABELS) as IssueCategory[];

export default function IssuesPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IssueStatus | 'all' | 'open'>('open');
  const [category, setCategory] = useState<IssueCategory | 'all'>('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);
  const { data: summary } = useIssueSummary();
  const { data, isLoading } = useIssues({
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    // "open" is the default view: everything still awaiting a decision.
    ...(status === 'open'
      ? { openOnly: true }
      : status === 'all'
        ? {}
        : { status }),
    ...(category === 'all' ? {} : { category }),
  });

  const onFilterChange = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Issues"
        description={
          isAdmin
            ? 'Problems escalated by staff. Review each one and close it with a note.'
            : 'Problems you have escalated to the admin, and anything raised on your properties.'
        }
        actions={
          <ReportIssueDialog
            trigger={
              <Button>
                <MessageSquareWarning className="size-4" />
                Report an issue
              </Button>
            }
          />
        }
      />

      {summary && summary.awaitingReview > 0 ? (
        <Card className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <CardContent className="flex items-center gap-3 py-3">
            <TriangleAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-sm">
              <span className="font-medium">{summary.awaitingReview}</span>{' '}
              {summary.awaitingReview === 1 ? 'issue is' : 'issues are'} still
              awaiting a decision.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              placeholder="Search issues…"
              className="sm:max-w-xs"
              onChange={(e) => onFilterChange(() => setSearch(e.target.value))}
            />
            <Select
              value={status}
              onValueChange={(v) =>
                onFilterChange(() => setStatus(v as IssueStatus | 'all' | 'open'))
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Awaiting decision</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ISSUE_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={category}
              onValueChange={(v) =>
                onFilterChange(() => setCategory(v as IssueCategory | 'all'))
              }
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ISSUE_CATEGORY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={MessageSquareWarning}
              title="No issues"
              description={
                status === 'open'
                  ? 'Nothing is waiting on a decision right now.'
                  : 'No issues match these filters.'
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Reported by</TableHead>
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
                        <TableCell>
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {ISSUE_CATEGORY_LABELS[issue.category]}
                          </div>
                        </TableCell>
                        <TableCell>
                          {issue.property ? (
                            <>
                              {issue.property.address}
                              <span className="text-muted-foreground">
                                {' '}
                                · Unit {issue.property.unitNumber}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {issue.raisedBy?.fullName ?? '—'}
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
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
