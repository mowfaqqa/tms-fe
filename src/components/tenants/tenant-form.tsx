'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TenantPayload } from '@/lib/api/tenants';

const schema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Enter a valid email'),
    propertyAddress: z.string().min(1, 'Property address is required'),
    unitNumber: z.string().min(1, 'Unit number is required'),
    tenancyStartDate: z.string().min(1, 'Start date is required'),
    tenancyEndDate: z.string().min(1, 'End date is required'),
    rentAmount: z
      .string()
      .min(1, 'Rent amount is required')
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
        message: 'Enter a valid amount',
      }),
    status: z.enum(['ACTIVE', 'EXPIRED', 'RENEWED']).optional(),
  })
  .refine(
    (v) => new Date(v.tenancyEndDate) > new Date(v.tenancyStartDate),
    { message: 'End date must be after the start date', path: ['tenancyEndDate'] },
  );

export type TenantFormValues = z.infer<typeof schema>;

const EMPTY: TenantFormValues = {
  fullName: '',
  phoneNumber: '',
  email: '',
  propertyAddress: '',
  unitNumber: '',
  tenancyStartDate: '',
  tenancyEndDate: '',
  rentAmount: '',
  status: 'ACTIVE',
};

export function TenantForm({
  defaultValues,
  showStatus = false,
  submitLabel = 'Save',
  submitting = false,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<TenantFormValues>;
  showStatus?: boolean;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (payload: TenantPayload) => void;
  onCancel?: () => void;
}) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const handle = (values: TenantFormValues) => {
    const payload: TenantPayload = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      email: values.email,
      propertyAddress: values.propertyAddress,
      unitNumber: values.unitNumber,
      tenancyStartDate: values.tenancyStartDate,
      tenancyEndDate: values.tenancyEndDate,
      rentAmount: Number(values.rentAmount),
      ...(showStatus && values.status ? { status: values.status } : {}),
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tenant information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 800 000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Property information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="propertyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property address</FormLabel>
                  <FormControl>
                    <Input placeholder="12 Marina Road, Lagos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit number</FormLabel>
                  <FormControl>
                    <Input placeholder="A3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tenancy information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tenancyStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenancy start date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenancyEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenancy end date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent amount</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" placeholder="1500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showStatus ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="RENEWED">Renewed</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </section>

        <div className="flex items-center justify-end gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
