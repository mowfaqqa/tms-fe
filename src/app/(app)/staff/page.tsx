'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { RequireAdmin } from '@/components/shared/require-admin';
import { StaffTable } from '@/components/staff/staff-table';
import { useStaffList } from '@/lib/hooks/use-staff';
import { useDebounce } from '@/lib/hooks/use-debounce';

function StaffContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('search') ?? '');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('search', debouncedSearch);
    const query = qs.toString();
    router.replace(query ? `/staff?${query}` : '/staff', { scroll: false });
  }, [debouncedSearch, router]);

  const queryParams = useMemo(
    () => ({ page, limit: 20, search: debouncedSearch || undefined }),
    [page, debouncedSearch],
  );

  const { data, isLoading } = useStaffList(queryParams);

  return (
    <>
      <PageHeader
        title="Staff Management"
        description="Add, edit, deactivate staff, and manage their assigned properties."
        actions={
          <Button asChild>
            <Link href="/staff/new">
              <Plus className="size-4" />
              Add staff
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={UserCog}
              title="No staff found"
              description="Add a staff account to get started."
              action={
                <Button asChild size="sm">
                  <Link href="/staff/new">
                    <Plus className="size-4" />
                    Add staff
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              <StaffTable staff={data.data} />
              <PaginationBar meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function StaffPage() {
  return (
    <RequireAdmin>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <StaffContent />
      </Suspense>
    </RequireAdmin>
  );
}
