'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
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
import { GenerateNoticeDialog } from '@/components/notices/generate-notice-dialog';
import { NoticeStatusBadge } from '@/components/notices/notice-status-badge';
import { useNotices } from '@/lib/hooks/use-notices';
import { NOTICE_TYPE_LABELS } from '@/lib/labels';
import { formatDate } from '@/lib/format';
import type { NoticeStatus, NoticeType } from '@/lib/types';

export default function NoticesPage() {
  const router = useRouter();
  const [type, setType] = useState<NoticeType | 'all'>('all');
  const [status, setStatus] = useState<NoticeStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotices({
    page,
    limit: 20,
    type: type === 'all' ? undefined : type,
    status: status === 'all' ? undefined : status,
  });

  return (
    <>
      <PageHeader
        title="Notices"
        description="Generate, review, and issue tenancy notices."
        actions={
          <GenerateNoticeDialog
            trigger={
              <Button>
                <FileText className="size-4" />
                Generate notice
              </Button>
            }
          />
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as NoticeType | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="QUIT">Notice to Quit</SelectItem>
                <SelectItem value="RENEWAL">Renewal Notice</SelectItem>
                <SelectItem value="GENERAL">General Notice</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as NoticeStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notices found"
              description="Generate a notice to get started."
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((notice) => (
                      <TableRow
                        key={notice.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/notices/${notice.id}`)}
                      >
                        <TableCell className="font-medium">
                          {NOTICE_TYPE_LABELS[notice.type]}
                        </TableCell>
                        <TableCell>
                          {notice.tenant?.fullName ?? '—'}
                        </TableCell>
                        <TableCell>{formatDate(notice.createdAt)}</TableCell>
                        <TableCell>{formatDate(notice.issuedAt)}</TableCell>
                        <TableCell>
                          <NoticeStatusBadge status={notice.status} />
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
