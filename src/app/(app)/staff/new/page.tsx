'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { RequireAdmin } from '@/components/shared/require-admin';
import { PropertyAssignmentPicker } from '@/components/staff/property-assignment-picker';
import { useCreateStaff } from '@/lib/hooks/use-staff';
import { getApiErrorMessage } from '@/lib/api/errors';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

function NewStaffContent() {
  const router = useRouter();
  const createStaff = useCreateStaff();
  const [propertyIds, setPropertyIds] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const handle = (values: FormValues) => {
    createStaff.mutate(
      { ...values, propertyIds: propertyIds.length ? propertyIds : undefined },
      {
        onSuccess: (staff) => {
          toast.success('Staff account created.');
          router.push(`/staff/${staff.id}`);
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Add staff"
        description="Create a staff account and optionally assign properties now."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handle)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Staff" {...field} />
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
                        <Input
                          type="email"
                          placeholder="jane@atproperties.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Temporary password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Assigned properties (optional)</Label>
                <PropertyAssignmentPicker
                  selected={propertyIds}
                  onChange={setPropertyIds}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/staff')}
                  disabled={createStaff.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createStaff.isPending}>
                  {createStaff.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Create staff
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

export default function NewStaffPage() {
  return (
    <RequireAdmin>
      <NewStaffContent />
    </RequireAdmin>
  );
}
