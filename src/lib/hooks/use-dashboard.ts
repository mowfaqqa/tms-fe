import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { queryKeys } from '@/lib/query-keys';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics,
    queryFn: dashboardApi.metrics,
  });
}

export function useUpcomingActions() {
  return useQuery({
    queryKey: queryKeys.dashboard.upcomingActions,
    queryFn: dashboardApi.upcomingActions,
  });
}
