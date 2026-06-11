'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { TenantStatusBadge } from '@/components/tenants/tenant-status-badge';
import { RemindersTimeline } from '@/components/tenants/reminders-timeline';
import { GenerateNoticeDialog } from '@/components/notices/generate-notice-dialog';
import { NoticeStatusBadge } from '@/components/notices/notice-status-badge';
import { NOTICE_TYPE_LABELS } from '@/lib/labels';
import {
  useDeleteTenant,
  useTenant,
  useTenantNotices,
} from '@/lib/hooks/use-tenants';
import { useAuth } from '@/lib/auth/auth-context';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatDate, formatMoney } from '@/lib/format';

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: tenant, isLoading } = useTenant(id);
  const { data: notices } = useTenantNotices(id);
  const deleteTenant = useDeleteTenant();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !tenant) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={tenant.fullName}
        description={`${tenant.propertyAddress} · Unit ${tenant.unitNumber}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/tenants')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <GenerateNoticeDialog
              tenantId={tenant.id}
              tenantName={tenant.fullName}
              trigger={
                <Button variant="outline">
                  <FileText className="size-4" />
                  Generate notice
                </Button>
              }
            />
            <Button asChild>
              <Link href={`/tenants/${tenant.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            {isAdmin ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex items-center gap-2">
        <TenantStatusBadge status={tenant.status} />
        <span className="text-sm text-muted-foreground">
          Added {formatDate(tenant.createdAt)}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow icon={Phone} label="Phone" value={tenant.phoneNumber} />
          <InfoRow icon={Mail} label="Email" value={tenant.email} />
          <InfoRow
            icon={MapPin}
            label="Property"
            value={`${tenant.propertyAddress}, Unit ${tenant.unitNumber}`}
          />
          <Separator className="sm:col-span-2 lg:col-span-3" />
          <InfoRow
            label="Tenancy start"
            value={formatDate(tenant.tenancyStartDate)}
          />
          <InfoRow
            label="Tenancy end"
            value={formatDate(tenant.tenancyEndDate)}
          />
          <InfoRow
            label="Rent amount"
            value={formatMoney(tenant.rentAmount)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <RemindersTimeline tenantId={tenant.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Notices</CardTitle>
          <GenerateNoticeDialog
            tenantId={tenant.id}
            tenantName={tenant.fullName}
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                New notice
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {!notices || notices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notices yet"
              description="Generate a quit, renewal, or general notice for this tenant."
            />
          ) : (
            <ul className="divide-y">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <Link
                    href={`/notices/${notice.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:bg-muted/40"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {NOTICE_TYPE_LABELS[notice.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(notice.createdAt)}
                        {notice.issuedAt
                          ? ` · Issued ${formatDate(notice.issuedAt)}`
                          : ''}
                      </p>
                    </div>
                    <NoticeStatusBadge status={notice.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this tenant?"
        description="This permanently removes the tenant along with their reminders and notices. This cannot be undone."
        confirmLabel="Delete tenant"
        destructive
        loading={deleteTenant.isPending}
        onConfirm={() =>
          deleteTenant.mutate(tenant.id, {
            onSuccess: () => {
              toast.success('Tenant deleted.');
              router.push('/tenants');
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />
    </>
  );
}
