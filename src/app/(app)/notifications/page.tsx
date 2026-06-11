'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellOff, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/lib/hooks/use-notifications';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatDateTime, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications({
    page,
    limit: 20,
    unreadOnly: tab === 'unread',
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reminders that have fired and other system alerts."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              markAllRead.mutate(undefined, {
                onSuccess: (res) =>
                  toast.success(`Marked ${res.updated} as read.`),
                onError: (e) => toast.error(getApiErrorMessage(e)),
              })
            }
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'all' | 'unread');
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title={tab === 'unread' ? 'No unread notifications' : 'No notifications'}
              description="You're all caught up."
            />
          ) : (
            <>
              <ul className="divide-y">
                {data.data.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'flex items-start justify-between gap-4 py-4',
                      !n.isRead && 'bg-primary/5 -mx-2 rounded-md px-2',
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!n.isRead ? (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                        <p className="text-sm font-medium">{n.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(n.createdAt)} · {formatRelative(n.createdAt)}
                        {n.tenant ? (
                          <>
                            {' · '}
                            <Link
                              href={`/tenants/${n.tenantId}`}
                              className="hover:underline"
                            >
                              {n.tenant.fullName}
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                    {!n.isRead ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          markRead.mutate(n.id, {
                            onError: (e) =>
                              toast.error(getApiErrorMessage(e)),
                          })
                        }
                        disabled={markRead.isPending}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
              <PaginationBar meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
