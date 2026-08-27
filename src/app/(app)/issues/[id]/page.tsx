'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import {
  IssuePriorityBadge,
  IssueStatusBadge,
} from '@/components/issues/issue-badges';
import { ReviewIssueDialog } from '@/components/issues/review-issue-dialog';
import { useIssue } from '@/lib/hooks/use-issues';
import { useAuth } from '@/lib/auth/auth-context';
import { ISSUE_CATEGORY_LABELS } from '@/lib/labels';
import { formatDateTime, formatRelative } from '@/lib/format';
import type { IssueStatus } from '@/lib/types';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();

  const { data: issue, isLoading, isError } = useIssue(id);
  const [pendingStatus, setPendingStatus] = useState<IssueStatus | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <EmptyState
        icon={XCircle}
        title="Issue not found"
        description="It may have been removed, or it is not one you have access to."
      />
    );
  }

  const isClosed = issue.status === 'RESOLVED' || issue.status === 'REJECTED';

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link href="/issues">
          <ArrowLeft className="size-4" />
          Back to issues
        </Link>
      </Button>

      <PageHeader
        title={issue.title}
        description={`Reported by ${issue.raisedBy?.fullName ?? 'a staff member'} · ${formatRelative(issue.createdAt)}`}
        actions={
          // Only the admin decides. Staff see the outcome, not the controls.
          isAdmin ? (
            <div className="flex flex-wrap gap-2">
              {issue.status === 'OPEN' ? (
                <Button
                  variant="outline"
                  onClick={() => setPendingStatus('IN_REVIEW')}
                >
                  <Eye className="size-4" />
                  Start review
                </Button>
              ) : null}
              {isClosed ? (
                <Button
                  variant="outline"
                  onClick={() => setPendingStatus('OPEN')}
                >
                  <RotateCcw className="size-4" />
                  Reopen
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setPendingStatus('REJECTED')}
                  >
                    <XCircle className="size-4" />
                    Decline
                  </Button>
                  <Button onClick={() => setPendingStatus('RESOLVED')}>
                    <CheckCircle2 className="size-4" />
                    Resolve
                  </Button>
                </>
              )}
            </div>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>What was reported</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {issue.description}
            </p>

            {issue.resolutionNote ? (
              <div className="rounded-md border bg-muted/40 p-4">
                <p className="text-sm font-medium">
                  {issue.status === 'REJECTED'
                    ? 'Why this was declined'
                    : 'Resolution'}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {issue.resolutionNote}
                </p>
                {issue.resolvedBy && issue.resolvedAt ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {issue.resolvedBy.fullName} ·{' '}
                    {formatDateTime(issue.resolvedAt)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Detail label="Status">
              <IssueStatusBadge status={issue.status} />
            </Detail>
            <Detail label="Priority">
              <IssuePriorityBadge priority={issue.priority} />
            </Detail>
            <Detail label="Category">
              {ISSUE_CATEGORY_LABELS[issue.category]}
            </Detail>
            <Detail label="Property">
              {issue.property ? (
                <Link
                  href={`/properties/${issue.property.id}`}
                  className="underline underline-offset-4"
                >
                  {issue.property.address} (Unit {issue.property.unitNumber})
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Detail>
            <Detail label="Tenant">
              {issue.tenant ? (
                <Link
                  href={`/tenants/${issue.tenant.id}`}
                  className="underline underline-offset-4"
                >
                  {issue.tenant.fullName}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Detail>
            <Detail label="Raised">{formatDateTime(issue.createdAt)}</Detail>
          </CardContent>
        </Card>
      </div>

      <ReviewIssueDialog
        issue={issue}
        status={pendingStatus}
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
      />
    </>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
