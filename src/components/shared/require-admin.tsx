'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/lib/auth/auth-context';

/** Gates a page to ADMIN users, redirecting STAFF back to the dashboard. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [loading, isAdmin, router]);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="This page is only available to the Super Admin."
      />
    );
  }

  return <>{children}</>;
}
