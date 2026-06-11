'use client';

import Link from 'next/link';
import {
  AlarmClock,
  CalendarClock,
  CalendarX,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { UpcomingActionsTable } from '@/components/dashboard/upcoming-actions-table';
import { useDashboardMetrics } from '@/lib/hooks/use-dashboard';
import { useRunSweep } from '@/lib/hooks/use-reminders';
import { useAuth } from '@/lib/auth/auth-context';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { data: metrics, isLoading } = useDashboardMetrics();
  const runSweep = useRunSweep();

  const onRunSweep = () => {
    runSweep.mutate(undefined, {
      onSuccess: (res) =>
        toast.success(
          `Sweep complete: ${res.triggered} reminder(s) triggered, ${res.expiredTenants} tenancy(ies) expired.`,
        ),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    });
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of tenancies and upcoming reminder actions."
        actions={
          <>
            {isAdmin ? (
              <Button
                variant="outline"
                onClick={onRunSweep}
                disabled={runSweep.isPending}
              >
                <RefreshCw
                  className={runSweep.isPending ? 'size-4 animate-spin' : 'size-4'}
                />
                Run reminder sweep
              </Button>
            ) : null}
            <Button asChild>
              <Link href="/tenants/new">
                <Plus className="size-4" />
                Add tenant
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Active Tenants"
          value={metrics?.totalActiveTenants ?? 0}
          icon={Users}
          href="/tenants?status=ACTIVE"
          loading={isLoading}
        />
        <MetricCard
          label="Expiring within 6 months"
          value={metrics?.expiringWithin6Months ?? 0}
          icon={CalendarClock}
          href="/tenants?expiring=6m"
          tone="warning"
          loading={isLoading}
        />
        <MetricCard
          label="Expiring within 3 months"
          value={metrics?.expiringWithin3Months ?? 0}
          icon={AlarmClock}
          href="/tenants?expiring=3m"
          tone="warning"
          loading={isLoading}
        />
        <MetricCard
          label="Expiring within 30 days"
          value={metrics?.expiringWithin30Days ?? 0}
          icon={AlarmClock}
          href="/tenants?expiring=30d"
          tone="danger"
          loading={isLoading}
        />
        <MetricCard
          label="Expired Tenancies"
          value={metrics?.expiredTenancies ?? 0}
          icon={CalendarX}
          href="/tenants?expiring=expired"
          tone="danger"
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Actions</CardTitle>
          <CardDescription>
            Reminders that are due or pending follow-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpcomingActionsTable />
        </CardContent>
      </Card>
    </>
  );
}
