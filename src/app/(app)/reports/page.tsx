'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { ReportView } from '@/components/reports/report-view';

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Review tenancy data and export it for record-keeping."
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Expirations</TabsTrigger>
          <TabsTrigger value="active">Active Tenants</TabsTrigger>
          <TabsTrigger value="expired">Expired Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardContent>
              <ReportView
                reportKey="upcoming"
                filename="upcoming-expirations.csv"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card>
            <CardContent>
              <ReportView reportKey="active" filename="active-tenants.csv" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expired">
          <Card>
            <CardContent>
              <ReportView reportKey="expired" filename="expired-tenants.csv" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
