'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { RequireAdmin } from '@/components/shared/require-admin';
import { StaffStatusBadge } from '@/components/staff/staff-status-badge';
import { PropertyAssignmentPicker } from '@/components/staff/property-assignment-picker';
import {
  useAssignStaffProperties,
  useDeactivateStaff,
  useReactivateStaff,
  useStaffMember,
} from '@/lib/hooks/use-staff';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatDate } from '@/lib/format';
import type { StaffUser } from '@/lib/types';

function StaffDetailLoaded({ staff }: { staff: StaffUser }) {
  const router = useRouter();
  const deactivate = useDeactivateStaff();
  const reactivate = useReactivateStaff();
  const assignProperties = useAssignStaffProperties(staff.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [propertyIds, setPropertyIds] = useState<string[]>(() =>
    staff.staffAssignments.map((a) => a.propertyId),
  );

  const dirty =
    JSON.stringify([...propertyIds].sort()) !==
    JSON.stringify([...staff.staffAssignments.map((a) => a.propertyId)].sort());

  return (
    <>
      <PageHeader
        title={staff.fullName}
        description={staff.email}
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/staff')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button asChild>
              <Link href={`/staff/${staff.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            {staff.isActive ? (
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                <PowerOff className="size-4" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  reactivate.mutate(staff.id, {
                    onSuccess: () => toast.success('Staff account reactivated.'),
                    onError: (e) => toast.error(getApiErrorMessage(e)),
                  })
                }
                disabled={reactivate.isPending}
              >
                <Power className="size-4" />
                Reactivate
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-2">
        <StaffStatusBadge isActive={staff.isActive} />
        <span className="text-sm text-muted-foreground">
          Added {formatDate(staff.createdAt)}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned properties</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyAssignmentPicker
            selected={propertyIds}
            onChange={setPropertyIds}
          />
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {dirty ? (
            <Button
              variant="outline"
              onClick={() =>
                setPropertyIds(
                  staff.staffAssignments.map((a) => a.propertyId),
                )
              }
              disabled={assignProperties.isPending}
            >
              Reset
            </Button>
          ) : null}
          <Button
            onClick={() =>
              assignProperties.mutate(propertyIds, {
                onSuccess: () => toast.success('Property assignments saved.'),
                onError: (e) => toast.error(getApiErrorMessage(e)),
              })
            }
            disabled={!dirty || assignProperties.isPending}
          >
            Save assignments
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Deactivate this staff account?"
        description="They will no longer be able to log in. Their property assignments and history are kept, so this can be reversed later."
        confirmLabel="Deactivate"
        destructive
        loading={deactivate.isPending}
        onConfirm={() =>
          deactivate.mutate(staff.id, {
            onSuccess: () => {
              toast.success('Staff account deactivated.');
              setConfirmOpen(false);
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />
    </>
  );
}

function StaffDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { data: staff, isLoading } = useStaffMember(id);

  if (isLoading || !staff) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return <StaffDetailLoaded key={staff.id} staff={staff} />;
}

export default function StaffDetailPage() {
  return (
    <RequireAdmin>
      <StaffDetailContent />
    </RequireAdmin>
  );
}
