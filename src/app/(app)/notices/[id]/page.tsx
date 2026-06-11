'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Loader2,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { NoticeStatusBadge } from '@/components/notices/notice-status-badge';
import {
  useDeleteNotice,
  useIssueNotice,
  useNotice,
  useUpdateNotice,
} from '@/lib/hooks/use-notices';
import { noticesApi } from '@/lib/api/notices';
import { useAuth } from '@/lib/auth/auth-context';
import { getApiErrorMessage } from '@/lib/api/errors';
import { NOTICE_TYPE_LABELS } from '@/lib/labels';
import { formatDate, formatDateTime } from '@/lib/format';

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const { data: notice, isLoading } = useNotice(id);
  const updateNotice = useUpdateNotice(id);
  const issueNotice = useIssueNotice(id);
  const deleteNotice = useDeleteNotice();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Seed the editable fields from the fetched notice (server-derived state).
  useEffect(() => {
    if (notice) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTitle(notice.title);
      setBody(notice.body);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [notice]);

  if (isLoading || !notice) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isDraft = notice.status === 'DRAFT';

  const onDownload = async () => {
    setDownloading(true);
    try {
      await noticesApi.downloadPdf(notice.id);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Could not download PDF'));
    } finally {
      setDownloading(false);
    }
  };

  const onSave = () => {
    updateNotice.mutate(
      { title, body },
      {
        onSuccess: () => {
          toast.success('Notice updated.');
          setEditing(false);
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
      },
    );
  };

  return (
    <>
      <PageHeader
        title={NOTICE_TYPE_LABELS[notice.type]}
        description={
          notice.tenant ? (
            <>
              For{' '}
              <Link
                href={`/tenants/${notice.tenantId}`}
                className="font-medium hover:underline"
              >
                {notice.tenant.fullName}
              </Link>
            </>
          ) : undefined
        }
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/notices')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button variant="outline" onClick={onDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download PDF
            </Button>
            {isDraft ? (
              <Button onClick={() => setIssueOpen(true)}>
                <Send className="size-4" />
                Issue notice
              </Button>
            ) : null}
            {isAdmin ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <NoticeStatusBadge status={notice.status} />
        <span>Created {formatDate(notice.createdAt)}</span>
        {notice.issuedAt ? (
          <span>· Issued {formatDateTime(notice.issuedAt)}</span>
        ) : null}
        {notice.effectiveDate ? (
          <span>· Effective {formatDate(notice.effectiveDate)}</span>
        ) : null}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Notice document</CardTitle>
          {isDraft && !editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  rows={16}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setTitle(notice.title);
                    setBody(notice.body);
                  }}
                  disabled={updateNotice.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={updateNotice.isPending}>
                  {updateNotice.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Save changes
                </Button>
              </div>
            </div>
          ) : (
            <article className="space-y-4">
              <h2 className="text-lg font-semibold">{notice.title}</h2>
              <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-4 font-sans text-sm leading-relaxed">
                {notice.body}
              </pre>
            </article>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        title="Issue this notice?"
        description="Once issued, the notice is finalized and can no longer be edited. If email is configured, it will be sent to the tenant with the PDF attached."
        confirmLabel="Issue notice"
        loading={issueNotice.isPending}
        onConfirm={() =>
          issueNotice.mutate(undefined, {
            onSuccess: (issued) => {
              setIssueOpen(false);
              toast.success(
                issued.emailSent
                  ? 'Notice issued and emailed to the tenant.'
                  : 'Notice issued. (Email not sent — SMTP not configured.)',
              );
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this notice?"
        description="This permanently removes the notice. This cannot be undone."
        confirmLabel="Delete notice"
        destructive
        loading={deleteNotice.isPending}
        onConfirm={() =>
          deleteNotice.mutate(notice.id, {
            onSuccess: () => {
              toast.success('Notice deleted.');
              router.push('/notices');
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />
    </>
  );
}
