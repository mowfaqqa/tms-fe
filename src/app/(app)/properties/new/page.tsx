'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { RequireAdmin } from '@/components/shared/require-admin';
import { PropertyForm } from '@/components/properties/property-form';
import { useCreateProperty } from '@/lib/hooks/use-properties';
import { getApiErrorMessage } from '@/lib/api/errors';

function NewPropertyContent() {
  const router = useRouter();
  const createProperty = useCreateProperty();

  return (
    <>
      <PageHeader
        title="Add property"
        description="Register a property before assigning tenants or staff to it."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          <PropertyForm
            submitLabel="Create property"
            submitting={createProperty.isPending}
            onCancel={() => router.push('/properties')}
            onSubmit={(payload) =>
              createProperty.mutate(payload, {
                onSuccess: (property) => {
                  toast.success('Property created.');
                  router.push(`/properties/${property.id}`);
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

export default function NewPropertyPage() {
  return (
    <RequireAdmin>
      <NewPropertyContent />
    </RequireAdmin>
  );
}
