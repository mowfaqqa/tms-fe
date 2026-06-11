'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
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

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="size-5" />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists for that address, we&apos;ve sent a link to
            reset your password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
            <Link
              href="/login"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
