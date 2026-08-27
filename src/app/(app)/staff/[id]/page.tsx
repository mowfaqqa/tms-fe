'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Pencil, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { RequireAdmin } from '@/components/shared/require-admin';
import { StaffStatusBadge } from '@/components/staff/staff-status-badge';
import { StaffActivityFeed } from '@/components/staff/staff-activity-feed';
import { StaffIssuesPanel } from '@/components/staff/staff-issues-panel';
import { OccupancyBadge } from '@/components/properties/occupancy-badge';
import {
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const assignments = staff.staffAssignments;

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

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">
            Assigned properties
            {assignments.length ? (
              <span className="ml-1.5 text-muted-foreground">
                {assignments.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="issues">Reported issues</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card>
            <CardContent>
              {assignments.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No properties assigned"
                  description="This staff member can't see any tenants, notices, or reminders until a property is assigned to them."
                  action={
                    <Button asChild>
                      <Link href={`/staff/${staff.id}/edit`}>
                        <Pencil className="size-4" />
                        Assign properties
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Landlord</TableHead>
                        <TableHead className="text-right">Tenants</TableHead>
                        <TableHead>Occupancy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((a) => (
                        <TableRow
                          key={a.id}
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/properties/${a.propertyId}`)
                          }
                        >
                          {/* Addresses run long — let them wrap so the occupancy
                          columns stay visible without horizontal scrolling. */}
                          <TableCell className="whitespace-normal">
                            <div className="font-medium">
                              {a.property.address}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Unit {a.property.unitNumber}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-normal text-muted-foreground">
                            {a.property.label ?? '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {a.property.activeTenantCount}
                          </TableCell>
                          <TableCell>
                            <OccupancyBadge
                              status={a.property.occupancyStatus}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>What this staff member has done</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffActivityFeed staffId={staff.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Issues they escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffIssuesPanel staffId={staff.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
