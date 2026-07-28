'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { PropertyForm } from '@/components/properties/property-form';
import { useProperty, useUpdateProperty } from '@/lib/hooks/use-properties';
import { getApiErrorMessage } from '@/lib/api/errors';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: property, isLoading } = useProperty(id);
  const updateProperty = useUpdateProperty(id);

  return (
    <>
      <PageHeader
        title="Edit property"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          {isLoading || !property ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <PropertyForm
              submitLabel="Save changes"
              submitting={updateProperty.isPending}
              onCancel={() => router.push(`/properties/${id}`)}
              defaultValues={{
                address: property.address,
                unitNumber: property.unitNumber,
                label: property.label ?? '',
              }}
              onSubmit={(payload) =>
                updateProperty.mutate(payload, {
                  onSuccess: () => {
                    toast.success('Property updated.');
                    router.push(`/properties/${id}`);
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
