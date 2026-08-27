'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { ReportView, type ReportColumn } from '@/components/reports/report-view';
import { OccupancyBadge } from '@/components/properties/occupancy-badge';
import { TenantStatusBadge } from '@/components/tenants/tenant-status-badge';
import { ActivityChanges } from '@/components/reports/activity-changes';
import { activityActionLabel, activitySubject } from '@/lib/labels';
import { useAuth } from '@/lib/auth/auth-context';
import { exportTenantsToCsv } from '@/lib/csv';
import { formatDate, formatDateTime, formatMoney } from '@/lib/format';
import type {
  ActivityLogEntry,
  AssignedPropertiesRow,
  Property,
  Tenant,
} from '@/lib/types';

const tenantColumns: ReportColumn<Tenant>[] = [
  {
    header: 'Tenant',
    render: (t) => (
      <>
        <div className="font-medium">{t.fullName}</div>
        <div className="text-xs text-muted-foreground">{t.phoneNumber}</div>
      </>
    ),
  },
  {
    header: 'Property',
    render: (t) => (
      <>
        {t.property?.address}
        <span className="text-muted-foreground"> · {t.property?.unitNumber}</span>
      </>
    ),
  },
  { header: 'Tenancy End', render: (t) => formatDate(t.tenancyEndDate) },
  {
    header: 'Rent',
    align: 'right',
    render: (t) => formatMoney(t.rentAmount),
  },
  { header: 'Status', render: (t) => <TenantStatusBadge status={t.status} /> },
];

const propertyColumns: ReportColumn<Property>[] = [
  {
    header: 'Property',
    render: (p) => (
      <>
        <div className="font-medium">{p.address}</div>
        <div className="text-xs text-muted-foreground">Unit {p.unitNumber}</div>
      </>
    ),
  },
  { header: 'Label', render: (p) => p.label ?? '—' },
  {
    header: 'Active tenants',
    align: 'right',
    render: (p) => p.activeTenantCount,
  },
  {
    header: 'Occupancy',
    render: (p) => <OccupancyBadge status={p.occupancyStatus} />,
  },
];

const staffActivityColumns: ReportColumn<ActivityLogEntry>[] = [
  {
    header: 'When',
    render: (a) => (
      <span className="whitespace-nowrap">{formatDateTime(a.createdAt)}</span>
    ),
  },
  {
    header: 'Staff',
    // A null actor is the nightly sweep, not a missing record.
    render: (a) => a.actor?.fullName ?? <span title="Automated">System</span>,
  },
  {
    header: 'Action',
    render: (a) => {
      const subject = activitySubject(a);
      return (
        <>
          <div className="font-medium">{activityActionLabel(a.action)}</div>
          {subject ? (
            <div className="text-xs text-muted-foreground">{subject}</div>
          ) : null}
        </>
      );
    },
  },
  {
    header: 'What changed',
    render: (a) => <ActivityChanges changes={a.changes} />,
  },
];

const assignedPropertiesColumns: ReportColumn<AssignedPropertiesRow>[] = [
  { header: 'Staff', render: (s) => s.fullName },
  { header: 'Email', render: (s) => s.email },
  {
    header: 'Assigned properties',
    render: (s) =>
      s.staffAssignments.length === 0
        ? '—'
        : s.staffAssignments
            .map((a) => `${a.property.address} (Unit ${a.property.unitNumber})`)
            .join(', '),
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  // The audit log is the one report the server pages, since it grows without
  // bound; every other tab returns its full result set.
  const [activityPage, setActivityPage] = useState(1);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Review tenancy, property, and staff data and export it for record-keeping."
      />

      <Tabs defaultValue="upcoming">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="upcoming">Upcoming Expirations</TabsTrigger>
          <TabsTrigger value="active">Active Tenants</TabsTrigger>
          <TabsTrigger value="expired">Expired Tenants</TabsTrigger>
          <TabsTrigger value="recently-added">Recently Added</TabsTrigger>
          <TabsTrigger value="vacant-properties">Vacant Properties</TabsTrigger>
          <TabsTrigger value="occupied-properties">Occupied Properties</TabsTrigger>
          {isAdmin ? (
            <>
              <TabsTrigger value="assigned-properties">
                Assigned Properties
              </TabsTrigger>
              <TabsTrigger value="staff-activity">Staff Activity</TabsTrigger>
            </>
          ) : null}
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardContent>
              <ReportView
                reportKey="upcoming"
                filename="upcoming-expirations.csv"
                columns={tenantColumns}
                rowKey={(t) => t.id}
                onRowClick={(t) => router.push(`/tenants/${t.id}`)}
                exportCsv={exportTenantsToCsv}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card>
            <CardContent>
              <ReportView
                reportKey="active"
                filename="active-tenants.csv"
                columns={tenantColumns}
                rowKey={(t) => t.id}
                onRowClick={(t) => router.push(`/tenants/${t.id}`)}
                exportCsv={exportTenantsToCsv}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expired">
          <Card>
            <CardContent>
              <ReportView
                reportKey="expired"
                filename="expired-tenants.csv"
                columns={tenantColumns}
                rowKey={(t) => t.id}
                onRowClick={(t) => router.push(`/tenants/${t.id}`)}
                exportCsv={exportTenantsToCsv}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recently-added">
          <Card>
            <CardContent>
              <ReportView
                reportKey="recently-added"
                filename="recently-added-tenants.csv"
                columns={tenantColumns}
                rowKey={(t) => t.id}
                onRowClick={(t) => router.push(`/tenants/${t.id}`)}
                exportCsv={exportTenantsToCsv}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vacant-properties">
          <Card>
            <CardContent>
              <ReportView
                reportKey="vacant-properties"
                filename="vacant-properties.csv"
                columns={propertyColumns}
                rowKey={(p) => p.id}
                onRowClick={(p) => router.push(`/properties/${p.id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="occupied-properties">
          <Card>
            <CardContent>
              <ReportView
                reportKey="occupied-properties"
                filename="occupied-properties.csv"
                columns={propertyColumns}
                rowKey={(p) => p.id}
                onRowClick={(p) => router.push(`/properties/${p.id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        {isAdmin ? (
          <>
            <TabsContent value="assigned-properties">
              <Card>
                <CardContent>
                  <ReportView
                    reportKey="assigned-properties"
                    filename="assigned-properties.csv"
                    columns={assignedPropertiesColumns}
                    rowKey={(s) => s.id}
                    onRowClick={(s) => router.push(`/staff/${s.id}`)}
                    enabled={isAdmin}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="staff-activity">
              <Card>
                <CardContent>
                  <ReportView
                    reportKey="staff-activity"
                    filename="staff-activity.csv"
                    columns={staffActivityColumns}
                    rowKey={(a) => a.id}
                    enabled={isAdmin}
                    page={activityPage}
                    onPageChange={setActivityPage}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </>
  );
}
