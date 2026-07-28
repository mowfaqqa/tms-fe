'use client';

import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useStaffMember, useUpdateStaff } from '@/lib/hooks/use-staff';
import { getApiErrorMessage } from '@/lib/api/errors';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

function EditStaffContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: staff, isLoading } = useStaffMember(id);
  const updateStaff = useUpdateStaff(id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: staff
      ? { fullName: staff.fullName, email: staff.email }
      : undefined,
  });

  return (
    <>
      <PageHeader
        title="Edit staff"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          {isLoading || !staff ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  updateStaff.mutate(values, {
                    onSuccess: () => {
                      toast.success('Staff account updated.');
                      router.push(`/staff/${id}`);
                    },
                    onError: (e) => toast.error(getApiErrorMessage(e)),
                  }),
                )}
                className="space-y-6"
              >
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
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/staff/${id}`)}
                    disabled={updateStaff.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateStaff.isPending}>
                    {updateStaff.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Save changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
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
