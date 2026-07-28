'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { TenantForm } from '@/components/tenants/tenant-form';
import { useCreateTenant } from '@/lib/hooks/use-tenants';
import { getApiErrorMessage } from '@/lib/api/errors';

function NewTenantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') ?? undefined;
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
            defaultValues={propertyId ? { propertyId } : undefined}
            onCancel={() => router.push('/tenants')}
            onSubmit={(payload) =>
              createTenant.mutate(payload, {
                onSuccess: (tenant) => {
                  toast.success('Tenant created — reminders generated.');
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

export default function NewTenantPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <NewTenantContent />
    </Suspense>
  );
}
