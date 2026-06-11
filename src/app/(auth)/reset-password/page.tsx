'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error('Missing or invalid reset token.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, values.newPassword);
      toast.success('Password reset. You can now sign in.');
      router.replace('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not reset password'));
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>
          {token
            ? 'Choose a new password for your account.'
            : 'This link is missing a reset token. Request a new one.'}
        </CardDescription>
      </CardHeader>
      {token ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      ) : (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
