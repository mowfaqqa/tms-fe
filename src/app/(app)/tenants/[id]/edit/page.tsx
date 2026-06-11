'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { TenantForm } from '@/components/tenants/tenant-form';
import { useTenant, useUpdateTenant } from '@/lib/hooks/use-tenants';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function EditTenantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: tenant, isLoading } = useTenant(id);
  const updateTenant = useUpdateTenant(id);

  return (
    <>
      <PageHeader
        title="Edit tenant"
        description="Changing the tenancy end date recalculates the reminders."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          {isLoading || !tenant ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <TenantForm
              showStatus
              submitLabel="Save changes"
              submitting={updateTenant.isPending}
              onCancel={() => router.push(`/tenants/${id}`)}
              defaultValues={{
                fullName: tenant.fullName,
                phoneNumber: tenant.phoneNumber,
                email: tenant.email,
                propertyAddress: tenant.propertyAddress,
                unitNumber: tenant.unitNumber,
                tenancyStartDate: tenant.tenancyStartDate.slice(0, 10),
                tenancyEndDate: tenant.tenancyEndDate.slice(0, 10),
                rentAmount: String(tenant.rentAmount),
                status: tenant.status,
              }}
              onSubmit={(payload) =>
                updateTenant.mutate(payload, {
                  onSuccess: () => {
                    toast.success('Tenant updated.');
                    router.push(`/tenants/${id}`);
                  },
                  onError: (e) => toast.error(getApiErrorMessage(e)),
                })
              }
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
