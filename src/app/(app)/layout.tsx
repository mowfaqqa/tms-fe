'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/lib/auth/auth-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
