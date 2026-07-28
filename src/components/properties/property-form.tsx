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
import type { PropertyPayload } from '@/lib/api/properties';

const schema = z.object({
  address: z.string().min(1, 'Address is required'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  label: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof schema>;

const EMPTY: PropertyFormValues = { address: '', unitNumber: '', label: '' };

export function PropertyForm({
  defaultValues,
  submitLabel = 'Save',
  submitting = false,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<PropertyFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (payload: PropertyPayload) => void;
  onCancel?: () => void;
}) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const handle = (values: PropertyFormValues) => {
    onSubmit({
      address: values.address,
      unitNumber: values.unitNumber,
      label: values.label || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handle)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
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
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Label (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Marina Heights Block A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
