import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  notificationsApi,
  type NotificationListParams,
} from '@/lib/api/notifications';
import { queryKeys } from '@/lib/query-keys';

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsApi.list(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
