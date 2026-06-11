'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { TenantForm } from '@/components/tenants/tenant-form';
import { useCreateTenant } from '@/lib/hooks/use-tenants';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function NewTenantPage() {
  const router = useRouter();
  const createTenant = useCreateTenant();

  return (
    <>
      <PageHeader
        title="Add tenant"
        description="Reminders are generated automatically from the tenancy end date."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          <TenantForm
            submitLabel="Create tenant"
            submitting={createTenant.isPending}
            onCancel={() => router.push('/tenants')}
            onSubmit={(payload) =>
              createTenant.mutate(payload, {
                onSuccess: (tenant) => {
                  toast.success('Tenant created — 4 reminders generated.');
                  router.push(`/tenants/${tenant.id}`);
                },
                onError: (e) => toast.error(getApiErrorMessage(e)),
              })
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
