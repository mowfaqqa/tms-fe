'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  DoorClosed,
  DoorOpen,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { OccupancyBadge } from '@/components/properties/occupancy-badge';
import { ConfirmVacancyDialog } from '@/components/properties/confirm-vacancy-dialog';
import { PartPaymentBadge } from '@/components/tenants/part-payment-badge';
import { TenantStatusBadge } from '@/components/tenants/tenant-status-badge';
import {
  useClearVacancy,
  useDeleteProperty,
  useProperty,
  usePropertyTenants,
} from '@/lib/hooks/use-properties';
import { useReport } from '@/lib/hooks/use-reports';
import { useAuth } from '@/lib/auth/auth-context';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatDate } from '@/lib/format';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: property, isLoading } = useProperty(id);
  const { data: tenants } = usePropertyTenants(id);
  const { data: assignedReport } = useReport('assigned-properties', isAdmin);
  const deleteProperty = useDeleteProperty();
  const clearVacancy = useClearVacancy(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reverseVacancyOpen, setReverseVacancyOpen] = useState(false);

  const assignedStaff = isAdmin
    ? assignedReport?.rows
        .filter((staff) =>
          staff.staffAssignments.some((a) => a.property.id === id),
        )
        .map((staff) => staff.fullName)
    : undefined;

  if (isLoading || !property) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={property.address}
        description={`Unit ${property.unitNumber}${property.label ? ` · ${property.label}` : ''}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/properties')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button asChild>
              <Link href={`/properties/${property.id}/edit`}>
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

      <div className="flex flex-wrap items-center gap-2">
        <OccupancyBadge status={property.occupancyStatus} />
        <PartPaymentBadge isPartPayment={property.hasPartPayment} />
        <span className="text-sm text-muted-foreground">
          {property.occupantCount} tenant
          {property.occupantCount === 1 ? '' : 's'} in occupation · Added{' '}
          {formatDate(property.createdAt)}
        </span>
      </div>

      {/*
        Occupancy is a judgement someone has to make, so the page says which
        way it currently reads and offers the one action that changes it.
      */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0 gap-4">
          <div className="space-y-1">
            <CardTitle>Occupancy</CardTitle>
            <p className="text-sm text-muted-foreground">
              {property.occupancyStatus === 'VACANT'
                ? property.vacatedAt
                  ? `Confirmed vacant on ${formatDate(property.vacatedAt)}.`
                  : 'Never let — no tenancy has been recorded here.'
                : property.occupancyStatus === 'OCCUPIED_EXPIRED'
                  ? 'The tenancy has expired but the tenant has not been confirmed out. Renew it, issue a notice to quit, or confirm the property vacant.'
                  : 'A tenancy is running here.'}
            </p>
            {property.vacancyNote ? (
              <p className="text-sm text-muted-foreground">
                “{property.vacancyNote}”
              </p>
            ) : null}
          </div>
          {property.occupancyStatus === 'VACANT' ? (
            property.vacatedAt ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReverseVacancyOpen(true)}
              >
                <DoorOpen className="size-4" />
                Reverse vacancy
              </Button>
            ) : null
          ) : (
            <ConfirmVacancyDialog
              property={property}
              trigger={
                <Button variant="outline" size="sm">
                  <DoorClosed className="size-4" />
                  Confirm vacant
                </Button>
              }
            />
          )}
        </CardHeader>
      </Card>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Assigned staff</CardTitle>
          </CardHeader>
          <CardContent>
            {!assignedStaff || assignedStaff.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No staff are currently assigned to this property.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2 text-sm">
                {assignedStaff.map((name) => (
                  <li
                    key={name}
                    className="rounded-full bg-muted px-3 py-1 text-muted-foreground"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Tenants</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/tenants/new?propertyId=${property.id}`}>
              <Plus className="size-4" />
              Add tenant
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!tenants || tenants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No tenants yet"
              description="Assign a tenant to this property to start tracking their tenancy."
            />
          ) : (
            <ul className="divide-y">
              {tenants.map((tenant) => (
                <li key={tenant.id}>
                  <Link
                    href={`/tenants/${tenant.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:bg-muted/40"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{tenant.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        Tenancy ends {formatDate(tenant.tenancyEndDate)}
                      </p>
                    </div>
                    <TenantStatusBadge status={tenant.status} />
                    <PartPaymentBadge
                      isPartPayment={tenant.isPartPayment}
                      isFullyPaid={tenant.payments?.isFullyPaid}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={reverseVacancyOpen}
        onOpenChange={setReverseVacancyOpen}
        title="Reverse this vacancy?"
        description="For a vacancy confirmed in error. The property goes back to reading occupied off its tenancies."
        confirmLabel="Reverse vacancy"
        loading={clearVacancy.isPending}
        onConfirm={() =>
          clearVacancy.mutate(undefined, {
            onSuccess: () => {
              toast.success('Vacancy reversed.');
              setReverseVacancyOpen(false);
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this property?"
        description="Properties with tenants cannot be deleted. This cannot be undone."
        confirmLabel="Delete property"
        destructive
        loading={deleteProperty.isPending}
        onConfirm={() =>
          deleteProperty.mutate(property.id, {
            onSuccess: () => {
              toast.success('Property deleted.');
              router.push('/properties');
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />
    </>
  );
}
