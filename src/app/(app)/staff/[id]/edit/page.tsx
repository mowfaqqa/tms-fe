'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { RequireAdmin } from '@/components/shared/require-admin';
import { PropertyAssignmentPicker } from '@/components/staff/property-assignment-picker';
import {
  useAssignStaffProperties,
  useStaffMember,
  useUpdateStaff,
} from '@/lib/hooks/use-staff';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { StaffUser } from '@/lib/types';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

const sameIds = (a: string[], b: string[]) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

function EditStaffForm({ staff }: { staff: StaffUser }) {
  const router = useRouter();
  const updateStaff = useUpdateStaff(staff.id);
  const assignProperties = useAssignStaffProperties(staff.id);

  const assignedIds = staff.staffAssignments.map((a) => a.propertyId);
  const [propertyIds, setPropertyIds] = useState<string[]>(assignedIds);

  // The current assignments are already loaded here, so the picker can name
  // them without waiting to page to whichever page they sit on.
  const assignedLabels = Object.fromEntries(
    staff.staffAssignments.map((a) => [
      a.propertyId,
      `${a.property.address}, Unit ${a.property.unitNumber}`,
    ]),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: staff.fullName, email: staff.email },
  });

  const saving = updateStaff.isPending || assignProperties.isPending;

  // Details and assignments are two separate endpoints, so only send what
  // actually changed — and don't navigate away until both have landed.
  const onSubmit = async (values: FormValues) => {
    const detailsChanged =
      values.fullName !== staff.fullName || values.email !== staff.email;
    const assignmentsChanged = !sameIds(propertyIds, assignedIds);

    if (!detailsChanged && !assignmentsChanged) {
      router.push(`/staff/${staff.id}`);
      return;
    }

    try {
      if (detailsChanged) {
        await updateStaff.mutateAsync(values);
      }
      if (assignmentsChanged) {
        await assignProperties.mutateAsync(propertyIds);
      }
      toast.success('Staff account updated.');
      router.push(`/staff/${staff.id}`);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned properties</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyAssignmentPicker
              selected={propertyIds}
              onChange={setPropertyIds}
              initialLabels={assignedLabels}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/staff/${staff.id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

function EditStaffContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: staff, isLoading } = useStaffMember(id);

  return (
    <>
      <PageHeader
        title="Edit staff"
        description={staff?.fullName}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      {isLoading || !staff ? (
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : (
        <EditStaffForm key={staff.id} staff={staff} />
      )}
    </>
  );
}

export default function EditStaffPage() {
  return (
    <RequireAdmin>
      <EditStaffContent />
    </RequireAdmin>
  );
}
